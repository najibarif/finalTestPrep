import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Mic, FileEdit, GraduationCap, CheckCircle2, Volume2, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-col items-center justify-center animate-fade-in-up space-y-24 py-8 md:py-16">
      
      {/* --- HERO SECTION --- */}
      <section className="relative w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Background Glow Effects specifically for Hero */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/20 dark:bg-violet-600/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/20 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm backdrop-blur-md mb-8 hover:scale-105 transition-transform cursor-default">
          <Sparkles size={16} className="text-violet-600 dark:text-violet-400" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider bg-linear-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Armidale English College
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="relative z-10 font-display font-black text-5xl md:text-7xl tracking-tight leading-tight mb-6">
          Kuasai Bahasa Inggris <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-indigo-400 dark:to-purple-400">
            Lebih Cepat & Interaktif
          </span>
        </h1>

        {/* Subtitle */}
        <p className="relative z-10 text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mb-12 font-medium leading-relaxed">
          Platform persiapan ujian akhir yang dirancang khusus dengan kuis offline dan teknologi AI terintegrasi. Latih tata bahasa, mendengarkan, membaca, hingga simulasi wawancara.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="relative z-10 group inline-flex items-center justify-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-zinc-900/20 dark:shadow-white/10"
        >
          <div className="absolute inset-0 w-full h-full bg-linear-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
            Mulai Belajar Sekarang
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </section>

      {/* --- FEATURES GRID SECTION --- */}
      <section className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-zinc-900 dark:text-zinc-50 mb-4">
            Modul Pembelajaran Lengkap
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium max-w-2xl mx-auto">
            Segala yang Anda butuhkan untuk mempersiapkan Final Test hari pertama dan kedua.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1 */}
          <div className="glass-card p-8 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6">
              <GraduationCap size={28} />
            </div>
            <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-3">Grammar & Structure</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4">
              Ratusan soal tata bahasa offline berdasarkan silabus PP1-PP23, lengkap dengan penjelasan aturan yang mendalam pada setiap opsi jawaban.
            </p>
            <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Kuis Offline Anti-Lag</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Generate Soal Harian AI</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
              <Volume2 size={28} />
            </div>
            <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-3">Listening Practice</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4">
              Dengarkan audio tape asli atau ringkasan cerita dari Unit 15 hingga 33. Pahami konteks cerita sebelum menjawab kuis pemahaman cerita.
            </p>
            <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Text-to-Speech Otomatis</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> 57 Kuis Pemahaman</li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6">
              <FileEdit size={28} />
            </div>
            <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-3">AI Essay Grading</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4">
              Latih kemampuan menulis (Writing Composition). AI akan memeriksa esai Anda dan memberikan skor serta saran perbaikan tata bahasa layaknya penguji sungguhan.
            </p>
            <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Auto-Correction</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Penilaian Koherensi Paragraf</li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="glass-card p-8 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-6">
              <Mic size={28} />
            </div>
            <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-3">Interview AI (Speaking)</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4">
              Simulasi wawancara hari kedua. Bicaralah menggunakan mikrofon Anda, AI akan mentranskripsi suara dan memberikan umpan balik kontekstual.
            </p>
            <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Speech-to-Text</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Feedback Audio Real-time</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS / ADVANTAGES --- */}
      <section className="w-full max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center justify-center p-4 bg-zinc-100 dark:bg-zinc-900 rounded-3xl mb-8">
          <ShieldCheck size={40} className="text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="font-display font-extrabold text-3xl text-zinc-900 dark:text-zinc-50 mb-6">
          Privasi & Kecepatan Terjamin
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
          Seluruh data histori belajar Anda (progres unit, riwayat nilai, draf esai) disimpan secara aman secara lokal (Offline) di memori perangkat Anda. Aplikasi berjalan super cepat tanpa jeda karena meminimalkan penggunaan koneksi internet.
        </p>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="w-full max-w-4xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-linear-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-indigo-500/20">
        <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-6">
          Mulai Persiapan Anda Sekarang
        </h2>
        <p className="text-violet-100 font-medium mb-8 max-w-xl mx-auto">
          Jangan tunggu hingga hari H. Latih kepercayaan diri dan akurasi bahasa Inggris Anda bersama AI hari ini.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-xl cursor-pointer"
        >
          Masuk ke Aplikasi
          <ArrowRight size={20} />
        </button>
      </section>

    </div>
  );
}
