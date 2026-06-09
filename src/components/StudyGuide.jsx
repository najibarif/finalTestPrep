import React, { useState } from 'react';
import grammarData from '../data/grammarTopics.json';
import readingData from '../data/readingPassages.json';
import listeningData from '../data/listeningUnits.json';
import { Search, BookText, Bookmark, BookOpen, Volume2 } from 'lucide-react';

export default function StudyGuide() {
  const [activeSubTab, setActiveSubTab] = useState('grammar'); // 'grammar', 'reading', 'listening'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter lists based on search
  const filteredGrammar = grammarData.filter(
    item => 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keyStructures.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specialDifficulties.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReading = readingData.filter(
    item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mainIdea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vocabulary.some(
        v => v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
             v.definition.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const filteredListening = listeningData.filter(
    item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-zinc-950 dark:text-zinc-50 tracking-tight">
          Panduan Belajar & Referensi
        </h1>
        <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mt-2 max-w-xl mx-auto font-medium">
          Materi lengkap persiapan Final Test: Tata Bahasa (PP1-PP23), Kosakata Reading (Unit 6-20), dan Ringkasan Listening (Unit 15-32).
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/40">
        {/* Navigation tabs */}
        <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 w-full md:w-auto">
          <button
            onClick={() => { setActiveSubTab('grammar'); setSearchQuery(''); }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
              activeSubTab === 'grammar'
                ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Bookmark size={15} />
            Grammar (PP1-PP23)
          </button>
          <button
            onClick={() => { setActiveSubTab('reading'); setSearchQuery(''); }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
              activeSubTab === 'reading'
                ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <BookOpen size={15} />
            Reading (Unit 6-20)
          </button>
          <button
            onClick={() => { setActiveSubTab('listening'); setSearchQuery(''); }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
              activeSubTab === 'listening'
                ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Volume2 size={15} />
            Listening (Unit 15-32)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 transition-all"
            aria-label="Cari materi belajar"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Grammar Subtab */}
        {activeSubTab === 'grammar' && (
          filteredGrammar.length > 0 ? (
            filteredGrammar.map((topic) => (
              <div 
                key={topic.id}
                className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 h-full w-1.5 bg-linear-to-b from-violet-600 to-indigo-600" />
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 font-display font-extrabold text-base border border-violet-200/30 dark:border-violet-800/20 shadow-xs">
                      {topic.id}
                    </span>
                    <div>
                      <h2 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {topic.title}
                      </h2>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 uppercase tracking-wider font-bold text-[10px]">
                        Grammar Key Structure
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2">
                      Key Structures:
                    </h3>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {topic.keyStructures}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-2">
                      Special Difficulties / Notes:
                    </h3>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/30 dark:border-zinc-800/20">
                      {topic.specialDifficulties}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">Materi grammar tidak ditemukan.</div>
          )
        )}

        {/* Reading Subtab */}
        {activeSubTab === 'reading' && (
          filteredReading.length > 0 ? (
            filteredReading.map((item) => (
              <div 
                key={item.unit}
                className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 h-full w-1.5 bg-linear-to-b from-indigo-600 to-blue-600" />
                <div className="flex gap-4 mb-4">
                  <span className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-display font-extrabold text-base border border-indigo-200/30 dark:border-indigo-800/20 shadow-xs">
                    U-{item.unit}
                  </span>
                  <div>
                    <h2 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-0.5">
                      Main Idea: <span className="text-zinc-700 dark:text-zinc-300 font-medium italic">{item.mainIdea}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
                    Target Vocabularies (Kosakata Kunci):
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {item.vocabulary.map((vocab, vIdx) => (
                      <div 
                        key={vIdx}
                        className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/30 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors"
                      >
                        <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                          {vocab.word}
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-normal">
                          {vocab.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">Materi reading tidak ditemukan.</div>
          )
        )}

        {/* Listening Subtab */}
        {activeSubTab === 'listening' && (
          filteredListening.length > 0 ? (
            filteredListening.map((item) => (
              <div 
                key={item.unit}
                className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30 hover:-translate-y-0.5 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 h-full w-1.5 bg-linear-to-b from-pink-600 to-rose-600" />
                <div className="flex gap-4">
                  <span className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-display font-extrabold text-base border border-rose-200/30 dark:border-rose-800/20 shadow-xs">
                    U-{item.unit}
                  </span>
                  <div className="flex-1">
                    <h2 className="font-display font-bold text-lg text-zinc-800 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-0.5 uppercase tracking-wider text-[10px]">
                      Listening Summary
                    </p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-4 leading-relaxed font-medium bg-zinc-50/60 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/35 dark:border-zinc-800/20">
                      "{item.summary}"
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">Materi listening tidak ditemukan.</div>
          )
        )}
      </div>
    </div>
  );
}
