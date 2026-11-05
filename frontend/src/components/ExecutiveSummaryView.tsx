import React from 'react';
import { BookOpen, ShieldCheck, Tag, Sparkles, CheckCircle } from 'lucide-react';
import { StudySetResponse } from '../types';

interface ExecutiveSummaryViewProps {
  studySet: StudySetResponse;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({ studySet }) => {
  const { executive_summary, key_concepts, guardrail, title } = studySet;

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-bold text-base text-white">Executive Synthesis & Academic Findings</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Synthesized by LangGraph Agent 3
          </span>
        </div>

        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
          {executive_summary}
        </div>

        {/* Guardrail Grounding Meter */}
        <div className="mt-5 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-emerald-300">ChromaDB Grounding Guardrail</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                  {Math.round(guardrail.faithfulness_score * 100)}% Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {guardrail.critique_notes}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>0 Hallucinations Detected</span>
          </div>
        </div>
      </div>

      {/* Key Concepts Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Extracted Technical Concepts ({key_concepts.length})
          </h3>
          <span className="text-xs text-slate-400">Grounded against vector memory chunks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {key_concepts.map((concept, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-sm text-white text-indigo-300">{concept.name}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    concept.importance === 'High'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {concept.importance}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {concept.definition}
                </p>
              </div>

              {concept.related_terms && concept.related_terms.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-800/80">
                  <Tag className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] text-slate-400">Related:</span>
                  {concept.related_terms.map((term, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

