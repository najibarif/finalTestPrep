// Web Speech API Wrapper

// Check if SpeechRecognition is supported
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const isSpeechRecognitionSupported = () => {
  return typeof SpeechRecognition !== 'undefined';
};

/**
 * Creates a SpeechRecognition instance with event listeners.
 * @param {object} config - Configuration object
 * @param {function} config.onResult - Callback when speech is recognized
 * @param {function} config.onEnd - Callback when recognition stops
 * @param {function} config.onStart - Callback when recognition starts
 * @param {function} config.onError - Callback when error occurs
 * @returns {SpeechRecognition|null}
 */
export const createRecognizer = ({ onResult, onEnd, onStart, onError }) => {
  if (!isSpeechRecognitionSupported()) {
    console.error('Speech Recognition is not supported in this browser.');
    return null;
  }

  const recognizer = new SpeechRecognition();
  recognizer.lang = 'en-US';
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;
  recognizer.continuous = false; // Stop when the user stops speaking

  recognizer.onstart = () => {
    if (onStart) onStart();
  };

  recognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognizer.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  recognizer.onend = () => {
    if (onEnd) onEnd();
  };

  return recognizer;
};

/**
 * Speaks text using the SpeechSynthesis API.
 * @param {string} text - Text to speak
 * @param {object} options - Options
 * @param {number} options.rate - Speech rate (0.5 to 2, default 1)
 * @param {number} options.pitch - Speech pitch (0.5 to 2, default 1)
 * @param {string} options.voiceName - Optional voice name preference
 * @param {function} options.onEnd - Callback when speech ends
 * @param {function} options.onStart - Callback when speech starts
 * @param {function} options.onError - Callback when error occurs
 */
export const speakText = (text, { rate = 0.9, pitch = 1, voiceName = '', onEnd, onStart, onError } = {}) => {
  if (!window.speechSynthesis) {
    console.error('Speech Synthesis is not supported in this browser.');
    if (onError) onError('not_supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;

  // Find a suitable English voice
  const voices = window.speechSynthesis.getVoices();
  let selectedVoice = null;

  if (voiceName) {
    selectedVoice = voices.find(v => v.name === voiceName);
  }

  if (!selectedVoice) {
    // Look for Google US English or standard en-US
    selectedVoice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google')) ||
                    voices.find(v => v.lang.startsWith('en-US')) ||
                    voices.find(v => v.lang.startsWith('en'));
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event.error);
    if (onError) onError(event.error);
  };

  window.speechSynthesis.speak(utterance);

  return {
    cancel: () => window.speechSynthesis.cancel()
  };
};

/**
 * Stop any speaking voice immediately.
 */
export const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
