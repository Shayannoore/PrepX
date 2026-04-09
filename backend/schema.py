from typing import List, Optional, TypedDict
from pydantic import BaseModel

class InterviewState(TypedDict):
    domain: Optional[str]
    questions: List[str]
    current_question: Optional[str]
    user_answer: Optional[str]
    feedback: Optional[str]
    score: int
    difficulty: int
    interview_history: List[dict]
    status: str  # 'collecting_domain', 'asking_question', 'evaluating_answer', 'providing_feedback', 'ended'

class UserInput(BaseModel):
    text: str
    thread_id: str

class InterviewResponse(BaseModel):
    message: str
    status: str
    score: int
    difficulty: int
    current_question: Optional[str]
    feedback: Optional[str]
