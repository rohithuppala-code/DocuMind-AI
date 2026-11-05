import React from 'react';
import { BookOpen, Sparkles, Database, Code, Cpu, Network, GitBranch } from 'lucide-react';

interface NavbarProps {
  vectorCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ vectorCount }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">DocuMind AI</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                B.Tech Capstone
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Autonomous Academic Research & Document Intelligence Platform
            </p>
          </div>
        </div>

        {/* Tech Stack Pills & Vector Stats */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Network className="w-3.5 h-3.5 text-indigo-400" />
            <span>LangGraph Swarm</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>ChromaDB: <strong className="text-emerald-400 font-medium">{vectorCount}</strong> chunks</span>
          </div>

          <a
            href="https://github.com/rohithuppala-code/DocuMind-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700"
          >
            <GitBranch className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};

