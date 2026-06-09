import React, { useState, useEffect } from 'react';
import { usePractice } from '../context/PracticeContext';
import { X, Key, ShieldCheck, Eye, EyeOff, ExternalLink } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { geminiKey, updateGeminiKey } = usePractice();
  const [keyInput, setKeyInput] = useState(geminiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKeyInput(geminiKey);
  }, [geminiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateGeminiKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/45 dark:bg-black/65 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl animate-fade-in-up overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <Key className="text-violet-600 dark:text-violet-400" size={20} />
            <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50">
              Konfigurasi API
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label htmlFor="gemini-api-key" className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                id="gemini-api-key"
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3 pr-10 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                aria-label={showKey ? "Sembunyikan API key" : "Tampilkan API key"}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex gap-2.5 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/40 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={16} />
            <div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-300">Penyimpanan Aman:</span> API Key disimpan langsung di browser Anda (Local Storage) dan tidak pernah dikirim ke server pihak ketiga mana pun. Kunci ini hanya digunakan untuk menghubungi API Google Gemini langsung dari browser Anda.
            </div>
          </div>

          {/* Guide Link */}
          <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
            <span>Belum punya API Key?</span>
            <a 
              href="https://aistudio.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 font-medium"
            >
              Dapatkan di Google AI Studio <ExternalLink size={12} />
            </a>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saved}
              className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md shadow-violet-500/10 transition-all cursor-pointer ${
                saved 
                  ? 'bg-emerald-600 shadow-emerald-500/10' 
                  : 'bg-violet-600 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {saved ? 'Tersimpan!' : 'Simpan Kunci'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
