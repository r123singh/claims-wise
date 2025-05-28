# Claims-Agent ⚡ Your AI Claims Assistant ⚡

## Overview 📖

This is a pilot project for a claims agent that uses OpenAI's GPT-4 to help with insurance claims. Streamlining the insurance claims process for customers and agents alike by enabling AI led claims processing through a chatbot interface. Built using OpenAI Agents SDK it uses the latest in LLM and Agentic AI to help with claims processing.

## Repository Structure 📂

```bash
Claims-Agent/
├── frontend/
├── requirements.txt
├── .gitignore
├── README.md
├── LICENSE
├── .env.example
├── sample_queries.txt
├── agent.py
├── app.py
```
    - **app.py** is the main file to run the application server application baed on FastAPI
    - **agent.py** is the agents logic built using OpenAI Agents SDK.
    - **requirements.txt** is the dependencies for the backend part of the application and can be installed using pip install -r requirements.txt
    - **frontend** is the frontend part of the application and can be built using npm install and npm run dev

## Core Features 🚀

### Claims Buddy
- 💬 Claims Chatbot
- 🚀 Instant responses
- 🧠 Multi-step conversations
- 🔍 Contextual responses
- 🤖 Friendly Agentic AI

### Quick Actions ⚡
- 📋 FAQ & Help Center
- 📊 Claims Status Tracker
- ℹ️ Process Information Guide

### Claims Management 📝
- 📝 File New Claim
- 🏷️ Claim Types Overview
- 🔍 Check Claim Status
- 📄 Document Management
- 🔄 Claim Updates
- ⚖️ Appeal Process

### Dashboard Analytics 📈

#### Claims Analytics Dashboard 📊
- 📈 Interactive Daily Claims Chart
- 🔄 Real-time Data Updates
- 📤 Export Functionality

#### Claims Status Overview 📋
- 🎯 Animated Status Breakdown
- 🎨 Color-coded Indicators
- 🔍 Detailed Drill-down Views

#### Claims Management Center 🎯
- ⚡ Recent Claims with Priority
- 🎯 Quick Action Buttons
- 🔔 Status Notifications

#### Claims Workflow 📋
- 📝 Step-by-step Progress
- 📤 Document Upload Status
- ✅ Approval Workflow

#### Claims Documentation 📚
- 👁️ Document Preview
- 📑 Version Control
- 🔒 Secure Sharing

#### Claims Communication 💬
- 💌 Integrated Messaging
- 🔔 Automated Notifications
- 🎫 Support Ticket System

## Tech Stack 🛠️

### Backend
- Python
- FastAPI
- OpenAI Agents SDK

### Frontend
- React
- TypeScript
- Tailwind CSS

## Installation 📦

1. Clone the repository

```bash
git clone https://github.com/r123singh/claims-wise.git
``` 

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Rename the .env.example file to .env and add your OpenAI API key 

```bash
OPENAI_API_KEY=your_openai_api_key
```

4. Run the application

```bash
uvicorn app:app --reload
```

5. Open the application in your browser

```bash
http://localhost:8000
```

## Contributing 🤝

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature/new-feature
```

3. Make your changes and commit them

```bash
git add .
git commit -m "Add new feature"
```

4. Push your changes

```bash
git push origin feature/new-feature
```

5. Create a pull request

```bash
gh pr create --base main --head feature/new-feature --title "Add new feature" --body "This PR adds a new feature to the claims agent"
```

6. Test using the sample queries

```bash
cat sample_queries.txt
```
Test using the sample queries to see the claims agent in action by simply running agent.py

```bash
python agent.py
```

## License 📝

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact 📧

For any questions or feedback, please contact me at [rockycodes101@gmail.com](mailto:rockycodes101@gmail.com).
