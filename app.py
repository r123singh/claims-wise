from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import asyncio
from agent import triage_agent, InsuranceClaimContext
import os
from agents import (Runner, 
                    MessageOutputItem, 
                    TResponseInputItem,
                    ItemHelpers,
                    HandoffOutputItem,
                    ToolCallItem,
                    ToolCallOutputItem,
                    trace)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.context = InsuranceClaimContext()
        self.messages: List[TResponseInputItem] = []


    async def process_message(self, message: str) -> str:
        with trace("Claims Agent", group_id=self.session_id):
            # Add user message to history
            self.messages.append({
                "role": "user",
                "content": message
            })

            response = await Runner.run(
                triage_agent,
                self.messages,
                context=self.context
            )

            # Extract bot response
            bot_response = []
            for new_item in response.new_items:
                if isinstance(new_item, MessageOutputItem):
                    bot_response.append(ItemHelpers.text_message_output(new_item))
                elif isinstance(new_item, HandoffOutputItem):
                    print(f"Handed off from {new_item.source_agent.name} to {new_item.target_agent.name}")
                    # bot_response.append(f"Handed off from {new_item.source_agent.name} to {new_item.target_agent.name}")
                elif isinstance(new_item, ToolCallItem):
                    print("Calling a tool")
                    # bot_response.append("Calling a tool")
                elif isinstance(new_item, ToolCallOutputItem):
                    print(f"Tool call output: {new_item.output}")
                    # bot_response.append(f"Tool call output: {new_item.output}")
                else:
                    print(f"Skipping item: {new_item.__class__.__name__}")
                    # bot_response.append(f"Skipping item: {new_item.__class__.__name__}")
        
            self.messages = response.to_input_list()
            return "\n".join(bot_response).strip()

# Store active chat sessions
active_sessions = {}

@app.websocket("/ws/chat/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    
    # Create new session if doesn't exist
    if session_id not in active_sessions:
        active_sessions[session_id] = ChatSession(session_id)
    
    session = active_sessions[session_id]
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process message through agent
            response = await session.process_message(message_data["message"])
            
            # Send response back to client
            await websocket.send_json({
                "message": response,
                "from_user": False
            })
            
    except WebSocketDisconnect:
        # Clean up session on disconnect
        if session_id in active_sessions:
            del active_sessions[session_id]

@app.get("/")
async def root():
    return {"message": "Claims Agent API is running"}

if __name__ == "__main__":
    # This is to run the application on the local machine.
    # import uvicorn
    # uvicorn.run(app, host="127.0.0.1", port=8000)

    # This is to run the application on the render.com server.
    # import uvicorn
    # port = os.environ.get("PORT", 4000)
    # uvicorn.run(app, host="0.0.0.0", port=port)
    
    # For render.com deployment, we need to ensure the port is properly bound
    # and the server is accessible from outside
    import uvicorn
    port = int(os.environ.get("PORT", 4000))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")