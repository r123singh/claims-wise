
from __future__ import annotations as _annotations

import asyncio
import random
import uuid

from pydantic import BaseModel

from agents import (
    Agent,
    HandoffOutputItem,
    ItemHelpers,
    MessageOutputItem,
    RunContextWrapper,
    Runner,
    ToolCallItem,
    ToolCallOutputItem,
    TResponseInputItem,
    function_tool,
    handoff,
    trace,
)
from agents.extensions.handoff_prompt import RECOMMENDED_PROMPT_PREFIX

### CONTEXT


class InsuranceClaimContext(BaseModel):
    claimant_name: str | None = None
    claim_number: str | None = None
    claim_type: str | None = None
    policy_number: str | None = None


### TOOLS


@function_tool(
    name_override="faq_lookup_tool", description_override="Lookup frequently asked questions about insurance claims."
)
async def faq_lookup_tool(question: str) -> str:
    if "coverage" in question or "policy" in question:
        return (
            "Our standard policy covers property damage, liability, and medical expenses. "
            "Additional coverage options include flood insurance and earthquake protection."
        )
    elif "process" in question or "timeline" in question:
        return (
            "The typical claim process takes 7-14 business days. "
            "We require documentation within 30 days of the incident. "
            "Payment is typically issued within 5 business days after approval."
        )
    elif "deductible" in question:
        return "Standard deductible is $500, but can be adjusted based on your policy level."
    return "I'm sorry, I don't know the answer to that question."


@function_tool
async def update_claim(
    context: RunContextWrapper[InsuranceClaimContext], claim_number: str, claim_type: str
) -> str:
    """
    Update the claim type for a given claim number.

    Args:
        claim_number: The claim number for the insurance claim.
        claim_type: The type of claim to update to.
    """
    # Update the context based on the customer's input
    context.context.claim_number = claim_number
    context.context.claim_type = claim_type
    # Ensure that the policy number has been set by the incoming handoff
    assert context.context.policy_number is not None, "Policy number is required"
    return f"Updated claim type to {claim_type} for claim number {claim_number}"


### HOOKS


async def on_claim_handoff(context: RunContextWrapper[InsuranceClaimContext]) -> None:
    policy_number = f"POL-{random.randint(1000, 9999)}"
    context.context.policy_number = policy_number


### AGENTS

faq_agent = Agent[InsuranceClaimContext](
    name="FAQ Agent",
    handoff_description="A helpful agent that can answer questions about insurance claims.",
    instructions=f"""{RECOMMENDED_PROMPT_PREFIX}
    You are an FAQ agent. If you are speaking to a customer, you probably were transferred to from the triage agent.
    Use the following routine to support the customer.
    # Routine
    1. Identify the last question asked by the customer.
    2. Use the faq lookup tool to answer the question. Do not rely on your own knowledge.
    3. If you cannot answer the question, transfer back to the triage agent.""",
    tools=[faq_lookup_tool],
)

claim_agent = Agent[InsuranceClaimContext](
    name="Claim Agent",
    handoff_description="A helpful agent that can update claim information.",
    instructions=f"""{RECOMMENDED_PROMPT_PREFIX}
    You are a claim agent. If you are speaking to a customer, you probably were transferred to from the triage agent.
    Use the following routine to support the customer.
    # Routine
    1. Ask for their claim number.
    2. Ask the customer what type of claim they need to file.
    3. Use the update claim tool to update the claim information.
    If the customer asks a question that is not related to the routine, transfer back to the triage agent. """,
    tools=[update_claim],
)

triage_agent = Agent[InsuranceClaimContext](
    name="Triage Agent",
    handoff_description="A triage agent that can delegate a customer's request to the appropriate agent.",
    instructions=(
        f"{RECOMMENDED_PROMPT_PREFIX} "
        "You are a helpful triaging agent. You can use your tools to delegate questions to other appropriate agents."
    ),
    handoffs=[
        faq_agent,
        handoff(agent=claim_agent, on_handoff=on_claim_handoff),
    ],
)

faq_agent.handoffs.append(triage_agent)
claim_agent.handoffs.append(triage_agent)


### RUN


async def main():
    current_agent: Agent[InsuranceClaimContext] = triage_agent
    input_items: list[TResponseInputItem] = []
    context = InsuranceClaimContext()

    # Normally, each input from the user would be an API request to your app, and you can wrap the request in a trace()
    # Here, we'll just use a random UUID for the conversation ID
    conversation_id = uuid.uuid4().hex[:16]

    while True:
        user_input = input("Enter your message: ")
        with trace("Customer service", group_id=conversation_id):
            input_items.append({"content": user_input, "role": "user"})
            result = await Runner.run(current_agent, input_items, context=context)

            for new_item in result.new_items:
                agent_name = new_item.agent.name
                if isinstance(new_item, MessageOutputItem):
                    print(f"{agent_name}: {ItemHelpers.text_message_output(new_item)}")
                elif isinstance(new_item, HandoffOutputItem):
                    print(
                        f"Handed off from {new_item.source_agent.name} to {new_item.target_agent.name}"
                    )
                elif isinstance(new_item, ToolCallItem):
                    print(f"{agent_name}: Calling a tool")
                elif isinstance(new_item, ToolCallOutputItem):
                    print(f"{agent_name}: Tool call output: {new_item.output}")
                else:
                    print(f"{agent_name}: Skipping item: {new_item.__class__.__name__}")
            input_items = result.to_input_list()
            current_agent = result.last_agent


if __name__ == "__main__":
    asyncio.run(main())