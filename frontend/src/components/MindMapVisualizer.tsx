import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Network, Code2, RefreshCw } from 'lucide-react';

interface MindMapVisualizerProps {
  mermaidCode: string;
  rootTopic: string;
}

export const MindMapVisualizer: React.FC<MindMapVisualizerProps> = ({
  mermaidCode,
  rootTopic
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showRawCode, setShowRawCode] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      themeVariables: {
        darkMode: true,
        background: '#020617',
        primaryColor: '#4f46e5',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#6366f1',
        lineColor: '#64748b',
        secondaryColor: '#0ea5e9',
        tertiaryColor: '#1e293b'
      }
    });

    const renderDiagram = async () => {
      if (!containerRef.current || !mermaidCode) return;
      try {
        setRenderError(null);
        containerRef.current.innerHTML = '';
        const id = `mermaid-graph-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setRenderError('Could not render diagram visually. You can view the diagram markup below.');
      }
    };

    renderDiagram();
  }, [mermaidCode]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Visual Concept Hierarchy & Mind-Map
            </h3>
            <p className="text-xs text-slate-400">
              Synthesized by LangGraph Agent 4 • Root: <strong className="text-indigo-300">{rootTopic}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRawCode(!showRawCode)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>{showRawCode ? 'Show Canvas' : 'View Mermaid Code'}</span>
        </button>
      </div>

      {/* Canvas Area */}
      {showRawCode ? (
        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-indigo-300 border border-slate-800 overflow-x-auto">
          {mermaidCode}
        </pre>
      ) : (
        <div className="min-h-[360px] bg-slate-950/70 border border-slate-800/80 rounded-xl p-6 flex items-center justify-center overflow-x-auto">
          {renderError ? (
            <div className="text-center p-6 text-slate-400 text-xs space-y-2">
              <p className="text-amber-400">{renderError}</p>
              <pre className="bg-slate-900 p-3 rounded-lg text-left text-slate-300 overflow-x-auto max-w-lg mx-auto">
                {mermaidCode}
              </pre>
            </div>
          ) : (
            <div ref={containerRef} className="w-full flex justify-center [&_svg]:max-w-full" />
          )}
        </div>
      )}
    </div>
  );
};
