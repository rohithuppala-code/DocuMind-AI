from backend.app.agents.langgraph_workflow import documind_graph

def test_langgraph_statemap_execution():
    initial_state = {
        "doc_id": "test_workflow_doc",
        "title": "Quantum Computing Principles",
        "content": (
            "Quantum computing leverages superposition and entanglement to perform complex computations. "
            "Qubits represent information as probability amplitudes rather than binary states. "
            "Algorithms like Shor's algorithm and Grover's search provide exponential speedups."
        ),
        "document_type": "research_paper",
        "chunks": [],
        "summary": "",
        "key_concepts": [],
        "mindmap_mermaid": "",
        "quiz_questions": [],
        "flashcards": [],
        "guardrail_score": 0.0,
        "guardrail_notes": "",
        "iteration": 0,
        "current_step": "init",
        "logs": []
    }
    
    final_state = documind_graph.invoke(initial_state)
    
    assert final_state is not None
    assert len(final_state["chunks"]) > 0
    assert len(final_state["key_concepts"]) > 0
    assert len(final_state["quiz_questions"]) > 0
    assert len(final_state["flashcards"]) > 0
    assert "graph TD" in final_state["mindmap_mermaid"]
    assert final_state["guardrail_score"] >= 0.80
