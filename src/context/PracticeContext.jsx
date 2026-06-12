import React, { createContext, useContext, useState, useEffect } from 'react';

const PracticeContext = createContext();

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};

export const PracticeProvider = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark mode for premium feel
  });

  // Gemini API Key state
  const [geminiKey, setGeminiKey] = useState(() => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';
  });

  // Study history & scores (localStorage)
  const [quizHistory, setQuizHistory] = useState(() => {
    const saved = localStorage.getItem('quiz_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Writing practice draft
  const [writingDraft, setWritingDraft] = useState(() => {
    return localStorage.getItem('writing_draft') || '';
  });
  
  const [writingTitle, setWritingTitle] = useState(() => {
    return localStorage.getItem('writing_title') || '';
  });

  // Reading Comprehension state
  const [selectedReadingUnit, setSelectedReadingUnit] = useState(6);
  const [readingProgress, setReadingProgress] = useState(() => {
    const saved = localStorage.getItem('reading_progress');
    return saved ? JSON.parse(saved) : {}; // Maps unit numbers to status (e.g. {6: 'completed'})
  });

  // Interview state
  const [interviewHistory, setInterviewHistory] = useState(() => {
    const saved = localStorage.getItem('interview_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Effect to handle dark class on document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Save changes to localStorage
  const updateGeminiKey = (key) => {
    setGeminiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const addQuizResult = (result) => {
    const newHistory = [
      {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
        ...result
      },
      ...quizHistory
    ];
    setQuizHistory(newHistory);
    localStorage.setItem('quiz_history', JSON.stringify(newHistory));
  };

  const clearQuizHistory = () => {
    setQuizHistory([]);
    localStorage.removeItem('quiz_history');
  };

  const saveWritingDraft = (title, text) => {
    setWritingTitle(title);
    setWritingDraft(text);
    localStorage.setItem('writing_title', title);
    localStorage.setItem('writing_draft', text);
  };

  const markReadingCompleted = (unit) => {
    const progress = { ...readingProgress, [unit]: 'completed' };
    setReadingProgress(progress);
    localStorage.setItem('reading_progress', JSON.stringify(progress));
  };

  const addInterviewFeedback = (topic, transcript, feedback, correction) => {
    const session = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      topic,
      transcript,
      feedback,
      correction
    };
    const updated = [session, ...interviewHistory];
    setInterviewHistory(updated);
    localStorage.setItem('interview_history', JSON.stringify(updated));
  };

  const clearInterviewHistory = () => {
    setInterviewHistory([]);
    localStorage.removeItem('interview_history');
  };

  return (
    <PracticeContext.Provider
      value={{
        darkMode,
        setDarkMode,
        geminiKey,
        updateGeminiKey,
        quizHistory,
        addQuizResult,
        clearQuizHistory,
        writingDraft,
        writingTitle,
        saveWritingDraft,
        selectedReadingUnit,
        setSelectedReadingUnit,
        readingProgress,
        markReadingCompleted,
        interviewHistory,
        addInterviewFeedback,
        clearInterviewHistory
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
};
