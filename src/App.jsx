import React, { useState } from 'react';
import { usePractice } from './context/PracticeContext';
import Navbar from './components/Navbar';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import SettingsModal from './components/SettingsModal';
import Dashboard from './components/Dashboard';
import GrammarQuiz from './modules/GrammarQuiz';
import ListeningPractice from './modules/ListeningPractice';
import ReadingComprehension from './modules/ReadingComprehension';
import WritingPractice from './modules/WritingPractice';
import InterviewAI from './modules/InterviewAI';
import StudyGuide from './components/StudyGuide';
import { Sparkles, Key, GraduationCap } from 'lucide-react';

export default function App() {
  const { activeTab, geminiKey } = usePractice();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Render current active panel
  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onOpenSettings={() => setIsSettingsOpen(true)} />;
      case 'grammar':
        return <GrammarQuiz onOpenSettings={() => setIsSettingsOpen(true)} />;
      case 'listening':
        return <ListeningPractice />;
      case 'reading':
        return <ReadingComprehension />;
      case 'writing':
        return <WritingPractice onOpenSettings={() => setIsSettingsOpen(true)} />;
      case 'interview':
        return <InterviewAI onOpenSettings={() => setIsSettingsOpen(true)} />;
      case 'study':
        return <StudyGuide />;
      default:
        return <Dashboard onOpenSettings={() => setIsSettingsOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 transition-colors duration-300">
      {/* Background glow effects for premium dark mode */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/5 dark:bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header / Navbar */}
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {renderActiveModule()}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-6 mt-12 border-t border-zinc-200/50 dark:border-zinc-800/40 text-center text-xs text-zinc-500 dark:text-zinc-500 glass-panel">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-bold text-zinc-700 dark:text-zinc-300">
            <img src="/logo.jpg" alt="Armidale English College Logo" className="w-5 h-5 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" />
            <span>English Final Test Prep</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            © 2026 Final Test Prep. Created by
            <a 
              href="https://www.instagram.com/nnajibba" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              @nnajibba
            </a>
          </p>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
