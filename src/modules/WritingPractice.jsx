import React, { useState, useEffect } from 'react';
import { usePractice } from '../context/PracticeContext';
import { analyzeEssay } from '../utils/gemini';
import { 
  FileEdit, 
  Sparkles, 
  Loader2, 
  AlertTriangle,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';

const WRITING_PROMPTS = [
  {
    category: 'Society',
    title: 'The Impact of Social Media on Modern Communities',
    description: 'Write an essay discussing whether social media platforms have brought people closer together or isolated them from face-to-face society.'
  },
  {
    category: 'Society',
    title: 'Urbanization and the Decline of Traditional Lifestyles',
    description: 'As more people move to large cities, traditional lifestyles and values are disappearing. Discuss the advantages and disadvantages of this trend.'
  },
  {
    category: 'Family',
    title: 'The Changing Roles of Family Members',
    description: 'In modern society, roles within families have shifted significantly compared to past generations. Analyze how these changes affect children.'
  },
  {
    category: 'Family',
    title: 'Balancing Career and Family Life',
    description: 'Many parents struggle to balance demanding jobs with spending quality time with their families. What are the causes of this, and how can it be resolved?'
  }
];

export default function WritingPractice({ onOpenSettings }) {
  const { geminiKey, writingDraft, writingTitle, saveWritingDraft } = usePractice();

  // Local editor states
  const [title, setTitle] = useState(writingTitle || '');
  const [content, setContent] = useState(writingDraft || '');
  const [wordCount, setWordCount] = useState(0);
  
  // Grading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Auto-calculate word count on typing
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
    saveWritingDraft(title, content);
  }, [content, title]);

  const selectPrompt = (prompt) => {
    setTitle(prompt.title);
    setFeedback(null);
  };

  const isWordCountValid = wordCount >= 250 && wordCount <= 350;
  const isFormValid = isWordCountValid && title.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (!geminiKey) {
      setError('Masukkan API Key Gemini di settings untuk mendapatkan analisis esai otomatis.');
      onOpenSettings();
      return;
    }

    setIsLoading(true);
    setError('');
    setFeedback(null);

    try {
      const response = await analyzeEssay(geminiKey, title, content);
      if (response && typeof response.score === 'number') {
        setFeedback(response);
      } else {
        throw new Error('Format respon analisis esai dari AI tidak sesuai.');
      }
    } catch (err) {
      setError(err.message || 'Gagal menganalisis esai. Silakan coba beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDraft = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus draft tulisan Anda?')) {
      setTitle('');
      setContent('');
      setFeedback(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="font-display font-extrabold text-3xl text-zinc-950 dark:text-zinc-50 tracking-tight flex items-center justify-center gap-3">
          <FileEdit className="text-violet-600 dark:text-violet-400 stroke-[2]" />
          Writing Practice
        </h1>
        <p className="text-sm text-zinc-650 dark:text-zinc-400 mt-2 font-medium">
          Latihan menulis komposisi dengan topik Masyarakat (Society) dan Keluarga (Family). Maksimal 350 kata.
        </p>
      </div>

      {/* ERROR / WARNING PANEL */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 flex items-start gap-3 text-sm animate-fade-in-up">
          <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Critical exam rules alert */}
      <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-xs flex gap-3 leading-relaxed">
        <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" size={18} />
        <div>
          <span className="font-bold">PERATURAN CRITICAL FINAL TEST:</span> Jangan lupa untuk menulis <span className="underline font-bold">Judul Esai (Title)</span> di kotak yang disediakan. Berdasarkan catatan kelas, jika Anda tidak menulis judul, Anda akan mendapatkan <span className="font-bold underline text-rose-600 dark:text-rose-400">skor nol (zero)!</span> Panjang tulisan harus berkisar antara <span className="font-bold">250 hingga 350 kata</span>.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT PANEL: Prompts / Topics list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-3xl p-5 border border-zinc-200/60 dark:border-zinc-800/30">
            <h2 className="font-display font-bold text-base text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-violet-600" />
              Pilihan Topik Esai
            </h2>
            
            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {WRITING_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => selectPrompt(prompt)}
                  className={`w-full text-left p-3.5 rounded-2xl border text-xs leading-relaxed transition-all cursor-pointer block ${
                    title === prompt.title
                      ? 'bg-violet-500/10 dark:bg-violet-500/15 border-violet-500 text-violet-800 dark:text-violet-400 font-semibold'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-2 ${
                    prompt.category === 'Family' 
                      ? 'bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400' 
                      : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                  }`}>
                    {prompt.category}
                  </span>
                  <h3 className="font-bold text-sm leading-snug mb-1 text-zinc-800 dark:text-zinc-200">
                    {prompt.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1.5 line-clamp-2 font-medium">
                    {prompt.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE/RIGHT PANEL: The Editor and Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* Essay Editor Box */}
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-zinc-200/60 dark:border-zinc-800/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title input */}
              <div>
                <label htmlFor="writing-title" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Judul Komposisi (Essay Title) <span className="text-rose-500">*wajib</span>
                </label>
                <input
                  id="writing-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul esai Anda di sini..."
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>

              {/* Textarea */}
              <div>
                <label htmlFor="writing-content" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Isi Tulisan (Essay Content)
                </label>
                <textarea
                  id="writing-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={14}
                  placeholder="Tuliskan komposisi esai Anda di sini. Mulailah dengan paragraf pembuka (opening), isi paragraf (body), dan paragraf penutup (closing)..."
                  className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-sans"
                />
              </div>

              {/* Status Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                {/* Word counter display */}
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-2xl text-xs font-bold border ${
                    isWordCountValid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}>
                    Jumlah Kata: {wordCount} / 350
                  </div>
                  
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 font-bold">
                    (Target: 250 - 350 kata)
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    Hapus Draft
                  </button>

                  <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                      isFormValid
                        ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                        : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    Submit & Evaluasi AI
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* AI FEEDBACK VIEW */}
          {isLoading && (
            <div className="glass-card rounded-3xl p-8 border border-zinc-200/60 dark:border-zinc-800/30 flex flex-col items-center justify-center text-center space-y-4 animate-pulse-slow">
              <Loader2 className="animate-spin text-violet-600" size={36} />
              <div>
                <h2 className="font-display font-bold text-zinc-850 dark:text-zinc-100">Sedang Menganalisis Esai...</h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-medium">AI sedang menganalisis grammar, vocabulary, struktur paragraf, dan kohesi esai Anda.</p>
              </div>
            </div>
          )}

          {feedback && (
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/[0.02] space-y-6 animate-fade-in-up">
              {/* Score Dashboard */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-200/10 dark:border-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Award size={24} />
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-xl text-zinc-900 dark:text-zinc-50">
                      Evaluasi AI Selesai
                    </h2>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-bold">Analisis berdasarkan kriteria IELTS/TOEFL Writing</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Score</span>
                    <span className="font-display font-extrabold text-2xl text-emerald-600 dark:text-emerald-400">
                      {feedback.score} / 100
                    </span>
                  </div>
                  <div className="h-8 w-px bg-zinc-200/15 dark:bg-zinc-800" />
                  <div className="text-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-display font-black text-xl w-12 h-12 flex items-center justify-center rounded-2xl">
                    {feedback.grade}
                  </div>
                </div>
              </div>

              {/* Feedbacks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Grammar */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/45 dark:border-zinc-800/20">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Grammar & Sentence Structure
                  </h3>
                  <p className="text-xs text-zinc-750 dark:text-zinc-300 leading-relaxed font-medium">
                    {feedback.grammarFeedback}
                  </p>
                </div>

                {/* Vocabulary */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/45 dark:border-zinc-800/20">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Vocabulary & Diction
                  </h3>
                  <p className="text-xs text-zinc-750 dark:text-zinc-300 leading-relaxed font-medium">
                    {feedback.vocabularyFeedback}
                  </p>
                </div>

                {/* Coherence */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/45 dark:border-zinc-800/20 md:col-span-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Cohesion, Organization & Essay flow
                  </h3>
                  <p className="text-xs text-zinc-750 dark:text-zinc-300 leading-relaxed font-medium">
                    {feedback.cohesionFeedback}
                  </p>
                </div>
              </div>

              {/* Grammar Corrections List */}
              {feedback.corrections && feedback.corrections.length > 0 && (
                <div className="pt-4 border-t border-zinc-150/10 dark:border-zinc-900 space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-455">
                    Koreksi Grammar Spesifik (Corrections):
                  </h3>
                  <div className="space-y-3">
                    {feedback.corrections.map((corr, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 rounded-2xl bg-rose-500/[0.02] border border-rose-500/10 text-xs space-y-1.5"
                      >
                        <div className="line-through text-rose-700 dark:text-rose-400/80 font-medium">
                          "{corr.original}"
                        </div>
                        <div className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                          <ChevronRight size={12} className="stroke-[3]" />
                          "{corr.corrected}"
                        </div>
                        {corr.reason && (
                          <div className="text-[10px] text-zinc-600 dark:text-zinc-400 italic font-bold pt-1">
                            Alasan: {corr.reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions list */}
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div className="pt-4 border-t border-zinc-150/10 dark:border-zinc-900 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Rekomendasi Peningkatan:
                  </h3>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-zinc-700 dark:text-zinc-350 font-medium">
                    {feedback.suggestions.map((sug, idx) => (
                      <li key={idx}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
