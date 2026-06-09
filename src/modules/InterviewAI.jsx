import React, { useState, useEffect, useRef } from 'react';
import { usePractice } from '../context/PracticeContext';
import { analyzeSpeakingResponse, transcribeAudio } from '../utils/gemini';
import { 
  isSpeechRecognitionSupported, 
  createRecognizer, 
  speakText, 
  stopSpeaking 
} from '../utils/speech';
import { 
  Mic, 
  Volume2, 
  RotateCcw, 
  HelpCircle, 
  Loader2, 
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  BookmarkCheck,
  Send,
  Info,
  Keyboard,
  Eye,
  EyeOff
} from 'lucide-react';

const INTERVIEW_QUESTIONS = {
  Life: [
    "Could you tell me about your typical daily routine and how you manage your time?",
    "How has your family or childhood environment influenced the person you are today?",
    "What are your long-term goals in life, and how do you plan to achieve them?"
  ],
  AEC: [
    "Why did you decide to join AEC, and what commitments have you made here?",
    "What is the most challenging part of studying at AEC, and how do you overcome it?",
    "How has studying at AEC improved your confidence in communicating in English?"
  ],
  "Movie/Song/Novel": [
    "Tell me about a movie, song, or novel that has had a strong emotional impact on you.",
    "Who is your favorite character in a book or movie, and why do you admire them?",
    "If you could recommend one piece of art, song, or book to a friend, what would it be and why?"
  ]
};

export default function InterviewAI({ onOpenSettings }) {
  const { geminiKey, interviewHistory, addInterviewFeedback, clearInterviewHistory } = usePractice();

  // Navigation states
  const [topic, setTopic] = useState('Life');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewState, setInterviewState] = useState('setup'); // 'setup' | 'ai_speaking' | 'user_speaking' | 'ai_thinking' | 'finished'

  // User input states
  const [transcript, setTranscript] = useState('');
  const [typeFallback, setTypeFallback] = useState('');
  const [isMicAllowed, setIsMicAllowed] = useState(true);
  const [micError, setMicError] = useState('');
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text'

  // MediaRecorder Fallback states & refs
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // AI responses & visual cues
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [speakingLog, setSpeakingLog] = useState([]); // Array of { role: 'ai'|'user', text, feedback?, correction? }

  const recognizerRef = useRef(null);
  const isSpeechSupported = isSpeechRecognitionSupported();

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
    };
  }, []);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (isSpeechSupported) {
      recognizerRef.current = createRecognizer({
        onResult: (text) => {
          setTranscript(prev => (prev + ' ' + text).trim());
        },
        onEnd: () => {
          // If we are in user speaking state and have text, trigger AI analysis automatically
        },
        onStart: () => {
          setMicError('');
        },
        onError: (err) => {
          console.error(err);
          if (err === 'not-allowed') {
            setIsMicAllowed(false);
            setMicError('Izin mikrofon diblokir. Harap izinkan akses mikrofon di pengaturan browser Anda.');
          } else if (err === 'no-speech') {
            setMicError('Suara tidak terdengar. Silakan coba berbicara lagi.');
          } else {
            setMicError(`Koneksi mikrofon error: ${err}`);
          }
          setInterviewState('user_speaking');
        }
      });
    }
  }, [isSpeechSupported]);

  const handleStartInterview = () => {
    if (!geminiKey) {
      setMicError('Harap konfigurasi Gemini API Key Anda terlebih dahulu.');
      onOpenSettings();
      return;
    }

    setQuestionIndex(0);
    setSpeakingLog([]);
    setTranscript('');
    setMicError('');
    
    const questions = INTERVIEW_QUESTIONS[topic];
    const firstQuestion = questions[0];
    setCurrentQuestion(firstQuestion);
    setInterviewState('ai_speaking');

    // Add to speech log
    setSpeakingLog([{ role: 'ai', text: firstQuestion }]);

    // AI speaks the question
    speakText(`Hello! Let's start our mock interview. The topic is ${topic}. Here is my first question: ${firstQuestion}`, {
      onEnd: () => {
        setTranscript('');
        setInterviewState('user_speaking');
        if (inputMode === 'voice') {
          startListening();
        }
      },
      onError: () => {
        // Fallback if voice synthesis fails
        setTranscript('');
        setInterviewState('user_speaking');
        if (inputMode === 'voice') {
          startListening();
        }
      }
    });
  };

  const startListening = async () => {
    setMicError('');
    setTranscript('');
    
    if (isSpeechSupported) {
      if (recognizerRef.current && isMicAllowed) {
        try {
          recognizerRef.current.start();
        } catch (e) {
          console.error('Failed to start recognizer:', e);
        }
      }
    } else {
      // Fallback MediaRecorder
      audioChunksRef.current = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        let mimeType = 'audio/mp4';
        if (typeof MediaRecorder.isTypeSupported === 'function') {
          if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
          }
        }
        
        let recorder;
        try {
          recorder = new MediaRecorder(stream, { mimeType });
        } catch (e) {
          console.warn('Failed to create MediaRecorder with mimeType:', mimeType, 'trying default...', e);
          try {
            recorder = new MediaRecorder(stream);
          } catch (err) {
            console.error('Failed to create MediaRecorder completely:', err);
            throw new Error('Browser Anda tidak mendukung perekaman audio (MediaRecorder).');
          }
        }
        
        const actualMimeType = recorder.mimeType || mimeType || 'audio/mp4';
        
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        
        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
          stream.getTracks().forEach(track => track.stop());
          
          setIsTranscribing(true);
          try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              try {
                const base64Data = reader.result.split(',')[1];
                const transcription = await transcribeAudio(geminiKey, base64Data, actualMimeType);
                setTranscript(transcription);
              } catch (err) {
                setMicError(`Transkripsi gagal: ${err.message}`);
              } finally {
                setIsTranscribing(false);
              }
            };
          } catch (err) {
            setMicError(`Transkripsi gagal: ${err.message}`);
            setIsTranscribing(false);
          }
        };
        
        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Mic access error:', err);
        setMicError('Gagal mengakses mikrofon. Harap izinkan izin mikrofon di browser Anda.');
      }
    }
  };

  const stopListening = () => {
    if (isSpeechSupported) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const handleSendResponse = async (textToSend) => {
    const responseText = textToSend || transcript || typeFallback;
    if (!responseText.trim()) return;

    stopListening();
    stopSpeaking();
    setInterviewState('ai_thinking');

    // Add user response to chat log
    setSpeakingLog(prev => [...prev, { role: 'user', text: responseText }]);

    try {
      // Call Gemini for speech analysis
      const analysis = await analyzeSpeakingResponse(
        geminiKey, 
        topic, 
        currentQuestion, 
        responseText
      );

      // Save feedback to context history
      addInterviewFeedback(topic, responseText, analysis.feedback, analysis.correctedText);

      // Add feedback response to chat logs
      setSpeakingLog(prev => [...prev, { 
        role: 'ai_feedback', 
        text: analysis.feedback,
        correction: analysis.correctedText
      }]);

      setAiFeedback(analysis.feedback);
      setCorrectedText(analysis.correctedText);
      setInterviewState('ai_speaking');

      // AI speaks the feedback and asks the next question (or finishes)
      const questions = INTERVIEW_QUESTIONS[topic];
      const nextIndex = questionIndex + 1;

      if (nextIndex < questions.length) {
        const nextQ = questions[nextIndex];
        
        speakText(`${analysis.feedback}. Now, let's move to the next question: ${nextQ}`, {
          onEnd: () => {
            setQuestionIndex(nextIndex);
            setCurrentQuestion(nextQ);
            setTranscript('');
            setTypeFallback('');
            setSpeakingLog(prev => [...prev, { role: 'ai', text: nextQ }]);
            setInterviewState('user_speaking');
            if (inputMode === 'voice') {
              startListening();
            }
          }
        });
      } else {
        speakText(`${analysis.feedback}. Thank you! We have completed the interview session on ${topic}. Excellent work!`, {
          onEnd: () => {
            setInterviewState('finished');
          }
        });
      }
    } catch (err) {
      setMicError(err.message || 'Gagal mengirim jawaban ke AI.');
      setInterviewState('user_speaking');
    }
  };

  const handleReset = () => {
    stopSpeaking();
    stopListening();
    setInterviewState('setup');
    setTranscript('');
    setTypeFallback('');
    setSpeakingLog([]);
  };

  // Visual avatar status helper
  const getAvatarColor = () => {
    switch (interviewState) {
      case 'ai_speaking': return 'bg-blue-500 ring-blue-500/20 shadow-blue-500/35';
      case 'user_speaking': return 'bg-emerald-500 ring-emerald-500/20 shadow-emerald-500/35';
      case 'ai_thinking': return 'bg-amber-500 ring-amber-500/20 shadow-amber-500/35';
      case 'finished': return 'bg-violet-500 ring-violet-500/20 shadow-violet-500/35';
      default: return 'bg-zinc-400 ring-zinc-400/20 shadow-zinc-400/20';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="font-display font-extrabold text-3xl text-zinc-950 dark:text-zinc-50 tracking-tight flex items-center justify-center gap-3">
          <Mic className="text-violet-600 dark:text-violet-400 stroke-[2]" />
          Interview AI Simulator
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
          Simulasi tes bicara suara-ke-suara. AI mengajukan pertanyaan dan Gemini menganalisis tata bahasa/logika Anda.
        </p>
      </div>

      {/* ERROR OR MIC ALERT */}
      {micError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 flex items-start gap-3 text-sm animate-fade-in-up">
          <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          <div>{micError}</div>
        </div>
      )}

      {/* SPEECH SUPPORT NOTICE */}
      {!isSpeechSupported && (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/25 border border-indigo-200/50 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs flex gap-2">
          <Info className="shrink-0 mt-0.5" size={16} />
          <div>
            Browser Anda menggunakan <strong>Transkripsi Audio Gemini AI</strong> untuk input suara. Anda dapat berbicara dengan merekam suara atau beralih ke input teks kapan saja.
          </div>
        </div>
      )}

      {/* SETTINGS CHECK */}
      {!geminiKey && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="shrink-0" size={18} />
            <span>Masukkan Gemini API Key Anda untuk memulai simulasi percakapan AI.</span>
          </div>
          <button 
            onClick={onOpenSettings}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
          >
            Atur API Key
          </button>
        </div>
      )}

      {/* INTERVIEW AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls & Avatar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30 text-center flex flex-col items-center justify-center space-y-6">
            
            {/* Topic Selector in Setup */}
            {interviewState === 'setup' && (
              <div className="w-full text-left space-y-4">
                <div>
                  <label htmlFor="topic-selector" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                    Pilih Topik Interview:
                  </label>
                  <div id="topic-selector" className="grid grid-cols-1 gap-2">
                    {Object.keys(INTERVIEW_QUESTIONS).map((tName) => (
                      <button
                        key={tName}
                        onClick={() => setTopic(tName)}
                        className={`w-full p-3.5 rounded-2xl border text-left text-sm font-semibold transition-all cursor-pointer ${
                          topic === tName
                            ? 'bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-400'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:border-zinc-300'
                        }`}
                      >
                        {tName}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartInterview}
                  disabled={!geminiKey}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-tr from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  Mulai Simulasi
                </button>
              </div>
            )}

            {/* Speaking Status Avatar */}
            {interviewState !== 'setup' && (
              <div className="flex flex-col items-center justify-center space-y-4 py-4 w-full">
                
                {/* AI Avatar Head */}
                <div className={`relative flex items-center justify-center w-24 h-24 rounded-full ring-4 shadow-xl text-white transition-all duration-300 ${getAvatarColor()}`}>
                  {interviewState === 'ai_speaking' && <Volume2 className="animate-bounce" size={36} />}
                  {interviewState === 'user_speaking' && <Mic className="animate-pulse" size={36} />}
                  {interviewState === 'ai_thinking' && <Loader2 className="animate-spin" size={36} />}
                  {interviewState === 'finished' && <BookmarkCheck size={36} />}

                  {/* Micro-animation rings */}
                  {interviewState === 'user_speaking' && (
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xs scale-125 animate-pulse-slow pointer-events-none" />
                  )}
                  {interviewState === 'ai_speaking' && (
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xs scale-125 animate-pulse-slow pointer-events-none" />
                  )}
                </div>

                {/* State Text */}
                <div className="space-y-1">
                  <h2 className="font-display font-bold text-base text-zinc-800 dark:text-zinc-100">
                    {interviewState === 'ai_speaking' && 'AI Sedang Berbicara...'}
                    {interviewState === 'user_speaking' && 'AI Mendengarkan Anda...'}
                    {interviewState === 'ai_thinking' && 'AI Sedang Berpikir...'}
                    {interviewState === 'finished' && 'Interview Selesai'}
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    {interviewState === 'user_speaking' && 'Bicaralah sekarang melalui mikrofon.'}
                    {interviewState === 'ai_speaking' && 'Simak pertanyaan atau feedback AI.'}
                    {interviewState === 'ai_thinking' && 'Gemini sedang menganalisis grammar.'}
                  </p>
                </div>

                {/* Micro level indicator when user speaking */}
                {interviewState === 'user_speaking' && isMicAllowed && (isSpeechSupported || isRecording) && (
                  <div className="flex gap-1 items-center justify-center h-6 text-emerald-500 mt-2">
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                  </div>
                )}

                {/* Reset / Quit button */}
                <div className="pt-4 w-full">
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <RotateCcw size={14} /> Berhenti / Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Transcript Log & Feedback panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Conversational Screen */}
          {interviewState !== 'setup' ? (
            <div className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30 flex flex-col h-[400px]">
              <h2 className="font-display font-bold text-sm text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                TRANSKRIP SIMULASI
              </h2>
              
              {/* Chat log scrollable window */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                {speakingLog.map((log, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${log.role === 'user' ? 'ml-auto items-end' : 'items-start'}`}
                  >
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      log.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-none'
                        : log.role === 'ai_feedback'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                    }`}>
                      {log.text}
                    </div>
                    
                    {/* Render correction box inside chat log if feedback card has it */}
                    {log.role === 'ai_feedback' && log.correction && (
                      <div className="mt-1.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-955 border border-zinc-200/40 dark:border-zinc-850 text-xs text-zinc-600 dark:text-zinc-400 space-y-1 w-full font-medium">
                        <span className="font-bold text-emerald-700 dark:text-emerald-450 block">Grammar Correction:</span>
                        "{log.correction}"
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Area (Dynamic for speech transcription or fallback typing) */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
                {interviewState === 'user_speaking' ? (
                  !isMicAllowed ? (
                    /* Fallback typing box */
                    <div className="space-y-2">
                      <div className="text-xs text-rose-700 dark:text-rose-450 font-bold">
                        Mikrofon tidak diizinkan. Mode ketik otomatis diaktifkan.
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={typeFallback}
                          onChange={(e) => setTypeFallback(e.target.value)}
                          placeholder="Ketikkan jawaban Anda di sini..."
                          className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                          onKeyDown={(e) => e.key === 'Enter' && handleSendResponse(typeFallback)}
                          aria-label="Ketikkan jawaban Anda"
                        />
                        <button
                          onClick={() => handleSendResponse(typeFallback)}
                          disabled={!typeFallback.trim()}
                          className={`p-2.5 rounded-xl text-white transition-colors cursor-pointer ${
                            typeFallback.trim()
                              ? 'bg-violet-600 hover:bg-violet-700'
                              : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-650 cursor-not-allowed'
                          }`}
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal modes with switcher */
                    <div className="space-y-3">
                      {/* Input Mode Selector */}
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-900">
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                          Mode Input:
                        </span>
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={() => {
                              stopListening();
                              setInputMode('voice');
                              setTimeout(() => startListening(), 50);
                            }}
                            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              inputMode === 'voice'
                                ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-xs'
                                : 'text-zinc-650 hover:text-zinc-800 dark:hover:text-zinc-300'
                            }`}
                          >
                            <Mic size={12} />
                            Suara (Mic)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              stopListening();
                              setInputMode('text');
                            }}
                            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              inputMode === 'text'
                                ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-xs'
                                : 'text-zinc-650 hover:text-zinc-850 dark:hover:text-zinc-300'
                            }`}
                          >
                            <Keyboard size={12} />
                            Teks (Ketik)
                          </button>
                        </div>
                      </div>

                      {inputMode === 'text' ? (
                        /* Text/Typing Mode */
                        <div className="flex gap-2 animate-fade-in-up">
                          <input
                            type="text"
                            value={typeFallback}
                            onChange={(e) => setTypeFallback(e.target.value)}
                            placeholder="Ketikkan jawaban Anda di sini..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                            onKeyDown={(e) => e.key === 'Enter' && handleSendResponse(typeFallback)}
                            aria-label="Ketikkan jawaban Anda"
                          />
                          <button
                            onClick={() => handleSendResponse(typeFallback)}
                            disabled={!typeFallback.trim()}
                            className={`p-2.5 rounded-xl text-white transition-colors cursor-pointer ${
                              typeFallback.trim()
                                ? 'bg-violet-600 hover:bg-violet-700'
                                : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-650'
                            }`}
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      ) : isSpeechSupported ? (
                        /* Voice controls (Native Chrome/Edge) */
                        <div className="flex justify-between items-center gap-4 animate-fade-in-up">
                          <div className="text-xs text-zinc-600 dark:text-zinc-400 font-bold italic truncate max-w-[70%]">
                            Transkrip: {transcript || 'Belum ada suara terdeteksi...'}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setTranscript('');
                                startListening();
                              }}
                              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                            >
                              Ulang
                            </button>
                            <button
                              onClick={() => handleSendResponse(transcript)}
                              disabled={!transcript}
                              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                                transcript 
                                  ? 'bg-violet-600 hover:bg-violet-700 hover:scale-102 cursor-pointer shadow-violet-500/10'
                                  : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-600 cursor-not-allowed'
                              }`}
                            >
                              Kirim Jawaban
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Voice controls fallback (Firefox, Safari, etc. using MediaRecorder + Gemini Transcribe) */
                        <div className="flex flex-col gap-3 animate-fade-in-up">
                          <div className="flex justify-between items-center gap-4">
                            <div className="text-xs text-zinc-600 dark:text-zinc-400 font-bold italic truncate max-w-[65%]">
                              {isTranscribing ? (
                                <span className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-bold animate-pulse">
                                  <Loader2 className="animate-spin" size={14} /> Mentranskripsi suara Anda...
                                </span>
                              ) : isRecording ? (
                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-450 font-bold animate-pulse">
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" /> Sedang merekam suara...
                                </span>
                              ) : transcript ? (
                                `Hasil rekaman: "${transcript}"`
                              ) : (
                                'Tekan tombol mikrofon untuk berbicara...'
                              )}
                            </div>

                            <div className="flex gap-2">
                              {isRecording ? (
                                <button
                                  type="button"
                                  onClick={stopListening}
                                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all animate-pulse flex items-center gap-1.5"
                                >
                                  <span className="w-2 h-2 rounded-full bg-white animate-ping" /> Selesai
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={startListening}
                                  disabled={isTranscribing}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1"
                                >
                                  <Mic size={12} /> {transcript ? 'Rekam Ulang' : 'Mulai Bicara'}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleSendResponse(transcript)}
                                disabled={!transcript || isRecording || isTranscribing}
                                className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all ${
                                  transcript && !isRecording && !isTranscribing
                                    ? 'bg-violet-600 hover:bg-violet-700 cursor-pointer shadow-violet-500/10'
                                    : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-650 cursor-not-allowed'
                                }`}
                              >
                                Kirim Jawaban
                              </button>
                            </div>
                          </div>
                          
                          {/* Allow user to edit transcription if there was a typo */}
                          {transcript && !isRecording && !isTranscribing && (
                            <div className="flex gap-2 animate-fade-in-up">
                              <input
                                type="text"
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Edit hasil transkripsi jika kurang akurat..."
                                className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                aria-label="Edit hasil transkripsi"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="text-center py-2 text-xs text-zinc-600 dark:text-zinc-400 italic font-medium">
                    AI sedang mengontrol alur bicara...
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Study/History Panel in Setup */
            <div className="glass-card rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800/30 space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-900">
                <h2 className="font-display font-bold text-base text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  <MessageSquare className="text-zinc-400" size={18} />
                  Riwayat Percakapan AI & Koreksi
                </h2>
                {interviewHistory.length > 0 && (
                  <button
                    onClick={clearInterviewHistory}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>

              {interviewHistory.length > 0 ? (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {interviewHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/45 dark:border-zinc-800/20 text-xs space-y-2.5 font-medium text-zinc-600 dark:text-zinc-400"
                    >
                      <div className="flex justify-between items-center text-[10px] text-zinc-600 dark:text-zinc-400 font-bold">
                        <span className="font-black uppercase tracking-wider text-violet-500">{item.topic}</span>
                        <span>{item.date}</span>
                      </div>
                      <div>
                        <span className="font-bold block text-zinc-800 dark:text-zinc-200 mb-0.5">Jawaban Anda:</span>
                        <p className="italic">"{item.transcript}"</p>
                      </div>
                      <div>
                        <span className="font-bold block text-emerald-700 dark:text-emerald-450 mb-0.5">Analisis & Koreksi AI:</span>
                        <p className="font-bold text-zinc-800 dark:text-zinc-350">"{item.correction}"</p>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-1 font-medium">{item.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  Belum ada riwayat percakapan. Hasil feedback AI Anda akan tersimpan di sini.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
