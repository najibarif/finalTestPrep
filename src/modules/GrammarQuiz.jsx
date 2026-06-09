import React, { useState } from 'react';
import { usePractice } from '../context/PracticeContext';
import grammarQuizzes from '../data/grammarQuizzes.json';
import grammarTopics from '../data/grammarTopics.json';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Loader2, 
  History, 
  AlertCircle,
  RotateCcw,
  Trash2
} from 'lucide-react';

export default function GrammarQuiz() {
  const { geminiKey, quizHistory, addQuizResult, clearQuizHistory } = usePractice();
  
  // Topic selection state
  const [selectedTopicIds, setSelectedTopicIds] = useState(['PP2', 'PP3', 'PP5', 'PP6', 'PP7']);
  
  // Quiz running states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState('selection'); // 'selection' | 'loading' | 'active' | 'results'

  const toggleTopic = (id) => {
    setSelectedTopicIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectAllTopics = () => {
    setSelectedTopicIds(grammarTopics.map(t => t.id));
  };

  const deselectAllTopics = () => {
    setSelectedTopicIds([]);
  };

  const handleStartQuiz = () => {
    if (selectedTopicIds.length === 0) {
      setError('Pilih minimal satu materi grammar untuk memulai kuis.');
      return;
    }

    setIsLoading(true);
    setError('');
    setQuizState('loading');

    setTimeout(() => {
      try {
        const selectedQuestions = [];
        
        // Pick exactly one random question for each selected topic ID
        selectedTopicIds.forEach(topicId => {
          const topicQuestions = grammarQuizzes.filter(q => q.topicId === topicId);
          if (topicQuestions.length > 0) {
            const randomQuestion = topicQuestions[Math.floor(Math.random() * topicQuestions.length)];
            selectedQuestions.push(randomQuestion);
          }
        });
        
        if (selectedQuestions.length === 0) {
          throw new Error('Tidak ada soal yang tersedia untuk topik terpilih. Harap pilih topik lainnya.');
        }

        // Shuffle the selected questions so they are in a random order
        selectedQuestions.sort(() => Math.random() - 0.5);

        setQuizQuestions(selectedQuestions);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setQuizState('active');
      } catch (err) {
        setError(err.message || 'Gagal membuat kuis.');
        setQuizState('selection');
      } finally {
        setIsLoading(false);
      }
    }, 600); // 600ms artificial delay for premium transition effect
  };

  const handleAnswerSubmit = (option) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (option === currentQuestion.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz finished
      const topicsText = selectedTopicIds.join(', ');
      addQuizResult({
        score,
        total: quizQuestions.length,
        topics: topicsText
      });
      setQuizState('results');
    }
  };

  const handleReset = () => {
    setQuizQuestions([]);
    setQuizState('selection');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-zinc-950 dark:text-zinc-50 tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="text-violet-600 dark:text-violet-400 stroke-[2]" />
          Grammar & Special Difficulties
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
          Uji pemahaman tata bahasa Inggris Anda dengan kuis yang dihasilkan AI secara dinamis berdasarkan materi PP1-PP23.
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 flex items-start gap-3 text-sm">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* MAIN STATES */}
      {quizState === 'selection' && (
        <div className="space-y-8">
          {/* Topic Selector */}
          <div className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h2 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-100">
                  Pilih Materi Kuis
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
                  Kuis akan berfokus pada struktur tata bahasa & kesulitan khusus dari topik terpilih.
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={selectAllTopics}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Pilih Semua
                </button>
                <button 
                  onClick={deselectAllTopics}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            {/* Grid selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-2">
              {grammarTopics.map((topic) => {
                const isSelected = selectedTopicIds.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    onClick={() => toggleTopic(topic.id)}
                    className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-violet-500/10 dark:bg-violet-500/15 border-violet-500 text-violet-700 dark:text-violet-400 font-semibold'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span className="block font-display font-bold text-sm mb-1">{topic.id}</span>
                    <span className="line-clamp-2 leading-tight">{topic.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Start Button */}
            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
              <button
                onClick={handleStartQuiz}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-tr from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                Generate Grammar Quiz
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Quiz History */}
          <div className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-900">
              <h2 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <History size={18} className="text-zinc-400" />
                Riwayat Kuis Lokal
              </h2>
              {quizHistory.length > 0 && (
                <button
                  onClick={clearQuizHistory}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 size={13} /> Hapus Semua
                </button>
              )}
            </div>

            {quizHistory.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {quizHistory.map((historyItem) => (
                  <div 
                    key={historyItem.id}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/30 flex justify-between items-center gap-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        Topik: <span className="text-violet-600 dark:text-violet-400">{historyItem.topics}</span>
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-medium">{historyItem.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-100">
                        {historyItem.score} / {historyItem.total}
                      </div>
                      <div className="text-[10px] font-bold text-zinc-600 dark:text-zinc-450 mt-0.5 uppercase tracking-wider">
                        Score
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                Belum ada riwayat kuis. Hasil kuis Anda akan otomatis tersimpan di sini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {quizState === 'loading' && (
        <div className="glass-card rounded-3xl p-12 border border-zinc-200/60 dark:border-zinc-800/30 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse-slow" />
            <Loader2 className="animate-spin text-violet-600 dark:text-violet-400 relative z-10" size={56} />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-zinc-800 dark:text-zinc-100">
              Generating Quiz...
            </h2>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 mt-2 max-w-sm font-medium">
              AI sedang menyusun {selectedTopicIds.length} pertanyaan tata bahasa khusus yang disesuaikan dengan konsep PP1-PP23 pilihan Anda.
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ STATE */}
      {quizState === 'active' && quizQuestions.length > 0 && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="flex justify-between items-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
            <span>Pertanyaan {currentQuestionIndex + 1} dari {quizQuestions.length}</span>
            <span>Skor Saat Ini: {score}</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-linear-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-zinc-200/60 dark:border-zinc-800/30 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 text-xs font-bold border border-violet-200/35 dark:border-violet-800/20">
                Clue: {quizQuestions[currentQuestionIndex].topicId}
              </span>
              {grammarTopics.find(t => t.id === quizQuestions[currentQuestionIndex].topicId) && (
                <span className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 text-xs font-medium border border-zinc-200/40 dark:border-zinc-800/20">
                  {grammarTopics.find(t => t.id === quizQuestions[currentQuestionIndex].topicId).title}
                </span>
              )}
            </div>

            <h2 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100 text-left leading-relaxed mt-2">
              {quizQuestions[currentQuestionIndex].question}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3.5">
              {quizQuestions[currentQuestionIndex].options.map((option, index) => {
                const isSelected = selectedOption === option;
                const isCorrectAnswer = option === quizQuestions[currentQuestionIndex].answer;
                
                let buttonStyle = 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300';
                
                if (isAnswered) {
                  if (isCorrectAnswer) {
                    buttonStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold';
                  } else if (isSelected) {
                    buttonStyle = 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 font-semibold';
                  } else {
                    buttonStyle = 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500';
                  }
                } else if (isSelected) {
                  buttonStyle = 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-400 font-semibold';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSubmit(option)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border text-left text-sm flex items-center justify-between gap-4 transition-all duration-200 ${buttonStyle} ${!isAnswered ? 'hover:scale-[1.01] cursor-pointer' : ''}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrectAnswer && <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />}
                    {isAnswered && isSelected && !isCorrectAnswer && <XCircle className="text-rose-500 shrink-0" size={18} />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/30 space-y-2 animate-fade-in-up">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <HelpCircle size={14} /> Penjelasan Tata Bahasa:
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {quizQuestions[currentQuestionIndex].explanation}
                </p>
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-5 py-3 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  {currentQuestionIndex + 1 === quizQuestions.length ? 'Selesai & Lihat Hasil' : 'Pertanyaan Berikutnya'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESULTS STATE */}
      {quizState === 'results' && (
        <div className="glass-card rounded-3xl p-8 border border-zinc-200/60 dark:border-zinc-800/30 text-center space-y-8 max-w-lg mx-auto">
          <div>
            <div className="inline-flex p-4 bg-violet-100 dark:bg-violet-950/40 rounded-3xl border border-violet-200/30 dark:border-violet-800/20 text-violet-600 dark:text-violet-400 mb-4 animate-float">
              <Sparkles size={40} />
            </div>
            <h2 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-zinc-50">
              Kuis Selesai!
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
              Kerja bagus! Berikut skor akhir latihan tata bahasa Anda.
            </p>
          </div>

          {/* Score Circle */}
          <div className="relative flex items-center justify-center w-36 h-36 mx-auto rounded-full bg-linear-to-tr from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/10">
            <div>
              <div className="font-display font-extrabold text-4xl leading-none">
                {Math.round((score / quizQuestions.length) * 100)}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest mt-1 text-violet-200">
                Skor: {score} / {quizQuestions.length}
              </div>
            </div>
          </div>

          {/* Feedback phrase */}
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {score === quizQuestions.length 
              ? 'Luar biasa! Pemahaman Anda sempurna untuk materi ini.'
              : score >= 3
                ? 'Sangat baik! Anda sudah menguasai sebagian besar materi.'
                : 'Jangan patah semangat. Ulas kembali panduan belajar dan coba lagi!'}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <RotateCcw size={15} /> Pilih Materi Baru
            </button>
            <button
              onClick={handleStartQuiz}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-violet-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Ulangi Kuis Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
