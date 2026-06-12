import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePractice } from '../context/PracticeContext';
import { 
  BookOpen, 
  Sun, 
  Moon, 
  GraduationCap,
  Sparkles,
  BookText,
  FileEdit,
  Mic,
  Volume2
} from 'lucide-react';

export default function Navbar() {
  const { 
    darkMode, 
    setDarkMode 
  } = usePractice();
  
  const navigate = useNavigate();

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
        onClick={() => navigate('/dashboard')} 
        className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
      >
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md group-hover:scale-105 transition-all duration-300 shrink-0">
          <img src="/logo.svg" alt="Armidale English College Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="font-display font-extrabold text-base sm:text-xl tracking-tight bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Final Test Prep
          </span>
          <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mt-0.5">
            English Accelerator
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="hidden lg:flex items-center gap-1.5 p-1 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) => `
                relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 cursor-pointer
                ${isActive 
                  ? 'text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 shadow-xs ring-1 ring-zinc-200/50 dark:ring-zinc-700/50 scale-[1.02]' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}
              `}
            >
              <Icon size={18} className="shrink-0" strokeWidth={2.5} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Mobile menu trigger button - simple dropdown fallback/study selector can be inside the page */}
        <div className="lg:hidden">
          <select
            value={window.location.pathname.replace('/', '') || 'dashboard'}
            onChange={(e) => navigate(`/${e.target.value}`)}
            className="bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none"
            aria-label="Pilih Menu Latihan"
          >
            {navItems.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 border border-zinc-200/50 dark:border-zinc-800/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}
