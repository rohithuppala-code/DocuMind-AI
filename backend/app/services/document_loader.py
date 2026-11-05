import uuid
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter

class DocumentProcessor:
    """
    Handles academic document preprocessing, structural cleaning,
    and LangChain text chunking with metadata tracking.
    """
    def __init__(self, chunk_size: int = 750, chunk_overlap: int = 100):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def process_text(self, text: str, doc_id: str) -> List[Dict[str, Any]]:
        """Splits document text into indexed chunks with metadata."""
        cleaned_text = self._clean_whitespace(text)
        raw_chunks = self.text_splitter.split_text(cleaned_text)
        
        chunks = []
        for index, chunk in enumerate(raw_chunks):
            chunk_id = f"{doc_id}_chk_{index}"
            chunks.append({
                "id": chunk_id,
                "text": chunk.strip(),
                "metadata": {
                    "doc_id": doc_id,
                    "chunk_index": index,
                    "char_count": len(chunk.strip())
                }
            })
        return chunks

    def _clean_whitespace(self, text: str) -> str:
        lines = [line.strip() for line in text.splitlines()]
        return "\n".join([line for line in lines if line])

document_processor = DocumentProcessor()

