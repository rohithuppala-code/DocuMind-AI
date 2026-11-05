import uuid
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.entities import DocumentRecord
from ..schemas.models import DocumentUploadRequest, DocumentMetadata

router = APIRouter(prefix="/documents", tags=["Documents"])

SAMPLE_ACADEMIC_PAPERS = [
    {
        "title": "Attention Is All You Need: Transformer Architectures",
        "document_type": "research_paper",
        "tags": ["deep-learning", "nlp", "transformers", "attention"],
        "content": """The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. 

Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.

Self-attention, sometimes called intra-attention, is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence. Self-attention has been used successfully in a variety of tasks including reading comprehension, abstractive summarization, textual entailment and learning task-independent sentence representations.

Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions. With multi-head attention we linear project the queries, keys and values h times with different, learned linear projections. On each of these projected versions of queries, keys and values we then perform the attention function in parallel.

Positional Encoding: Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence. To this end, we add 'positional encodings' to the input embeddings at the bottoms of the encoder and decoder stacks."""
    },
    {
        "title": "Deep Residual Learning for Image Recognition (ResNet)",
        "document_type": "research_paper",
        "tags": ["computer-vision", "resnet", "convolutional-networks", "skip-connections"],
        "content": """Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. 

We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth. On the ImageNet dataset, we evaluate residual nets with a depth of up to 152 layers—8x deeper than VGG nets but still having lower complexity.

When deeper networks are able to start converging, a degradation problem has been exposed: with the network depth increasing, accuracy gets saturated and then degrades rapidly. Unexpectedly, such degradation is not caused by overfitting, and adding more layers to a suitably deep model leads to higher training error.

Instead of hoping each few stacked layers directly fit a desired underlying mapping H(x), we explicitly let these layers fit a residual mapping F(x) = H(x) - x. The original mapping is recast into F(x) + x. We hypothesize that it is easier to optimize the residual mapping than to optimize the original, unreferenced mapping. The formulation of F(x) + x can be realized by feedforward neural networks with shortcut connections."""
    },
    {
        "title": "Bitcoin: A Peer-to-Peer Electronic Cash System",
        "document_type": "research_paper",
        "tags": ["blockchain", "cryptography", "distributed-systems", "consensus"],
        "content": """A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. Digital signatures provide part of the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending. 

We propose a solution to the double-spending problem using a peer-to-peer distributed timestamp server to generate computational proof of the chronological order of transactions. The system is secure as long as honest nodes collectively control more CPU power than any cooperating group of attacker nodes.

The network timestamps transactions by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that cannot be changed without redoing the proof-of-work. The longest chain not only serves as proof of the sequence of events witnessed, but proof that it came from the largest pool of CPU power.

Proof-of-work involves scanning for a value that when hashed, such as with SHA-256, the hash begins with a number of zero bits. The average work required is exponential in the number of zero bits required and can be verified by executing a single hash."""
    }
]

@router.post("/upload", response_model=DocumentMetadata)
def upload_document(req: DocumentUploadRequest, db: Session = Depends(get_db)):
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    tags_str = ",".join(req.tags) if req.tags else ""
    
    record = DocumentRecord(
        doc_id=doc_id,
        title=req.title,
        content=req.content,
        document_type=req.document_type,
        tags=tags_str
    )
    db.add(record)
    db.commit()
    
    return DocumentMetadata(
        doc_id=doc_id,
        title=req.title,
        document_type=req.document_type,
        char_count=len(req.content),
        chunk_count=max(1, len(req.content) // 600)
    )

@router.get("", response_model=List[DocumentMetadata])
def list_documents(db: Session = Depends(get_db)):
    records = db.query(DocumentRecord).order_by(DocumentRecord.created_at.desc()).all()
    
    # Auto-seed sample papers if database is empty
    if not records:
        for sample in SAMPLE_ACADEMIC_PAPERS:
            doc_id = f"doc_{uuid.uuid4().hex[:12]}"
            rec = DocumentRecord(
                doc_id=doc_id,
                title=sample["title"],
                content=sample["content"],
                document_type=sample["document_type"],
                tags=",".join(sample["tags"])
            )
            db.add(rec)
        db.commit()
        records = db.query(DocumentRecord).order_by(DocumentRecord.created_at.desc()).all()
        
    return [
        DocumentMetadata(
            doc_id=r.doc_id,
            title=r.title,
            document_type=r.document_type,
            char_count=len(r.content),
            chunk_count=max(1, len(r.content) // 600),
            created_at=r.created_at
        )
        for r in records
    ]

@router.get("/samples/library")
def get_sample_library():
    return SAMPLE_ACADEMIC_PAPERS

@router.get("/{doc_id}")
def get_document(doc_id: str, db: Session = Depends(get_db)):
    record = db.query(DocumentRecord).filter(DocumentRecord.doc_id == doc_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "doc_id": record.doc_id,
        "title": record.title,
        "content": record.content,
        "document_type": record.document_type,
        "tags": record.tags.split(",") if record.tags else [],
        "created_at": record.created_at
    }

