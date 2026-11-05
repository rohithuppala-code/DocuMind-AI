export interface DocumentMetadata {
  doc_id: string;
  title: string;
  document_type: string;
  char_count: number;
  chunk_count: number;
  created_at: string;
}

export interface KeyConcept {
  name: string;
  definition: string;
  importance: string;
  related_terms: string[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface QuizOption {
  label: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correct_answer: string;
  explanation: string;
  concept_tested: string;
}

export interface MindMapData {
  mermaid_code: string;
  root_topic: string;
  subtopics: string[];
}

export interface GuardrailEvaluation {
  faithfulness_score: number;
  grounded_in_sources: boolean;
  hallucination_detected: boolean;
  verified_claims_count: number;
  critique_notes: string;
}

export interface StudySetResponse {
  doc_id: string;
  title: string;
  document_type: string;
  executive_summary: string;
  key_concepts: KeyConcept[];
  flashcards: Flashcard[];
  quiz_questions: QuizQuestion[];
  mindmap: MindMapData;
  guardrail: GuardrailEvaluation;
  created_at: string;
}

export interface RAGCitation {
  chunk_id: string;
  snippet: string;
  similarity_score: number;
  source_index: number;
}

export interface RAGQueryResponse {
  answer: string;
  citations: RAGCitation[];
  confidence: number;
  generated_at: string;
}

export interface StreamEvent {
  node: string;
  status: 'started' | 'running' | 'completed' | 'finished' | 'error';
  progress: number;
  message: string;
  data?: any;
  payload?: StudySetResponse;
}

