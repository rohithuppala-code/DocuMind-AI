import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "LangGraph" in data["frameworks"]

def test_documents_crud_and_samples():
    # Test sample library
    samples_res = client.get("/api/documents/samples/library")
    assert samples_res.status_code == 200
    assert len(samples_res.json()) >= 3

    # Test upload
    upload_payload = {
        "title": "Graph Neural Networks Study",
        "content": "Graph neural networks propagate node feature representations across topological adjacency matrices.",
        "document_type": "research_paper",
        "tags": ["gnn", "graphs"]
    }
    upload_res = client.post("/api/documents/upload", json=upload_payload)
    assert upload_res.status_code == 200
    doc_data = upload_res.json()
    doc_id = doc_data["doc_id"]
    assert doc_id.startswith("doc_")

    # Test get document
    get_res = client.get(f"/api/documents/{doc_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Graph Neural Networks Study"

def test_vector_stats_endpoint():
    res = client.get("/api/vector/stats")
    assert res.status_code == 200
    assert "total_chunks_indexed" in res.json()
