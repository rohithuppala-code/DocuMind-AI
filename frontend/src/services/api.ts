import { DocumentMetadata, StudySetResponse, RAGQueryResponse, StreamEvent } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

export async function fetchDocuments(): Promise<DocumentMetadata[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function fetchSampleLibrary(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/documents/samples/library`);
  if (!res.ok) throw new Error('Failed to fetch sample library');
  return res.json();
}

export async function uploadDocument(payload: {
  title: string;
  content: string;
  document_type: string;
  tags: string[];
}): Promise<DocumentMetadata> {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return res.json();
}

export async function fetchStudySet(docId: string): Promise<StudySetResponse> {
  const res = await fetch(`${API_BASE}/study/${docId}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('NOT_PROCESSED');
    }
    throw new Error('Failed to fetch study set');
  }
  return res.json();
}

export async function askRAGQuestion(docId: string, query: string): Promise<RAGQueryResponse> {
  const res = await fetch(`${API_BASE}/chat/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_id: docId, query, top_k: 4 })
  });
  if (!res.ok) throw new Error('Failed to query RAG assistant');
  return res.json();
}

export async function fetchChatHistory(docId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/chat/history/${docId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchVectorStats(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/vector/stats`);
    if (!res.ok) return { total_chunks_indexed: 0 };
    return res.json();
  } catch {
    return { total_chunks_indexed: 0 };
  }
}

export function subscribeToWorkflowStream(
  docId: string,
  onEvent: (event: StreamEvent) => void,
  onError: (err: any) => void,
  onFinished: (studySet?: StudySetResponse) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/workflow/stream/${docId}`);

  eventSource.onmessage = (e) => {
    try {
      const data: StreamEvent = JSON.parse(e.data);
      onEvent(data);
      if (data.node === 'completion' && data.payload) {
        onFinished(data.payload);
        eventSource.close();
      }
    } catch (err) {
      console.error('Error parsing SSE event:', err);
    }
  };

  eventSource.onerror = (e) => {
    onError(e);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}
