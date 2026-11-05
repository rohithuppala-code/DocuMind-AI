import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Shuffle, Check, Award, Layers } from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardDeckProps {
  flashcards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <Layers className="w-10 h-10 mx-auto mb-3 text-slate-600" />
        <p className="font-semibold text-sm">No flashcards available</p>
        <p className="text-xs text-slate-500 mt-1">Run the LangGraph workflow to synthesize active-recall flashcards.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const isMastered = masteredIds.has(currentCard.id);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const toggleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentCard.id)) {
        next.delete(currentCard.id);
      } else {
        next.add(currentCard.id);
      }
      return next;
    });
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * flashcards.length));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Active-Recall Flashcard Deck
          </h3>
          <p className="text-xs text-slate-400">
            Card {currentIndex + 1} of {flashcards.length} • {masteredIds.size} Mastered
          </p>
        </div>

        <button
          onClick={handleShuffle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Shuffle</span>
        </button>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
        <div
          className="bg-indigo-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="perspective-1000 cursor-pointer min-h-[320px] select-none"
      >
        <div
          className={`relative w-full h-[320px] transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front (Question) */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-8 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                currentCard.difficulty === 'easy'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : currentCard.difficulty === 'hard'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {currentCard.difficulty}
              </span>

              <button
                onClick={toggleMastered}
                className={`p-1.5 rounded-lg border transition-all ${
                  isMastered
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title={isMastered ? 'Mastered' : 'Mark as Mastered'}
              >
                <Check className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto text-center px-4">
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest block mb-2">
                Question / Prompt
              </span>
              <p className="text-lg font-bold text-white leading-snug">
                {currentCard.question}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
              <RotateCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Click card to reveal answer</span>
            </div>
          </div>

          {/* Card Back (Answer) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/50 rounded-2xl p-8 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Category: {currentCard.category}
              </span>

              <button
                onClick={toggleMastered}
                className={`p-1.5 rounded-lg border transition-all ${
                  isMastered
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Check className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto px-4 text-center">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest block mb-2">
                Ground Truth Answer
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {currentCard.answer}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
              <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Click card to flip back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-xs text-slate-400 font-medium">
          {currentIndex + 1} / {flashcards.length}
        </span>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-all shadow-sm"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

