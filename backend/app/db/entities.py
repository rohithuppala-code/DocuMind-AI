from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class DocumentRecord(Base):
    __tablename__ = "documents"
    
    doc_id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    document_type = Column(String(50), default="research_paper")
    tags = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class StudySetRecord(Base):
    __tablename__ = "study_sets"
    
    doc_id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    executive_summary = Column(Text, nullable=False)
    key_concepts_json = Column(Text, nullable=False)
    flashcards_json = Column(Text, nullable=False)
    quiz_questions_json = Column(Text, nullable=False)
    mindmap_code = Column(Text, nullable=False)
    guardrail_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatHistoryRecord(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    doc_id = Column(String(64), index=True)
    user_query = Column(Text, nullable=False)
    bot_answer = Column(Text, nullable=False)
    citations_json = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
