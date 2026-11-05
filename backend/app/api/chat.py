import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.entities import ChatHistoryRecord, DocumentRecord
from ..schemas.models import RAGQueryRequest, RAGQueryResponse, RAGCitation
from ..services.rag_engine import rag_engine

router = APIRouter(prefix="/chat", tags=["Grounded RAG Chat"])

@router.post("/ask", response_model=RAGQueryResponse)
async def ask_rag_question(req: RAGQueryRequest, db: Session = Depends(get_db)):
    doc = db.query(DocumentRecord).filter(DocumentRecord.doc_id == req.doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    response = await rag_engine.answer_query(
        doc_id=req.doc_id,
        query=req.query,
        top_k=req.top_k or 4
    )

    # Persist interaction into chat history
    citations_data = [
        {
            "chunk_id": c.chunk_id,
            "snippet": c.snippet,
            "similarity_score": c.similarity_score,
            "source_index": c.source_index
        }
        for c in response.citations
    ]
    
    chat_rec = ChatHistoryRecord(
        doc_id=req.doc_id,
        user_query=req.query,
        bot_answer=response.answer,
        citations_json=json.dumps(citations_data)
    )
    db.add(chat_rec)
    db.commit()

    return response

@router.get("/history/{doc_id}")
def get_chat_history(doc_id: str, db: Session = Depends(get_db)):
    records = db.query(ChatHistoryRecord).filter(ChatHistoryRecord.doc_id == doc_id).order_by(ChatHistoryRecord.timestamp.asc()).all()
    
    result = []
    for r in records:
        try:
            cits = json.loads(r.citations_json)
        except Exception:
            cits = []
        result.append({
            "id": r.id,
            "doc_id": r.doc_id,
            "user_query": r.user_query,
            "bot_answer": r.bot_answer,
            "citations": cits,
            "timestamp": r.timestamp
        })
    return result

