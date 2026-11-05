import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Database, ChevronDown, ChevronUp, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { askRAGQuestion, fetchChatHistory } from '../services/api';
import { RAGCitation } from '../types';

interface Message {
  id?: number;
  sender: 'user' | 'bot';
  text: string;
  citations?: RAGCitation[];
  confidence?: number;
}

interface RAGChatDrawerProps {
  docId: string;
  docTitle: string;
}

export const RAGChatDrawer: React.FC<RAGChatDrawerProps> = ({ docId, docTitle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: `Hello! I am your grounded academic research assistant for "${docTitle}". Ask me any conceptual, mathematical, or structural question, and I will cite exact passages from ChromaDB.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history if available
    const loadHistory = async () => {
      try {
        const history = await fetchChatHistory(docId);
        if (history.length > 0) {
          const formatted: Message[] = [];
          history.forEach((h: any) => {
            formatted.push({ sender: 'user', text: h.user_query });
            formatted.push({ sender: 'bot', text: h.bot_answer, citations: h.citations });
          });
          setMessages(formatted);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    loadHistory();
  }, [docId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customQuery?: string) => {
    const queryToSend = customQuery || input;
    if (!queryToSend.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: queryToSend }]);
    setIsLoading(true);

    try {
      const response = await askRAGQuestion(docId, queryToSend);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: response.answer,
          citations: response.citations,
          confidence: response.confidence
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Encountered an issue retrieving contextual passages from ChromaDB. Please ensure the document is properly indexed.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCitations = (idx: number) => {
    setExpandedCitations(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const suggestedPrompts = [
    "What is the core thesis and problem statement?",
    "Explain the primary technical innovations.",
    "What are the baseline benchmarks and results?"
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Grounded RAG Research Chat</h3>
            <p className="text-xs text-slate-400">Strictly verified against ChromaDB vector embeddings</p>
          </div>
        </div>

        <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
          ChromaDB RAG Active
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'bg-slate-950 text-slate-200 border border-slate-800 shadow-sm'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Citations Accordion */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => toggleCitations(i)}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{msg.citations.length} Verified Source Citations</span>
                    {expandedCitations[i] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {expandedCitations[i] && (
                    <div className="mt-2.5 space-y-2">
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-1">
                            <span className="text-emerald-400 font-bold">Source Chunk #{c.source_index}</span>
                            <span>Cosine Similarity: {(c.similarity_score * 100).toFixed(1)}%</span>
                          </div>
                          <p className="text-slate-300 italic text-[11px] leading-normal">
                            "{c.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Querying ChromaDB vector index and synthesizing grounded response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="pt-3 flex flex-wrap gap-2">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the study findings..."
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
