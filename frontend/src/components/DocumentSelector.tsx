import React from 'react';
import { FileText, Play, Plus, BookCheck, Clock } from 'lucide-react';
import { DocumentMetadata } from '../types';

interface DocumentSelectorProps {
  documents: DocumentMetadata[];
  selectedDocId: string;
  onSelectDoc: (id: string) => void;
  onOpenUpload: () => void;
  onRunWorkflow: () => void;
  isRunningWorkflow: boolean;
  hasStudySet: boolean;
}

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onOpenUpload,
  onRunWorkflow,
  isRunningWorkflow,
  hasStudySet
}) => {
  const currentDoc = documents.find(d => d.doc_id === selectedDocId);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Document Selection Dropdown & Metadata */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Selected Research Document / Study Notes
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedDocId}
              onChange={(e) => onSelectDoc(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium min-w-[280px] max-w-full truncate"
            >
              {documents.map((doc) => (
                <option key={doc.doc_id} value={doc.doc_id}>
                  {doc.title} ({doc.char_count.toLocaleString()} chars)
                </option>
              ))}
            </select>

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Add / Load Document</span>
            </button>
          </div>

          {currentDoc && (
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Type: <strong className="text-slate-300 font-medium capitalize">{currentDoc.document_type.replace('_', ' ')}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Length: <strong className="text-slate-300 font-medium">{currentDoc.char_count} chars</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={onRunWorkflow}
            disabled={isRunningWorkflow}
            className={`w-full md:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${
              isRunningWorkflow
                ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed shadow-none'
                : hasStudySet
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25'
            }`}
          >
            {isRunningWorkflow ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running LangGraph Swarm...</span>
              </>
            ) : hasStudySet ? (
              <>
                <BookCheck className="w-4 h-4 text-emerald-200" />
                <span>Re-Synthesize with LangGraph</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white fill-white" />
                <span>Synthesize with LangGraph Swarm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

