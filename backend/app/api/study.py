import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.entities import StudySetRecord, DocumentRecord
from ..schemas.models import StudySetResponse, MindMapData, GuardrailEvaluation

router = APIRouter(prefix="/study", tags=["Study Intelligence"])

@router.get("/{doc_id}", response_model=StudySetResponse)
def get_study_set(doc_id: str, db: Session = Depends(get_db)):
    record = db.query(StudySetRecord).filter(StudySetRecord.doc_id == doc_id).first()
    doc = db.query(DocumentRecord).filter(DocumentRecord.doc_id == doc_id).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if not record:
        raise HTTPException(status_code=404, detail="Study set has not been generated for this document yet. Please run the LangGraph workflow first.")

    try:
        concepts = json.loads(record.key_concepts_json)
        flashcards = json.loads(record.flashcards_json)
        quiz = json.loads(record.quiz_questions_json)
        guardrail = json.loads(record.guardrail_json)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to decode study set JSON fields")

    return StudySetResponse(
        doc_id=record.doc_id,
        title=record.title,
        document_type=doc.document_type if doc else "research_paper",
        executive_summary=record.executive_summary,
        key_concepts=concepts,
        flashcards=flashcards,
        quiz_questions=quiz,
        mindmap=MindMapData(
            mermaid_code=record.mindmap_code,
            root_topic=record.title,
            subtopics=[c["name"] for c in concepts]
        ),
        guardrail=GuardrailEvaluation(**guardrail),
        created_at=record.created_at
    )
