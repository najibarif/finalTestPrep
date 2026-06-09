import React from 'react';
import { usePractice } from '../context/PracticeContext';
import { 
  BookOpen, 
  Settings, 
  Sun, 
  Moon, 
  GraduationCap,
  Sparkles,
  BookText,
  FileEdit,
  Mic,
  Volume2
} from 'lucide-react';

export default function Navbar({ onOpenSettings }) {
  const { 
    activeTab, 
    setActiveTab, 
    darkMode, 
    setDarkMode 
  } = usePractice();

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: GraduationCap },
    { id: 'grammar', name: 'Grammar Quiz', icon: Sparkles },
    { id: 'listening', name: 'Listening', icon: Volume2 },
    { id: 'reading', name: 'Reading', icon: BookOpen },
    { id: 'writing', name: 'Writing Practice', icon: FileEdit },
    { id: 'interview', name: 'Interview AI', icon: Mic },
    { id: 'study', name: 'Study Guide', icon: BookText }
  ];

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between transition-all duration-300">
      {/* Brand logo */}
      <div 
        onClick={() => setActiveTab('dashboard')} 
        className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
      >
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md group-hover:scale-105 transition-all duration-300 shrink-0">
          <img src="/logo.svg" alt="Armidale English College Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="font-display font-extrabold text-base sm:text-xl tracking-tight bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Final Test Prep
          </span>
          <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-0.5">
            English Accelerator
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="hidden lg:flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-xs border-b border-violet-100 dark:border-zinc-700/50 font-semibold' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <Icon size={16} className={isActive ? 'stroke-[2.5]' : ''} />
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Mobile menu trigger button - simple dropdown fallback/study selector can be inside the page */}
        <div className="lg:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none"
          >
            {navItems.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 border border-zinc-200/50 dark:border-zinc-800/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings Button */}
        {!import.meta.env.VITE_GEMINI_API_KEY && (
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 border border-zinc-200/50 dark:border-zinc-800/40 hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
            aria-label="Open settings"
          >
            <Settings size={18} />
          </button>
        )}
      </div>
    </nav>
  );
}
