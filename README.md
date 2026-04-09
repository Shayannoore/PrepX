# PrepX: AI Interview Preparation Agent

PrepX is a full-stack AI-driven interview preparation platform that helps users practice specifically for their target domains. It uses advanced LLM orchestration to simulate realistic interview scenarios, provide real-time feedback, and dynamically adjust difficulty based on performance.

## 🚀 Features

- **Dynamic Questioning**: Adapts questions based on the user's role and previous answers.
- **Real-time Feedback**: Providing immediate suggestions for improvement after each response.
- **Performance Scoring**: Tracks and displays a running score throughout the interview.
- **Adaptive Difficulty**: Automatically scales the complexity of questions to match the candidate's level.
- **Modern UI**: A sleek, responsive interface built with Next.js and Framer Motion.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **LLM Orchestration**: LangGraph
- **Language**: Python 3.10+
- **Environment**: Uvicorn

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Getting Started

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shayannoore/PrepX.git
   cd PrepX
   ```

2. **Backend Setup**:
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Create .env file and add your API keys
   # OPENAI_API_KEY=your_key_here
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the Backend**:
   ```bash
   # From the root directory
   uvicorn backend.main:app --reload
   ```

2. **Start the Frontend**:
   ```bash
   # From the frontend directory
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```text
PrepX/
├── backend/            # FastAPI & LangGraph logic
│   ├── main.py         # API Endpoints
│   ├── agent.py        # LangGraph workflow definition
│   └── llm.py          # LLM integrations
├── frontend/           # Next.js 16 web application
│   └── src/app/        # App router and components
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

