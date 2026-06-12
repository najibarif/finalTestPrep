import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { usePractice } from './context/PracticeContext';
import Navbar from './components/Navbar';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import { Loader2 } from 'lucide-react';

// Lazy load practice modules to split the production JS bundle
const GrammarQuiz = lazy(() => import('./modules/GrammarQuiz'));
const ListeningPractice = lazy(() => import('./modules/ListeningPractice'));
const ReadingComprehension = lazy(() => import('./modules/ReadingComprehension'));
const WritingPractice = lazy(() => import('./modules/WritingPractice'));
const InterviewAI = lazy(() => import('./modules/InterviewAI'));
const DailyChallenge = lazy(() => import('./modules/DailyChallenge'));
const StudyGuide = lazy(() => import('./components/StudyGuide'));

export default function App() {
  const { geminiKey } = usePractice();

  // Auto-generate Daily Challenge questions
  useEffect(() => {
    const generateDailyChallenge = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const lastGenerated = localStorage.getItem('daily_challenge_date');
        
        // Generate new questions if it's a new day and we have an API key
        if (lastGenerated !== today && geminiKey) {
          const { generateGrammarQuiz } = await import('./utils/gemini.js');
          const grammarTopics = (await import('./data/grammarTopics.json')).default;
          
          // Pick a random topic for the daily challenge
          const randomTopic = grammarTopics[Math.floor(Math.random() * grammarTopics.length)];
          const response = await generateGrammarQuiz(geminiKey, [randomTopic]);
          
          if (response && response.questions) {
            localStorage.setItem('daily_grammar_questions', JSON.stringify({
              topicId: randomTopic.id,
              topicTitle: randomTopic.title,
              questions: response.questions
            }));
            localStorage.setItem('daily_challenge_date', today);
          }
        }
      } catch (error) {
        console.error('Failed to generate daily challenge:', error);
      }
    };
    
    // Slight delay to not block initial render
    const timeout = setTimeout(generateDailyChallenge, 2000);
    return () => clearTimeout(timeout);
  }, [geminiKey]);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 transition-colors duration-300 overflow-x-hidden">
      {/* Background glow effects for premium dark mode */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/5 dark:bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header / Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-24 animate-pulse-slow">
            <Loader2 className="animate-spin text-violet-600 dark:text-violet-400" size={40} />
            <p className="text-sm text-zinc-650 dark:text-zinc-400 mt-3 font-semibold">Memuat Modul Latihan...</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/grammar" element={<GrammarQuiz />} />
            <Route path="/listening" element={<ListeningPractice />} />
            <Route path="/reading" element={<ReadingComprehension />} />
            <Route path="/writing" element={<WritingPractice />} />
            <Route path="/interview" element={<InterviewAI />} />
            <Route path="/daily" element={<DailyChallenge />} />
            <Route path="/study" element={<StudyGuide />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-6 mt-12 border-t border-zinc-200/50 dark:border-zinc-800/40 text-center text-xs text-zinc-500 dark:text-zinc-500 glass-panel">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-bold text-zinc-700 dark:text-zinc-300">
            <img src="/logo.svg" alt="Armidale English College Logo" className="w-5 h-5 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" />
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

      <Analytics />
      <SpeedInsights />
    </div>
  );
}
