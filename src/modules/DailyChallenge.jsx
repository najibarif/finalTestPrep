import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePractice } from '../context/PracticeContext';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export default function DailyChallenge() {
  const navigate = useNavigate();
  
  const [dailyData, setDailyData] = useState(null);
  const [error, setError] = useState('');
  
  // Quiz running states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState('active'); // 'active' | 'results'

  useEffect(() => {
    try {
      const dataStr = localStorage.getItem('daily_grammar_questions');
      if (dataStr) {
        setDailyData(JSON.parse(dataStr));
      } else {
        setError('Tantangan Harian belum tersedia. Pastikan API Key Gemini sudah diisi dan coba muat ulang halaman.');
      }
    } catch (err) {
      setError('Gagal memuat soal Tantangan Harian.');
    }
  }, []);

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 flex flex-col items-center gap-3">
          <AlertCircle size={32} />
          <h2 className="font-display font-bold text-lg">Gagal Memuat Tantangan Harian</h2>
          <p className="text-sm font-medium max-w-md">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!dailyData || !dailyData.questions) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-24 text-center animate-pulse-slow">
        <Sparkles size={40} className="mx-auto text-violet-500 mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400 font-medium">Memuat Tantangan Harian...</p>
      </div>
    );
  }

  const { questions, topicId, topicTitle } = dailyData;

  const handleAnswerSubmit = (option) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    if (option === currentQuestion.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizState('results');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-zinc-950 dark:text-zinc-50 tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="text-violet-600 dark:text-violet-400 stroke-[2]" />
          Tantangan Harian
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
          Soal grammar acak yang di-generate oleh AI khusus untuk Anda hari ini.
        </p>
      </div>

      {/* ACTIVE QUIZ STATE */}
      {quizState === 'active' && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="flex justify-between items-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
            <span>Pertanyaan {currentQuestionIndex + 1} dari {questions.length}</span>
            <span>Skor Saat Ini: {score}</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-linear-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-zinc-200/60 dark:border-zinc-800/30 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 text-xs font-bold border border-violet-200/35 dark:border-violet-800/20">
                Topik: {topicId}
              </span>
              <span className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 text-xs font-medium border border-zinc-200/40 dark:border-zinc-800/20">
                {topicTitle}
              </span>
            </div>

            <h2 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100 text-left leading-relaxed mt-2">
              {questions[currentQuestionIndex].question}
            </h2>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3.5">
              {questions[currentQuestionIndex].options.map((option, index) => {
                const isSelected = selectedOption === option;
                const isCorrectAnswer = option === questions[currentQuestionIndex].answer;
                
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
                  {questions[currentQuestionIndex].explanation}
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
                  {currentQuestionIndex + 1 === questions.length ? 'Selesai & Lihat Hasil' : 'Pertanyaan Berikutnya'}
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
              Tantangan Selesai!
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
              Kerja bagus! Anda telah menyelesaikan tantangan harian.
            </p>
          </div>

          {/* Score Circle */}
          <div className="relative flex items-center justify-center w-36 h-36 mx-auto rounded-full bg-linear-to-tr from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/10">
            <div>
              <div className="font-display font-extrabold text-4xl leading-none">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest mt-1 text-violet-200">
                Skor: {score} / {questions.length}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-violet-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
