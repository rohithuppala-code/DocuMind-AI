import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..db.session import get_db, SessionLocal
from ..db.entities import DocumentRecord, StudySetRecord
from ..agents.langgraph_workflow import stream_documind_workflow

router = APIRouter(prefix="/workflow", tags=["LangGraph Workflow"])

@router.get("/stream/{doc_id}")
async def stream_workflow_execution(doc_id: str):
    # Verify document exists in database
    db = SessionLocal()
    doc = db.query(DocumentRecord).filter(DocumentRecord.doc_id == doc_id).first()
    db.close()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    async def event_generator():
        study_payload = None
        async for sse_event in stream_documind_workflow(
            doc_id=doc.doc_id,
            title=doc.title,
            content=doc.content,
            doc_type=doc.document_type
        ):
            # Check if this is the final payload to persist
            try:
                event_data = json.loads(sse_event.get("data", "{}"))
                if event_data.get("node") == "completion" and "payload" in event_data:
                    study_payload = event_data["payload"]
            except Exception:
                pass
                
            yield f"event: {sse_event['event']}\ndata: {sse_event['data']}\n\n"

        # Save to SQLite database
        if study_payload:
            save_db = SessionLocal()
            try:
                existing = save_db.query(StudySetRecord).filter(StudySetRecord.doc_id == doc_id).first()
                if existing:
                    existing.title = study_payload["title"]
                    existing.executive_summary = study_payload["executive_summary"]
                    existing.key_concepts_json = json.dumps(study_payload["key_concepts"])
                    existing.flashcards_json = json.dumps(study_payload["flashcards"])
                    existing.quiz_questions_json = json.dumps(study_payload["quiz_questions"])
                    existing.mindmap_code = study_payload["mindmap"]["mermaid_code"]
                    existing.guardrail_json = json.dumps(study_payload["guardrail"])
                else:
                    new_set = StudySetRecord(
                        doc_id=doc_id,
                        title=study_payload["title"],
                        executive_summary=study_payload["executive_summary"],
                        key_concepts_json=json.dumps(study_payload["key_concepts"]),
                        flashcards_json=json.dumps(study_payload["flashcards"]),
                        quiz_questions_json=json.dumps(study_payload["quiz_questions"]),
                        mindmap_code=study_payload["mindmap"]["mermaid_code"],
                        guardrail_json=json.dumps(study_payload["guardrail"])
                    )
                    save_db.add(new_set)
                save_db.commit()
            except Exception as e:
                save_db.rollback()
            finally:
                save_db.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

