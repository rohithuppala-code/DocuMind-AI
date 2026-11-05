from fastapi import APIRouter
from ..vector.chroma_store import chroma_vector_store
from ..schemas.models import RAGCitation
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/vector", tags=["ChromaDB Vector Store"])

class VectorQueryInput(BaseModel):
    query: str
    doc_id: Optional[str] = None
    n_results: int = 5

@router.get("/stats")
def get_vector_store_stats():
    return chroma_vector_store.get_stats()

@router.post("/query", response_model=List[RAGCitation])
def query_vector_store(req: VectorQueryInput):
    return chroma_vector_store.query_chunks(
        doc_id=req.doc_id or "",
        query_text=req.query,
        n_results=req.n_results
    )

