import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_full_e2e_document_and_rag_pipeline():
    # 1. Check health
    health = client.get("/api/health")
    assert health.status_code == 200

    # 2. Upload a new academic research paper
    paper_title = "Self-Attention and Positional Embeddings in Transformer Models"
    paper_content = (
        "The Transformer architecture replaces recurrent architectures entirely with self-attention mechanisms. "
        "Each multi-head attention block computes scaled dot-product attention across query, key, and value vectors. "
        "Positional encodings are injected at the input embeddings to preserve token sequencing without recurrence. "
        "Empirical benchmarks demonstrate faster training convergence and superior BLEU scores."
    )
    upload_res = client.post("/api/documents/upload", json={
        "title": paper_title,
        "content": paper_content,
        "document_type": "research_paper",
        "tags": ["transformers", "attention", "nlp"]
    })
    assert upload_res.status_code == 200
    doc_id = upload_res.json()["doc_id"]

    # 3. Stream / execute the LangGraph multi-agent workflow
    workflow_stream_res = client.get(f"/api/workflow/stream/{doc_id}")
    assert workflow_stream_res.status_code == 200
    stream_content = workflow_stream_res.text
    assert "event: message" in stream_content
    assert "completion" in stream_content

    # 4. Fetch the synthesized study set
    study_res = client.get(f"/api/study/{doc_id}")
    assert study_res.status_code == 200
    study_data = study_res.json()
    assert study_data["doc_id"] == doc_id
    assert len(study_data["key_concepts"]) >= 3
    assert len(study_data["flashcards"]) >= 3
    assert len(study_data["quiz_questions"]) >= 3
    assert "graph TD" in study_data["mindmap"]["mermaid_code"]
    assert study_data["guardrail"]["faithfulness_score"] >= 0.85

    # 5. Execute grounded RAG Q&A query
    rag_res = client.post("/api/chat/ask", json={
        "doc_id": doc_id,
        "query": "How do positional encodings work without recurrence?",
        "top_k": 3
    })
    assert rag_res.status_code == 200
    rag_data = rag_res.json()
    assert len(rag_data["citations"]) > 0
    assert "positional" in rag_data["citations"][0]["snippet"].lower()
    assert rag_data["confidence"] > 0.80

    # 6. Verify conversation history persistence
    hist_res = client.get(f"/api/chat/history/{doc_id}")
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1
