import React, { useState, useEffect, useRef } from 'react';
import { usePractice } from '../context/PracticeContext';
import { speakText, stopSpeaking } from '../utils/speech';
import { generateListeningQuiz } from '../utils/gemini';
import listeningUnits from '../data/listeningUnits.json';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square,
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertTriangle,
  ChevronRight, 
  Info, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

// Custom Youtube Icon component because lucide-react v1+ does not include brand logos
const Youtube = ({ size = 24, className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9" />
  </svg>
);


const YOUTUBE_MAPPING = {
  15: "B_pcdjcOuGo",
  16: "f8jAzdEVrN0",
  17: "hixQvce4BrM",
  18: "H-EUAAzA4DI",
  19: "RYI9VeqL4s8",
  20: "n_BhJ63F6yU",
  21: "McYTv4R9wT4",
  22: "zvlQZM-ZvpU",
  23: "QX8AIGJ-sWM",
  24: "HE39Ccce4AI",
  25: "T1fBAFsCYMU",
  26: "LjR0O_zDXRc",
  27: "hLiH5DZQDBk",
  28: "B-1elIPVcnQ",
  29: "w9dfrpf2WSw",
  30: "nrujfWQWGvo",
  31: "4guObor8AoM",
  32: "_U4ksyfJvbs",
  33: "v_Eo2VzGRUc"
};

export default function ListeningPractice() {
  const { geminiKey } = usePractice();
  
  // States
  const [selectedUnit, setSelectedUnit] = useState(listeningUnits[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioMode, setAudioMode] = useState('full'); // 'full' | 'summary'
  
  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionIndex: selectedOption }
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState('');
  
  // Progress states
  const [listeningProgress, setListeningProgress] = useState(() => {
    const saved = localStorage.getItem('listening_progress');
    return saved ? JSON.parse(saved) : {};
  });

  // Clean up speech synthesis on unmount or when changing unit
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    stopSpeaking();
    setIsPlaying(false);
    setShowTranscript(false);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizError('');
  }, [selectedUnit]);

  // Audio speech synthesis trigger
  const handlePlayAudio = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakText(`Listening Unit ${selectedUnit.unit}: ${selectedUnit.title}. Summary: ${selectedUnit.summary}`, {
      rate: 0.85, // Slightly slower for better listening comprehension
      onEnd: () => {
        setIsPlaying(false);
      },
      onError: (err) => {
        console.error('TTS Error:', err);
        setIsPlaying(false);
      }
    });
  };

  // Gemini Quiz Generator
  const handleGenerateQuiz = async () => {
    if (!geminiKey) {
      setQuizError('Harap atur Gemini API Key di menu Settings untuk menggunakan fitur Kuis AI.');
      return;
    }

    setLoadingQuiz(true);
    setQuizError('');
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizSubmitted(false);

    try {
      const result = await generateListeningQuiz(geminiKey, selectedUnit.title, selectedUnit.summary);
      if (result && result.questions && Array.isArray(result.questions)) {
        setQuizQuestions(result.questions);
      } else {
        throw new Error('Format respon kuis tidak valid.');
      }
    } catch (err) {
      console.error(err);
      setQuizError(err.message || 'Gagal menghasilkan kuis. Silakan coba lagi.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectOption = (qIdx, option) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({
      ...prev,
      [qIdx]: option
    }));
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(quizAnswers).length < quizQuestions.length) {
      setQuizError('Harap jawab semua pertanyaan terlebih dahulu.');
      return;
    }
    setQuizSubmitted(true);
    setQuizError('');

    // Mark unit completed if score is passing (e.g. answering questions)
    markListeningCompleted(selectedUnit.unit);
  };

  const markListeningCompleted = (unitNum) => {
    const progress = { ...listeningProgress, [unitNum]: 'completed' };
    setListeningProgress(progress);
    localStorage.setItem('listening_progress', JSON.stringify(progress));
  };

  const resetListeningCompleted = (unitNum) => {
    const progress = { ...listeningProgress };
    delete progress[unitNum];
    setListeningProgress(progress);
    localStorage.setItem('listening_progress', JSON.stringify(progress));
  };

  // Score calculation
  const getCorrectAnswersCount = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="font-display font-extrabold text-3xl text-zinc-950 dark:text-zinc-50 tracking-tight flex items-center justify-center gap-3">
          <Volume2 className="text-violet-600 dark:text-violet-400 stroke-[2]" />
          Listening Practice
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Posisikan diri Anda dalam ujian. Dengarkan ringkasan audio unit 15-33, lalu uji pemahaman Anda dengan Kuis AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT SIDEBAR: LIST OF UNITS */}
        <div className="lg:col-span-1 glass-card rounded-3xl p-5 border border-zinc-200/60 dark:border-zinc-800/30 flex flex-col h-[600px]">
          <h3 className="font-display font-bold text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-900">
            Daftar Unit (15 - 33)
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-1">
            {listeningUnits.map((item) => {
              const isSelected = selectedUnit.unit === item.unit;
              const isCompleted = listeningProgress[item.unit] === 'completed';
              
              return (
                <button
                  key={item.unit}
                  onClick={() => setSelectedUnit(item)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-violet-500/10 border border-violet-500 text-violet-700 dark:text-violet-400'
                      : 'bg-transparent border border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:border-zinc-200/50 dark:hover:border-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {isCompleted ? (
                      <CheckCircle2 className="text-emerald-500 shrink-0" size={14} />
                    ) : (
                      <Circle className="text-zinc-300 dark:text-zinc-700 shrink-0" size={14} />
                    )}
                    <span className="truncate">
                      Unit {item.unit}: {item.title}
                    </span>
                  </div>
                  <ChevronRight size={12} className={`opacity-60 transition-transform ${isSelected ? 'translate-x-0.5' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT CONTENT: ACTIVE UNIT */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* AUDIO PLAYER & TRANSCRIPT ACCORDION */}
          <div className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-900">
              <div>
                <span className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">
                  Latihan Listening • Unit {selectedUnit.unit}
                </span>
                <h2 className="font-display font-extrabold text-xl text-zinc-900 dark:text-zinc-50 mt-1">
                  {selectedUnit.title}
                </h2>
              </div>

              {listeningProgress[selectedUnit.unit] === 'completed' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 size={10} /> Selesai
                </span>
              )}
            </div>

            {/* PLAYER BOX */}
            <div className="space-y-4">
              {/* Mode Switcher */}
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-900">
                <span className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                  Pilih Mode Audio:
                </span>
                <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      setIsPlaying(false);
                      setAudioMode('full');
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      audioMode === 'full'
                        ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    <Youtube size={12} />
                    Audio Full (YouTube)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      setIsPlaying(false);
                      setAudioMode('summary');
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      audioMode === 'summary'
                        ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    <Volume2 size={12} />
                    Ringkasan (TTS AI)
                  </button>
                </div>
              </div>

              {audioMode === 'full' ? (
                /* YouTube Full Audio Embed */
                <div className="w-full flex flex-col items-center justify-center space-y-4 py-4 animate-fade-in-up">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg bg-zinc-100 dark:bg-zinc-900">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${YOUTUBE_MAPPING[selectedUnit.unit]}?rel=0&modestbranding=1`}
                      title={`Listening Unit ${selectedUnit.unit}: ${selectedUnit.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="text-center space-y-1">
                    <h4 className="font-display font-bold text-xs text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1.5">
                      <Youtube size={14} className="text-rose-600 dark:text-rose-450" />
                      Audio Full Lesson {selectedUnit.unit}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                      Mainkan rekaman suara asli pelajaran ini untuk latihan mendengar secara menyeluruh.
                    </p>
                    <div className="pt-1">
                      <a
                        href={`https://www.youtube.com/watch?v=${YOUTUBE_MAPPING[selectedUnit.unit]}&list=PLm1xMLh2EIZz_O8BIKhVWEfYuHrTWhtjH`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-650 dark:text-rose-400 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                      >
                        <Youtube size={12} />
                        Buka di YouTube
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* PLAYER BOX (TTS AI SUMMARY READER) */
                <div className="relative rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/30 p-8 flex flex-col items-center justify-center text-center space-y-4 overflow-hidden animate-fade-in-up">
                  {/* Pulsing glow background when playing */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-violet-600/5 dark:bg-violet-400/5 animate-pulse-slow pointer-events-none" />
                  )}

                  {/* Soundwaves animation */}
                  {isPlaying ? (
                    <div className="flex gap-1.5 items-end h-10 text-violet-500 mb-2">
                      <span className="wave-bar h-6 bg-violet-500 dark:bg-violet-400 w-1 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="wave-bar h-10 bg-violet-500 dark:bg-violet-400 w-1 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                      <span className="wave-bar h-8 bg-violet-500 dark:bg-violet-400 w-1 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></span>
                      <span className="wave-bar h-10 bg-violet-500 dark:bg-violet-400 w-1 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="wave-bar h-5 bg-violet-500 dark:bg-violet-400 w-1 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  ) : (
                    <Volume2 className="text-zinc-300 dark:text-zinc-700 mb-2 animate-pulse" size={48} />
                  )}

                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-sm text-zinc-850 dark:text-zinc-100">
                      {isPlaying ? 'Audio Ringkasan Sedang Diputar...' : 'Audio Ringkasan Siap Didengarkan'}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                      {isPlaying 
                        ? 'Dengarkan baik-baik pelafalan bahasa Inggris dan intonasi teks summary.' 
                        : 'Klik tombol di bawah untuk mendengarkan pembacaan teks summary oleh AI.'
                      }
                    </p>
                  </div>

                  <button
                    onClick={handlePlayAudio}
                    className={`flex items-center gap-2 px-6 py-3 font-bold rounded-2xl text-xs transition-all shadow-md active:scale-98 cursor-pointer ${
                      isPlaying
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10'
                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/10 hover:scale-102'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square size={12} className="fill-white" />
                        Hentikan Audio
                      </>
                    ) : (
                      <>
                        <Play size={12} className="fill-white" />
                        Putar Audio Summary
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* TRANSCRIPT CONTROL */}
            <div className="border border-zinc-200/40 dark:border-zinc-800/30 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                <span>{showTranscript ? 'Sembunyikan Teks Ringkasan' : 'Tampilkan Teks Ringkasan (Transkrip)'}</span>
                <ChevronRight size={14} className={`transform transition-transform ${showTranscript ? 'rotate-90' : ''}`} />
              </button>
              
              {showTranscript && (
                <div className="p-4 border-t border-zinc-200/20 dark:border-zinc-800/20 bg-white dark:bg-zinc-950/20 text-xs text-zinc-650 dark:text-zinc-355 leading-relaxed font-medium">
                  {selectedUnit.summary}
                </div>
              )}
            </div>

            {/* COMPLETION PROGRESS ACTION */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-550">
                Pernah mendengarkan unit ini sebelumnya?
              </span>
              {listeningProgress[selectedUnit.unit] === 'completed' ? (
                <button
                  onClick={() => resetListeningCompleted(selectedUnit.unit)}
                  className="text-zinc-400 hover:text-rose-600 font-semibold transition-colors cursor-pointer"
                >
                  Tandai Belum Selesai
                </button>
              ) : (
                <button
                  onClick={() => markListeningCompleted(selectedUnit.unit)}
                  className="text-emerald-600 dark:text-emerald-450 hover:underline font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 size={12} /> Tandai Selesai Langsung
                </button>
              )}
            </div>
          </div>

          {/* QUIZ SECTION */}
          <div className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <HelpCircle className="text-zinc-450" size={18} />
                <h3 className="font-display font-bold text-base text-zinc-850 dark:text-zinc-100">
                  Kuis Pemahaman (Gemini AI)
                </h3>
              </div>
              
              {quizQuestions.length > 0 && !quizSubmitted && (
                <button 
                  onClick={handleGenerateQuiz}
                  className="text-xs text-zinc-500 hover:text-violet-600 flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <RefreshCw size={10} /> Generate Ulang
                </button>
              )}
            </div>

            {/* QUIZ CONTENT GENERATOR BUTTON OR LOADING */}
            {quizQuestions.length === 0 ? (
              <div className="text-center py-6 space-y-4">
                {quizError && (
                  <div className="max-w-md mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 flex items-start gap-2.5 text-xs text-left">
                    <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                    <span>{quizError}</span>
                  </div>
                )}
                
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Uji daya tangkap dengar Anda. Gemini AI akan menganalisis ringkasan cerita unit ini dan membuat kuis pemahaman yang berisi 3 soal pilihan ganda.
                </p>

                <button
                  onClick={handleGenerateQuiz}
                  disabled={loadingQuiz}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-tr from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {loadingQuiz ? (
                    <>
                      <Loader2 className="animate-spin" size={12} />
                      Menyiapkan Soal Kuis...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      Generate Kuis AI
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* ACTIVE QUIZ SCREEN */
              <div className="space-y-6">
                {quizQuestions.map((q, qIdx) => {
                  const selectedOption = quizAnswers[qIdx];
                  const isCorrect = selectedOption === q.answer;
                  
                  return (
                    <div 
                      key={qIdx}
                      className="p-5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-zinc-800/20 space-y-4 animate-fade-in-up"
                    >
                      <h4 className="font-display font-bold text-sm text-zinc-800 dark:text-zinc-100 flex gap-2">
                        <span className="text-violet-600 dark:text-violet-400 shrink-0">{qIdx + 1}.</span>
                        <span>{q.question}</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt) => {
                          const isOptionSelected = selectedOption === opt;
                          const isOptionCorrect = opt === q.answer;
                          
                          let btnStyle = 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50';
                          
                          if (isOptionSelected) {
                            btnStyle = 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-400';
                          }

                          if (quizSubmitted) {
                            if (isOptionCorrect) {
                              btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold';
                            } else if (isOptionSelected) {
                              btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400';
                            } else {
                              btnStyle = 'border-zinc-200/60 dark:border-zinc-800/40 text-zinc-400 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => handleSelectOption(qIdx, opt)}
                              disabled={quizSubmitted}
                              className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation card */}
                      {quizSubmitted && (
                        <div className="p-3.5 rounded-xl bg-zinc-100/60 dark:bg-zinc-950 border border-zinc-200/30 dark:border-zinc-900 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                          <span className={`font-bold block mb-1 ${isCorrect ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-450'}`}>
                            {isCorrect ? '✓ Benar' : `✗ Salah (Jawaban benar: ${q.answer})`}
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* QUIZ SUBMISSION OR RESET BUTTONS */}
                <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-900">
                  {quizError && (
                    <div className="text-xs text-rose-600 font-semibold">
                      {quizError}
                    </div>
                  )}

                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="w-full md:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer hover:scale-102 flex items-center justify-center gap-1 ml-auto"
                    >
                      Kirim Jawaban <ArrowRight size={12} />
                    </button>
                  ) : (
                    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Skor Anda: <span className="text-violet-600 text-sm font-black">{getCorrectAnswersCount()}</span> dari <span className="text-sm font-black">3</span> benar
                      </div>
                      
                      <button
                        onClick={handleGenerateQuiz}
                        className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs transition-colors cursor-pointer"
                      >
                        Coba Lagi (Generate Baru)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
