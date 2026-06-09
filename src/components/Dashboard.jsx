import React from 'react';
import { usePractice } from '../context/PracticeContext';
import { 
  GraduationCap, 
  Award, 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  FileEdit, 
  Mic, 
  ChevronRight, 
  Sparkles,
  Volume2
} from 'lucide-react';

export default function Dashboard() {
  const { 
    setActiveTab, 
    quizHistory, 
    writingDraft, 
    readingProgress, 
    interviewHistory 
  } = usePractice();

  // Calculate statistics
  const completedReadingCount = Object.keys(readingProgress).filter(k => readingProgress[k] === 'completed').length;
  const quizCount = quizHistory.length;
  const avgQuizScore = quizCount > 0 
    ? Math.round((quizHistory.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / quizCount) * 100) 
    : 0;

  const essayWords = writingDraft.trim().split(/\s+/).filter(w => w.length > 0).length;
  const interviewCount = interviewHistory.length;

  // Listening progress statistics
  const listeningProgress = (() => {
    try {
      const saved = localStorage.getItem('listening_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })();
  const completedListeningCount = Object.keys(listeningProgress).filter(k => listeningProgress[k] === 'completed').length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in-up space-y-8">
      
      {/* WELCOME BANNER */}
      <div className="relative rounded-3xl bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl shadow-indigo-500/10 overflow-hidden group">
        {/* Glow circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute -bottom-24 -left-12 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-violet-100 border border-white/10">
              <Sparkles size={12} className="stroke-[2.5]" /> Final Exam Prep
            </span>
            <h1 className="font-display font-extrabold text-2xl md:text-3.5xl tracking-tight leading-tight">
              Siap Menghadapi English Final Test?
            </h1>
            <p className="text-sm text-violet-100 max-w-xl font-medium leading-relaxed">
              Selamat datang di asisten belajar pribadi Anda! Aplikasi ini dirancang khusus untuk mematangkan persiapan tes hari pertama dan kedua Anda dengan simulasi AI interaktif.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('grammar')}
            className="flex items-center gap-2 px-5 py-3 bg-white text-violet-700 font-bold rounded-2xl text-sm shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            Mulai Latihan
            <ChevronRight size={16} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* STATS TILES */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Grammar */}
        <div 
          onClick={() => setActiveTab('grammar')} 
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActiveTab('grammar'))}
          role="button" 
          tabIndex={0}
          aria-label="Latihan Grammar"
          className="glass-card rounded-3xl p-4 sm:p-5 border border-zinc-200/50 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="p-2 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl">
              <Sparkles size={18} />
            </span>
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Grammar</span>
          </div>
          <div className="font-display font-black text-xl sm:text-2xl text-zinc-800 dark:text-zinc-100">
            {quizCount > 0 ? `${avgQuizScore}%` : '-'}
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-650 dark:text-zinc-400 mt-1">{quizCount} kuis diselesaikan</p>
        </div>

        {/* Card 2: Listening */}
        <div 
          onClick={() => setActiveTab('listening')} 
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActiveTab('listening'))}
          role="button" 
          tabIndex={0}
          aria-label="Latihan Listening"
          className="glass-card rounded-3xl p-4 sm:p-5 border border-zinc-200/50 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <Volume2 size={18} />
            </span>
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Listening</span>
          </div>
          <div className="font-display font-black text-xl sm:text-2xl text-zinc-800 dark:text-zinc-100">
            {completedListeningCount} / 19
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-650 dark:text-zinc-400 mt-1">{completedListeningCount} unit selesai didengar</p>
        </div>

        {/* Card 3: Reading */}
        <div 
          onClick={() => setActiveTab('reading')} 
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActiveTab('reading'))}
          role="button" 
          tabIndex={0}
          aria-label="Latihan Reading"
          className="glass-card rounded-3xl p-4 sm:p-5 border border-zinc-200/50 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="p-2 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BookOpen size={18} />
            </span>
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Reading</span>
          </div>
          <div className="font-display font-black text-xl sm:text-2xl text-zinc-800 dark:text-zinc-100">
            {completedReadingCount} / 15
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-650 dark:text-zinc-400 mt-1">Unit selesai dibaca</p>
        </div>

        {/* Card 4: Writing */}
        <div 
          onClick={() => setActiveTab('writing')} 
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActiveTab('writing'))}
          role="button" 
          tabIndex={0}
          aria-label="Latihan Writing"
          className="glass-card rounded-3xl p-4 sm:p-5 border border-zinc-200/50 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="p-2 bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
              <FileEdit size={18} />
            </span>
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Writing</span>
          </div>
          <div className="font-display font-black text-xl sm:text-2xl text-zinc-800 dark:text-zinc-100">
            {essayWords} kata
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-650 dark:text-zinc-400 mt-1">Draf esai saat ini</p>
        </div>

        {/* Card 5: Speaking */}
        <div 
          onClick={() => setActiveTab('interview')} 
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActiveTab('interview'))}
          role="button" 
          tabIndex={0}
          aria-label="Latihan Speaking"
          className="glass-card rounded-3xl p-4 sm:p-5 border border-zinc-200/50 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="p-2 bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-xl">
              <Mic size={18} />
            </span>
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Speaking</span>
          </div>
          <div className="font-display font-black text-xl sm:text-2xl text-zinc-800 dark:text-zinc-100">
            {interviewCount} sesi
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-650 dark:text-zinc-400 mt-1">Evaluasi AI disimpan</p>
        </div>
      </div>

      {/* SCHEDULE COMPARISON GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* FIRST DAY MODULES */}
        <div className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
            <span className="p-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl">
              <Calendar size={20} />
            </span>
            <div>
              <h2 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-100">
                First Day Exam Target
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Jadwal Hari Pertama - Listening, Structure & Writing</p>
            </div>
          </div>

          <div className="space-y-3">
            <div 
              onClick={() => setActiveTab('listening')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActiveTab('listening'))}
              role="button"
              tabIndex={0}
              aria-label="Target Hari Pertama: Listening"
              className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/35 dark:border-zinc-800/20 text-sm hover:border-amber-500/50 dark:hover:border-amber-500/30 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <CheckSquare className="text-amber-500 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold block text-zinc-800 dark:text-zinc-200 text-amber-600 dark:text-amber-400">Listening Old & New (Unit 15-33)</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Pahami ringkasan unit dari PDF cheat sheet untuk mempersiapkan materi audio tape.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/35 dark:border-zinc-800/20 text-sm">
              <CheckSquare className="text-violet-600 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold block text-zinc-800 dark:text-zinc-200">Structure Key PP1-PP23</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Kuasai tata bahasa dan kesulitan khusus (Special Difficulties) seperti modal tenses dan inversion.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/35 dark:border-zinc-800/20 text-sm">
              <CheckSquare className="text-violet-600 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold block text-zinc-800 dark:text-zinc-200">Writing Composition (Maks 350 words)</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Latih menulis esai bertema keluarga/masyarakat, dan pastikan menulis Judul (Title) agar tidak nol.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECOND DAY MODULES */}
        <div className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
            <span className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Calendar size={20} />
            </span>
            <div>
              <h2 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-100">
                Second Day Exam Target
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Jadwal Hari Kedua - Conversation & Comprehensive Reading</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/35 dark:border-zinc-800/20 text-sm">
              <CheckSquare className="text-indigo-600 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold block text-zinc-800 dark:text-zinc-200">Conversation speaking response</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Menjawab dialog secara logis dan responsif untuk topik Life, AEC, dan Karya Seni.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/35 dark:border-zinc-800/20 text-sm">
              <CheckSquare className="text-indigo-600 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold block text-zinc-800 dark:text-zinc-200">Comprehensive Reading (Unit 6-20)</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  Pelajari kosakata target seperti Spaniards, Canals, Gondolier, Soles, dan Mowing di modul Reading.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* RECOMMENDATIONS / NEXT STEP */}
      <div className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30">
        <h2 className="font-display font-bold text-base text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-500" />
          Aktivitas Latihan yang Direkomendasikan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setActiveTab('grammar')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActiveTab('grammar'))}
            role="button"
            tabIndex={0}
            aria-label="Rekomendasi Tata Bahasa"
            className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/30 hover:border-violet-500 dark:hover:border-violet-500/50 cursor-pointer transition-all flex justify-between items-center group focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <div>
              <span className="font-bold text-sm block text-zinc-800 dark:text-zinc-200">Tata Bahasa: PP10 - PP15 Quiz</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Uji reported speech dan conditionals menggunakan AI.</p>
            </div>
            <ChevronRight size={16} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div 
            onClick={() => setActiveTab('listening')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActiveTab('listening'))}
            role="button"
            tabIndex={0}
            aria-label="Rekomendasi Listening"
            className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/30 hover:border-amber-500 dark:hover:border-amber-500/50 cursor-pointer transition-all flex justify-between items-center group focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <div>
              <span className="font-bold text-sm block text-zinc-800 dark:text-zinc-200">Listening: Unit 15 - Late for Work</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Dengarkan audio summary dan ikuti kuis pemahaman AI.</p>
            </div>
            <ChevronRight size={16} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div 
            onClick={() => setActiveTab('interview')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActiveTab('interview'))}
            role="button"
            tabIndex={0}
            aria-label="Rekomendasi Speaking"
            className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/30 hover:border-pink-500 dark:hover:border-pink-500/50 cursor-pointer transition-all flex justify-between items-center group focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <div>
              <span className="font-bold text-sm block text-zinc-800 dark:text-zinc-200">Speaking: AEC Topic Simulation</span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Simulasikan respons dialog mengapa Anda memilih AEC.</p>
            </div>
            <ChevronRight size={16} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

    </div>
  );
}
