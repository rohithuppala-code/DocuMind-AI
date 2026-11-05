from backend.app.vector.chroma_store import chroma_vector_store

def test_chroma_vector_indexing_and_query():
    doc_id = "test_chroma_doc"
    chunks = [
        {
            "id": f"{doc_id}_chk_0",
            "text": "The transformer model utilizes self-attention mechanisms to replace recurrent layers.",
            "metadata": {"doc_id": doc_id, "chunk_index": 0, "char_count": 80}
        },
        {
            "id": f"{doc_id}_chk_1",
            "text": "Convolutional neural networks excel at extracting spatial feature hierarchies in computer vision.",
            "metadata": {"doc_id": doc_id, "chunk_index": 1, "char_count": 92}
        }
    ]
    
    indexed = chroma_vector_store.index_document_chunks(doc_id, chunks)
    assert indexed == 2
    
    # Query for attention mechanisms
    results = chroma_vector_store.query_chunks(doc_id, "attention mechanism in transformers", n_results=1)
    assert len(results) > 0
    assert results[0].source_index == 0
    assert "transformer" in results[0].snippet.lower()
