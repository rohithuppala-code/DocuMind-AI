import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, Terminal, Cpu, Database, Brain, Network, HelpCircle, Layers, ShieldCheck } from 'lucide-react';
import { StreamEvent } from '../types';

interface LangGraphSwarmConsoleProps {
  currentEvent: StreamEvent | null;
  eventsLog: StreamEvent[];
  isRunning: boolean;
}

const GRAPH_NODES = [
  { id: 'ingest', label: '1. Ingest & Split', icon: Layers, desc: 'LangChain RecursiveTextSplitter' },
  { id: 'vector_index', label: '2. ChromaDB Index', icon: Database, desc: '128-dim Dense Vector Embeddings' },
  { id: 'synthesis', label: '3. Concept Synthesizer', icon: Brain, desc: 'Executive Summary & Key Terms' },
  { id: 'mindmap', label: '4. Mind-Map Generator', icon: Network, desc: 'Mermaid Concept Hierarchy' },
  { id: 'quiz', label: '5. Quiz Synthesizer', icon: HelpCircle, desc: 'Adaptive MCQs with Explanations' },
  { id: 'flashcards', label: '6. Flashcard Deck', icon: Cpu, desc: 'Active-Recall Question/Answer Cards' },
  { id: 'guardrail', label: '7. Guardrail Evaluator', icon: ShieldCheck, desc: 'ChromaDB Citation Grounding' },
];

export const LangGraphSwarmConsole: React.FC<LangGraphSwarmConsoleProps> = ({
  currentEvent,
  eventsLog,
  isRunning
}) => {
  const currentStep = currentEvent?.node || 'idle';
  const progress = currentEvent?.progress || 0;

  // Find index of current step to mark past steps as completed
  const activeNodeIndex = GRAPH_NODES.findIndex(n => n.id === currentStep);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              LangGraph Multi-Agent State Machine
              {isRunning && (
                <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  Active Swarm Execution
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              State transitions orchestrated across autonomous LangChain & ChromaDB nodes
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400">Progress</span>
          <p className="text-sm font-bold text-indigo-400">{progress}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden my-4 border border-slate-800">
        <div
          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Visual State Graph Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 my-5">
        {GRAPH_NODES.map((node, idx) => {
          const Icon = node.icon;
          const isNodeActive = currentStep === node.id;
          const isNodeCompleted = activeNodeIndex > idx || (!isRunning && progress === 100);

          return (
            <div
              key={node.id}
              className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all ${
                isNodeActive
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10 scale-105'
                  : isNodeCompleted
                  ? 'bg-slate-950/70 border-emerald-500/30 text-slate-300'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${
                  isNodeActive ? 'text-indigo-400' : isNodeCompleted ? 'text-emerald-400' : 'text-slate-600'
                }`} />
                {isNodeActive ? (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                ) : isNodeCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                )}
              </div>
              <div>
                <p className={`text-xs font-semibold ${isNodeActive ? 'text-white' : isNodeCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                  {node.label}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {node.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Streaming Terminal Output */}
      <div className="mt-4 rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800/80 text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-[11px] uppercase tracking-wider">Live Agent Telemetry Stream</span>
        </div>
        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
          {eventsLog.length === 0 ? (
            <p className="text-slate-500 italic">Ready to run LangGraph swarm. Click 'Synthesize with LangGraph Swarm' above.</p>
          ) : (
            eventsLog.map((ev, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-slate-600 select-none">&gt;</span>
                <span className="text-indigo-400 font-semibold">[{ev.node}]:</span>
                <span className={ev.status === 'completed' ? 'text-emerald-300' : 'text-slate-300'}>
                  {ev.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

