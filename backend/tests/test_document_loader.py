from backend.app.services.document_loader import document_processor

def test_document_processor_chunking():
    sample_text = (
        "Artificial Intelligence (AI) is transforming software engineering. "
        "Language models and vector databases enable context-aware retrieval. "
        "LangChain provides abstractions for prompt engineering and document loaders. "
        "LangGraph manages state machines and cyclic agent flows."
    )
    chunks = document_processor.process_text(sample_text, doc_id="test_doc_1")
    
    assert len(chunks) >= 1
    assert "id" in chunks[0]
    assert chunks[0]["id"].startswith("test_doc_1_chk_")
    assert "text" in chunks[0]
    assert "metadata" in chunks[0]
    assert chunks[0]["metadata"]["doc_id"] == "test_doc_1"
    assert chunks[0]["metadata"]["chunk_index"] == 0
