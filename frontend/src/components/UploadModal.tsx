import React, { useState } from 'react';
import { X, Upload, BookOpen, FileText, Check } from 'lucide-react';
import { uploadDocument } from '../services/api';
import { DocumentMetadata } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAdded: (newDoc: DocumentMetadata) => void;
  sampleLibrary: any[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentAdded,
  sampleLibrary
}) => {
  const [tab, setTab] = useState<'paste' | 'samples'>('paste');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [docType, setDocType] = useState('research_paper');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmitCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      const newDoc = await uploadDocument({
        title,
        content,
        document_type: docType,
        tags: tagList
      });
      onDocumentAdded(newDoc);
      onClose();
    } catch (err) {
      alert('Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectSample = async (sample: any) => {
    setIsSubmitting(true);
    try {
      const newDoc = await uploadDocument({
        title: sample.title,
        content: sample.content,
        document_type: sample.document_type,
        tags: sample.tags
      });
      onDocumentAdded(newDoc);
      onClose();
    } catch (err) {
      alert('Failed to load sample document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Add Study Document</h3>
              <p className="text-xs text-slate-400">Ingest research paper, lecture notes, or textbook chapter</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-5 pt-3 gap-6 bg-slate-950/40">
          <button
            onClick={() => setTab('paste')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'paste'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text or Notes</span>
          </button>

          <button
            onClick={() => setTab('samples')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'samples'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pre-Loaded Academic Library</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'paste' ? (
            <form onSubmit={handleSubmitCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document / Paper Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus in Raft Protocol"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Document Category
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="research_paper">Research Paper</option>
                    <option value="textbook">Textbook Chapter</option>
                    <option value="lecture_notes">Lecture Notes</option>
                    <option value="code_documentation">Code Documentation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Keywords / Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. distributed, consensus, fault-tolerance"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Content / Full Text *
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the abstract, methodology, technical findings, or notes here..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? 'Ingesting...' : 'Ingest Document'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-3">
                Select one of the classical foundational Computer Science papers to test the LangGraph & ChromaDB pipeline:
              </p>
              {sampleLibrary.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 cursor-pointer transition-all flex items-start justify-between group"
                >
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-indigo-300 transition-colors">
                      {sample.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {sample.content}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sample.tags.map((t: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold shrink-0 ml-3 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    Load
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

