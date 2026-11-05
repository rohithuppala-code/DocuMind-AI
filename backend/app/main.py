from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db.session import init_db
from .api.documents import router as documents_router
from .api.workflow import router as workflow_router
from .api.study import router as study_router
from .api.chat import router as chat_router
from .api.vector_routes import router as vector_router

# Initialize SQLite tables
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(documents_router, prefix="/api")
app.include_router(workflow_router, prefix="/api")
app.include_router(study_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(vector_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "frameworks": ["LangChain", "LangGraph", "ChromaDB", "FastAPI"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
