from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schema import UserInput, InterviewResponse, InterviewState
from .agent import create_graph
import uuid

app = FastAPI(title="AI Interview Prep Agent")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for session states (for demo purposes)
# In a real app, use a database or LangGraph's persistent Checkpointer
sessions = {}

graph = create_graph()

@app.post("/chat", response_model=InterviewResponse)
async def chat(user_input: UserInput):
    thread_id = user_input.thread_id
    text = user_input.text
    
    # Initialize or get session
    if thread_id not in sessions:
        sessions[thread_id] = {
            "domain": None,
            "questions": [],
            "current_question": None,
            "user_answer": None,
            "feedback": None,
            "score": 0,
            "difficulty": 1,
            "interview_history": [],
            "status": "collecting_domain"
        }
    
    state = sessions[thread_id]
    
    if state["status"] == "collecting_domain":
        state["domain"] = text
        # Run graph to get first question
        new_state = graph.invoke(state)
        sessions[thread_id].update(new_state)
    
    elif state["status"] == "asking_question":
        state["user_answer"] = text
        # Run graph to evaluate and get NEXT question
        # We start from evaluate_answer node
        new_state = graph.invoke(state, {"configurable": {"thread_id": thread_id}})
        sessions[thread_id].update(new_state)
    
    current_state = sessions[thread_id]
    
    return InterviewResponse(
        message=current_state.get("current_question") or "What role are you preparing for?",
        status=current_state["status"],
        score=current_state["score"],
        difficulty=current_state["difficulty"],
        current_question=current_state["current_question"],
        feedback=current_state.get("feedback")
    )

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
