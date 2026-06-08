import React, { useState, useEffect } from 'react';
import { usePractice } from '../context/PracticeContext';
import readingPassages from '../data/readingPassages.json';
import { 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  BookMarked
} from 'lucide-react';

export default function ReadingComprehension() {
  const { 
    selectedReadingUnit, 
    setSelectedReadingUnit, 
    readingProgress, 
    markReadingCompleted 
  } = usePractice();

  // Find currently selected passage
  const currentPassage = readingPassages.find(p => p.unit === selectedReadingUnit) || readingPassages[0];

  // Interactive questions state
  const [answersState, setAnswersState] = useState({}); // Stores { [questionId]: { selectedOption, isCorrect } }
  const [completed, setCompleted] = useState(false);

  // Reset state when unit changes
  useEffect(() => {
    setAnswersState({});
    setCompleted(readingProgress[selectedReadingUnit] === 'completed');
  }, [selectedReadingUnit, readingProgress]);

  const handleSelectUnit = (unit) => {
    setSelectedReadingUnit(unit);
  };

  const handleOptionSelect = (questionId, option) => {
    if (answersState[questionId]) return; // Answered already

    const question = currentPassage.questions.find(q => q.id === questionId);
    const isCorrect = option === question.answer;

    setAnswersState(prev => ({
      ...prev,
      [questionId]: {
        selectedOption: option,
        isCorrect
      }
    }));
  };

  const handleMarkCompleted = () => {
    markReadingCompleted(selectedReadingUnit);
    setCompleted(true);
  };

  const handlePrevUnit = () => {
    const currentIndex = readingPassages.findIndex(p => p.unit === selectedReadingUnit);
    if (currentIndex > 0) {
      setSelectedReadingUnit(readingPassages[currentIndex - 1].unit);
    }
  };

  const handleNextUnit = () => {
    const currentIndex = readingPassages.findIndex(p => p.unit === selectedReadingUnit);
    if (currentIndex < readingPassages.length - 1) {
      setSelectedReadingUnit(readingPassages[currentIndex + 1].unit);
    }
  };

  // Helper to highlight vocab words in text
  const renderPassageWithHighlights = (text, vocabList) => {
    if (!vocabList || vocabList.length === 0) return text;
    
    // Sort words by length descending to prevent partial highlights
    const sortedVocab = [...vocabList].sort((a, b) => b.word.split(' ')[0].length - a.word.split(' ')[0].length);
    
    let highlightedText = text;
    sortedVocab.forEach(vocab => {
      // Get the english word (before parenthesis)
      const englishWord = vocab.word.split(' ')[0];
      const regex = new RegExp(`\\b(${englishWord})\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex, 
        `<span class="px-1.5 py-0.5 rounded-sm bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold border-b-2 border-indigo-500 cursor-help" title="${vocab.definition}">$1</span>`
      );
    });

    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/40">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-zinc-950 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <BookOpen className="text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
            Reading Comprehension
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Latihan membaca komprehensif berdasarkan Unit 6-20. Pilihlah opsi jawaban dan cek kebenarannya secara instan.
          </p>
        </div>

        {/* Navigation & Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handlePrevUnit}
            disabled={readingPassages.findIndex(p => p.unit === selectedReadingUnit) === 0}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          
          <select
            value={selectedReadingUnit}
            onChange={(e) => handleSelectUnit(Number(e.target.value))}
            className="flex-1 md:flex-initial bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {readingPassages.map(p => (
              <option key={p.unit} value={p.unit}>
                Unit {p.unit} - {p.title} {readingProgress[p.unit] === 'completed' ? '✓' : ''}
              </option>
            ))}
          </select>

          <button 
            onClick={handleNextUnit}
            disabled={readingPassages.findIndex(p => p.unit === selectedReadingUnit) === readingPassages.length - 1}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: Passage & Vocabulary */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-zinc-200/60 dark:border-zinc-800/30 space-y-6">
            <div className="flex justify-between items-center">
              <span className="px-3.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-200/30 dark:border-indigo-800/20">
                Unit {currentPassage.unit}
              </span>
              {completed ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <BookmarkCheck size={16} /> Unit Selesai
                </span>
              ) : (
                <button
                  onClick={handleMarkCompleted}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/30 dark:border-indigo-800/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <BookMarked size={14} /> Tandai Selesai
                </button>
              )}
            </div>

            <h2 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-zinc-50 tracking-tight">
              {currentPassage.title}
            </h2>

            {/* Passage text */}
            <div className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-line tracking-wide">
              {renderPassageWithHighlights(currentPassage.passage, currentPassage.vocabulary)}
            </div>

            {/* Vocabulary box */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Vocabulary List (Glosarium):
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {currentPassage.vocabulary.map((vocab, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/35 dark:border-zinc-800/20 text-xs flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1"
                  >
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 shrink-0">
                      {vocab.word}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-left sm:text-right leading-relaxed">
                      {vocab.definition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive MCQ questions */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-zinc-200/60 dark:border-zinc-800/30 space-y-8">
            <h3 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <HelpCircle className="text-indigo-600 dark:text-indigo-400" size={18} />
              Pertanyaan Pemahaman
            </h3>

            <div className="space-y-8 divide-y divide-zinc-100 dark:divide-zinc-900">
              {currentPassage.questions.map((question, qIdx) => {
                const answerState = answersState[question.id];
                const hasBeenAnswered = !!answerState;

                return (
                  <div key={question.id} className={`space-y-4 ${qIdx > 0 ? 'pt-6' : ''}`}>
                    <h4 className="font-display font-semibold text-base text-zinc-900 dark:text-zinc-100 leading-snug">
                      {qIdx + 1}. {question.question}
                    </h4>

                    {/* Options list */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {question.options.map((option, optIdx) => {
                        const isSelected = answerState?.selectedOption === option;
                        const isCorrectAnswer = option === question.answer;

                        let optionStyle = 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300';

                        if (hasBeenAnswered) {
                          if (isCorrectAnswer) {
                            optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold';
                          } else if (isSelected) {
                            optionStyle = 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 font-semibold';
                          } else {
                            optionStyle = 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleOptionSelect(question.id, option)}
                            disabled={hasBeenAnswered}
                            className={`w-full p-3.5 rounded-2xl border text-left text-sm flex items-center justify-between gap-4 transition-all ${optionStyle} ${!hasBeenAnswered ? 'hover:scale-[1.005] cursor-pointer' : ''}`}
                          >
                            <span>{option}</span>
                            {hasBeenAnswered && isCorrectAnswer && (
                              <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                            )}
                            {hasBeenAnswered && isSelected && !isCorrectAnswer && (
                              <XCircle className="text-rose-500 shrink-0" size={16} />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanatory notes on answer selection */}
                    {hasBeenAnswered && (
                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/35 dark:border-zinc-800/20 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 animate-fade-in-up">
                        <span className="font-bold block mb-0.5 text-zinc-700 dark:text-zinc-300">
                          {answerState.isCorrect ? 'Benar!' : 'Kurang Tepat.'} Penjelasan:
                        </span>
                        {question.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom confirmation section */}
            {!completed && Object.keys(answersState).length === currentPassage.questions.length && (
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
                <button
                  onClick={handleMarkCompleted}
                  className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <BookmarkCheck size={18} />
                  Selesaikan Unit Ini
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
