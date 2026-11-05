import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Layers, HelpCircle, Network, MessageSquare, 
  Sparkles, AlertCircle, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DocumentSelector } from './components/DocumentSelector';
import { LangGraphSwarmConsole } from './components/LangGraphSwarmConsole';
import { ExecutiveSummaryView } from './components/ExecutiveSummaryView';
import { FlashcardDeck } from './components/FlashcardDeck';
import { QuizArena } from './components/QuizArena';
import { MindMapVisualizer } from './components/MindMapVisualizer';
import { RAGChatDrawer } from './components/RAGChatDrawer';
import { UploadModal } from './components/UploadModal';
import { 
  fetchDocuments, fetchSampleLibrary, fetchStudySet, 
  fetchVectorStats, subscribeToWorkflowStream 
} from './services/api';
import { DocumentMetadata, StudySetResponse, StreamEvent } from './types';

export function App() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [studySet, setStudySet] = useState<StudySetResponse | null>(null);
  const [sampleLibrary, setSampleLibrary] = useState<any[]>([]);
  const [vectorCount, setVectorCount] = useState<number>(0);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'flashcards' | 'quiz' | 'mindmap' | 'chat'>('overview');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
  
  const [currentEvent, setCurrentEvent] = useState<StreamEvent | null>(null);
  const [eventsLog, setEventsLog] = useState<StreamEvent[]>([]);

  // Load initial data
  useEffect(() => {
    const initApp = async () => {
      try {
        const [docs, samples, stats] = await Promise.all([
          fetchDocuments(),
          fetchSampleLibrary(),
          fetchVectorStats()
        ]);
        setDocuments(docs);
        setSampleLibrary(samples);
        setVectorCount(stats.total_chunks_indexed || 0);

        if (docs.length > 0) {
          const firstId = docs[0].doc_id;
          setSelectedDocId(firstId);
          loadStudySet(firstId);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    initApp();
  }, []);

  const loadStudySet = async (docId: string) => {
    try {
      const data = await fetchStudySet(docId);
      setStudySet(data);
    } catch (err: any) {
      if (err.message === 'NOT_PROCESSED') {
        setStudySet(null);
      }
    }
  };

  const handleSelectDoc = (id: string) => {
    setSelectedDocId(id);
    setEventsLog([]);
    setCurrentEvent(null);
    loadStudySet(id);
  };

  const handleDocumentAdded = (newDoc: DocumentMetadata) => {
    setDocuments(prev => [newDoc, ...prev]);
    setSelectedDocId(newDoc.doc_id);
    setStudySet(null);
    setEventsLog([]);
    setCurrentEvent(null);
  };

  const handleRunWorkflow = () => {
    if (!selectedDocId || isRunningWorkflow) return;

    setIsRunningWorkflow(true);
    setEventsLog([]);
    setCurrentEvent(null);

    const unsubscribe = subscribeToWorkflowStream(
      selectedDocId,
      (event) => {
        setCurrentEvent(event);
        setEventsLog(prev => [...prev, event]);
      },
      (error) => {
        console.error('Stream error:', error);
        setIsRunningWorkflow(false);
      },
      (completedStudySet) => {
        setIsRunningWorkflow(false);
        if (completedStudySet) {
          setStudySet(completedStudySet);
        } else {
          loadStudySet(selectedDocId);
        }
        // Refresh vector chunks count
        fetchVectorStats().then(s => setVectorCount(s.total_chunks_indexed || 0));
      }
    );
  };

  const selectedDoc = documents.find(d => d.doc_id === selectedDocId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar vectorCount={vectorCount} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Document Selector & Action Panel */}
        <DocumentSelector
          documents={documents}
          selectedDocId={selectedDocId}
          onSelectDoc={handleSelectDoc}
          onOpenUpload={() => setIsUploadOpen(true)}
          onRunWorkflow={handleRunWorkflow}
          isRunningWorkflow={isRunningWorkflow}
          hasStudySet={studySet !== null}
        />

        {/* LangGraph Multi-Agent Execution State Machine */}
        {(isRunningWorkflow || eventsLog.length > 0) && (
          <LangGraphSwarmConsole
            currentEvent={currentEvent}
            eventsLog={eventsLog}
            isRunning={isRunningWorkflow}
          />
        )}

        {/* Study Studio Tabs */}
        {studySet ? (
          <div className="space-y-6">
            <div className="flex border-b border-slate-800 gap-2 sm:gap-6 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Executive Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'flashcards'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>3D Flashcards ({studySet.flashcards.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'quiz'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Practice Quiz ({studySet.quiz_questions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('mindmap')}
                className={`flex items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'mindmap'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Network className="w-4 h-4" />
                <span>Concept Mind-Map</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'chat'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Grounded RAG Chat</span>
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'overview' && <ExecutiveSummaryView studySet={studySet} />}
            {activeTab === 'flashcards' && <FlashcardDeck flashcards={studySet.flashcards} />}
            {activeTab === 'quiz' && <QuizArena quizQuestions={studySet.quiz_questions} />}
            {activeTab === 'mindmap' && (
              <MindMapVisualizer
                mermaidCode={studySet.mindmap.mermaid_code}
                rootTopic={studySet.title}
              />
            )}
            {activeTab === 'chat' && (
              <RAGChatDrawer
                docId={studySet.doc_id}
                docTitle={studySet.title}
              />
            )}
          </div>
        ) : !isRunningWorkflow ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 my-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Ready for LangGraph Autonomous Synthesis
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Document "{selectedDoc?.title || 'Selected Paper'}" is ready. Click the button above to launch the 7-node LangGraph multi-agent swarm with ChromaDB vector embedding.
              </p>
            </div>
            <button
              onClick={handleRunWorkflow}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
            >
              <span>Launch LangGraph Swarm</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </main>

      {/* Upload & Sample Document Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentAdded={handleDocumentAdded}
        sampleLibrary={sampleLibrary}
      />
    </div>
  );
}

export default App;

