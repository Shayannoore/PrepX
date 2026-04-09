from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .schema import InterviewState
from .llm import get_llm
import json

llm = get_llm()

def generate_question(state: InterviewState):
    domain = state["domain"]
    difficulty = state.get("difficulty", 1)
    history = state.get("interview_history", [])
    
    # Extract only question texts from history for prompt
    asked_questions = [h["question"] for h in history]
    
    response = llm.invoke([
        SystemMessage(content=f"You are an expert interviewer for the domain: {domain}."),
        HumanMessage(content=f"""
        The current difficulty level is {difficulty}/10. 
        Previous questions asked: {asked_questions}.
        
        Generate a NEW, challenging but fair interview question. 
        CRITICAL: Do not repeat any questions from the 'Previous questions asked' list.
        Only return the question text.
        """)
    ])
    question = response.content
    
    return {
        "current_question": question,
        "status": "asking_question",
        "questions": state.get("questions", []) + [question]
    }

def evaluate_answer(state: InterviewState):
    if not state.get("user_answer"):
        return state
        
    question = state["current_question"]
    answer = state["user_answer"]
    domain = state["domain"]
    
    response = llm.invoke([
        SystemMessage(content=f"You are an expert interviewer for the domain: {domain}."),
        HumanMessage(content=f"Question: {question}\nCandidate Answer: {answer}\n\nEvaluate and return ONLY JSON: {{\"feedback\": \"...\", \"score\": 80, \"difficulty_change\": 1}}")
    ])
    content = response.content.replace("```json", "").replace("```", "").strip()
    result = json.loads(content)
    
    # Update stats
    new_score = result["score"]
    adjustment = result["difficulty_change"]
    new_difficulty = max(1, min(10, state.get("difficulty", 1) + adjustment))
    
    new_history = state.get("interview_history", []) + [{
        "question": question,
        "answer": answer,
        "score": new_score,
        "feedback": result["feedback"]
    }]
    
    return {
        "feedback": result["feedback"],
        "score": state.get("score", 0) + new_score,
        "difficulty": new_difficulty,
        "interview_history": new_history,
        "user_answer": None,
        "status": "providing_feedback"
    }

def router(state: InterviewState):
    # If there's an answer to evaluate, start with evaluation
    if state.get("user_answer"):
        return "evaluate_answer"
    # Otherwise, just generate a question (initial start)
    return "generate_question"

def create_graph():
    workflow = StateGraph(InterviewState)
    
    workflow.add_node("generate_question", generate_question)
    workflow.add_node("evaluate_answer", evaluate_answer)
    
    # Set conditional entry point to handle either start or evaluation
    workflow.set_conditional_entry_point(
        router,
        {
            "evaluate_answer": "evaluate_answer",
            "generate_question": "generate_question"
        }
    )
    
    workflow.add_edge("evaluate_answer", "generate_question")
    workflow.add_edge("generate_question", END)
    
    return workflow.compile()
