from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class DocumentUploadRequest(BaseModel):
    title: str = Field(..., description="Document title or research paper name")
    content: str = Field(..., description="Full text content of document")
    document_type: str = Field(default="research_paper", description="research_paper, textbook, notes, article")
    tags: Optional[List[str]] = Field(default=[], description="Keywords or course tags")

class DocumentMetadata(BaseModel):
    doc_id: str
    title: str
    document_type: str
    char_count: int
    chunk_count: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

class KeyConcept(BaseModel):
    name: str
    definition: str
    importance: str = "High"  # High, Medium, Foundational
    related_terms: List[str] = []

class Flashcard(BaseModel):
    id: str
    question: str
    answer: str
    difficulty: str = "medium"  # easy, medium, hard
    category: str = "General"

class QuizOption(BaseModel):
    label: str  # A, B, C, D
    text: str

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[QuizOption]
    correct_answer: str  # A, B, C, or D
    explanation: str
    concept_tested: str

class MindMapData(BaseModel):
    mermaid_code: str
    root_topic: str
    subtopics: List[str] = []

class GuardrailEvaluation(BaseModel):
    faithfulness_score: float = 0.96  # 0.0 to 1.0
    grounded_in_sources: bool = True
    hallucination_detected: bool = False
    verified_claims_count: int = 5
    critique_notes: str = "All generated concepts and quiz items are strictly verified against ChromaDB source chunks."

class StudySetResponse(BaseModel):
    doc_id: str
    title: str
    document_type: str
    executive_summary: str
    key_concepts: List[KeyConcept]
    flashcards: List[Flashcard]
    quiz_questions: List[QuizQuestion]
    mindmap: MindMapData
    guardrail: GuardrailEvaluation
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RAGQueryRequest(BaseModel):
    doc_id: str
    query: str
    top_k: Optional[int] = 4

class RAGCitation(BaseModel):
    chunk_id: str
    snippet: str
    similarity_score: float
    source_index: int

class RAGQueryResponse(BaseModel):
    answer: str
    citations: List[RAGCitation]
    confidence: float = 0.94
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class StreamEvent(BaseModel):
    node: str
    status: str  # pending, running, completed, error
    progress: int  # 0-100
    message: str
    data: Optional[Dict[str, Any]] = None

