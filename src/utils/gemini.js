const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent';

/**
 * Sends a prompt to the Gemini API and returns the parsed JSON response.
 * @param {string} apiKey - Google Gemini API Key
 * @param {string} prompt - Text prompt
 * @param {boolean} forceJson - Whether to enforce JSON response config
 */
function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  return cleaned;
}

async function callGemini(apiKey, prompt, forceJson = true) {
  if (!apiKey) {
    throw new Error('API Key Gemini tidak ditemukan. Harap masukkan API Key Anda di panel Settings.');
  }

  const url = `${GEMINI_API_URL}?key=${apiKey}`;
  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP status ${response.status}`;
      
      // Check for rate limit / quota error
      if (response.status === 429 || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('rate limit')) {
        throw new Error('Batas gratis kuota Gemini (Rate Limit 20 request/menit) terlampaui. Silakan tunggu sekitar 1 menit sebelum mencoba lagi.');
      }
      
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error('Respons kosong diterima dari Gemini API.');
    }

    if (forceJson) {
      const cleaned = cleanJsonResponse(textResponse);
      return JSON.parse(cleaned);
    }
    return textResponse;
  } catch (error) {
    console.error('Call Gemini Failed:', error);
    throw error;
  }
}

/**
 * Generates 5 multiple-choice grammar questions based on selected materials.
 */
export async function generateGrammarQuiz(apiKey, topics) {
  const topicsDescription = topics
    .map(t => `- **${t.id} - ${t.title}**:\n  Structures: ${t.keyStructures}\n  Difficulties: ${t.specialDifficulties}`)
    .join('\n');

  const prompt = `
You are a Senior English Examiner. Create exactly 5 challenging multiple-choice English grammar questions focusing on the following materials:
${topicsDescription}

Provide the response in JSON format. Ensure all questions are grammatically correct, natural, and directly test the tenses, structure rules, or special difficulties listed above.
Each question must have exactly 4 choices (labeled as options), a clear correct answer (matching exactly one of the options), and an explanation.

JSON Schema format:
{
  "questions": [
    {
      "question": "Question text here...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B",
      "explanation": "Explain why this option is correct based on the grammar rule."
    }
  ]
}
`;

  return callGemini(apiKey, prompt, true);
}

/**
 * Analyzes an essay and provides detailed grading.
 */
export async function analyzeEssay(apiKey, title, content) {
  const prompt = `
You are a Senior IELTS/TOEFL Writing Assessor. Grade the following student essay.
Essay Title: "${title}"
Essay Content:
"${content}"

Analyze the essay based on:
1. Grammar & Sentence Structure (Identify errors and correct them)
2. Vocabulary & Word Choice (Recommend better vocabulary)
3. Coherence & Cohesion (Check paragraph organization and flow)
4. Vocabulary matching themes like "society" and "family" if applicable.

Return the assessment in JSON format. Use the following schema:
{
  "score": 85, // Score out of 100
  "grade": "A-", // Letter grade (A, B, C, D, F)
  "wordCount": 285, // Word count
  "grammarFeedback": "Detailed feedback on grammar",
  "corrections": [
    {
      "original": "original incorrect sentence or phrase",
      "corrected": "corrected sentence or phrase",
      "reason": "explanation of the mistake"
    }
  ],
  "vocabularyFeedback": "Feedback on word choices",
  "cohesionFeedback": "Feedback on structure and flow",
  "suggestions": ["suggestion 1", "suggestion 2"]
}
`;

  return callGemini(apiKey, prompt, true);
}

/**
 * Analyzes speaking transcript for mock interview and gives quick audio-friendly feedback.
 */
export async function analyzeSpeakingResponse(apiKey, topic, question, answer) {
  const prompt = `
You are an English Interview Coach. The student was asked this question under the topic "${topic}":
Question: "${question}"
Student's Spoken Answer: "${answer}"

Analyze the student's spoken response for grammar errors and logical coherence.
Provide a quick, voice-friendly feedback (max 2 sentences, keep it simple and encouraging so it can be spoken out loud clearly) and a corrected version of their answer.

Return the response in JSON format. Use the following schema:
{
  "feedback": "Short feedback to be spoken out loud by the AI (max 2 sentences). Start with some encouraging words, e.g. 'Good try, but make sure...'",
  "correctedText": "The entire response rewritten in natural, grammatically correct English.",
  "grammarIssues": ["Issue 1 with explanation", "Issue 2 with explanation"]
}
`;

  return callGemini(apiKey, prompt, true);
}

/**
 * Transcribes spoken English in an audio file using Gemini multimodal capabilities.
 * @param {string} apiKey - Google Gemini API Key
 * @param {string} audioBase64 - Base64 encoded audio data
 * @param {string} mimeType - The mimeType of the audio, e.g. audio/webm or audio/mp4
 */
export async function transcribeAudio(apiKey, audioBase64, mimeType) {
  const url = `${GEMINI_API_URL}?key=${apiKey}`;
  const requestBody = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          {
            text: "Transcribe the spoken English in this audio file precisely and return only the transcription. Do not add any corrections, notes, introductory text, or concluding remarks. Just return the transcription."
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP status ${response.status}`;
      
      // Check for rate limit / quota error
      if (response.status === 429 || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('rate limit')) {
        throw new Error('Batas gratis kuota Gemini untuk transkripsi suara terlampaui. Silakan tunggu sekitar 1 menit.');
      }
      
      throw new Error(`Gemini Audio Transcription Error: ${errorMessage}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error('Gagal mentranskripsi suara. Respons kosong dari Gemini.');
    }

    return textResponse.trim();
  } catch (error) {
    console.error('Gemini Transcription Failed:', error);
    throw error;
  }
}

/**
 * Generates 3 multiple-choice comprehension questions based on a listening unit summary.
 */
export async function generateListeningQuiz(apiKey, unitTitle, unitSummary) {
  const prompt = `
You are an English teacher. Create exactly 3 multiple-choice comprehension questions in English based on this story summary:
Unit Title: "${unitTitle}"
Summary: "${unitSummary}"

Each question must test the student's understanding of the details in the story.
Provide the response in JSON format. Ensure all questions are grammatically correct, natural, and directly related to the story.
Each question must have exactly 4 choices (labeled as options), a correct answer matching exactly one of the options, and an explanation.

JSON Schema format:
{
  "questions": [
    {
      "question": "Question text here...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B",
      "explanation": "Explain why this option is correct based on the story."
    }
  ]
}
`;

  return callGemini(apiKey, prompt, true);
}

