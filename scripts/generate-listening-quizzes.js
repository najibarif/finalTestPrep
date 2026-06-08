import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Get API Key from .env
let apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_GEMINI_API_KEY\s*=\s*([^\r\n]+)/);
    if (match) {
      apiKey = match[1].trim();
    }
  }
}

if (!apiKey) {
  console.error("Error: VITE_GEMINI_API_KEY not found in environment or .env file!");
  process.exit(1);
}

// 2. Read listening units
const unitsPath = path.join(__dirname, '../src/data/listeningUnits.json');
const listeningUnits = JSON.parse(fs.readFileSync(unitsPath, 'utf8'));

const outputPath = path.join(__dirname, '../src/data/listeningQuizzes.json');

// Helper to delay execution (prevents hitting rate limits)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateQuizForUnit(unit) {
  console.log(`Generating quiz for Unit ${unit.unit}: ${unit.title}...`);
  
  const prompt = `
You are an English teacher. Create exactly 3 multiple-choice comprehension questions in English based on this story summary:
Unit Title: "${unit.title}"
Summary: "${unit.summary}"

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

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini API");

    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    const parsed = JSON.parse(cleaned);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid format: 'questions' array not found in JSON response");
    }

    return parsed.questions;
  } catch (error) {
    console.error(`Failed to generate quiz for Unit ${unit.unit}:`, error.message);
    return null;
  }
}

async function main() {
  console.log(`Starting bulk pre-generation of listening quizzes for all ${listeningUnits.length} units...`);
  
  // Load existing quizzes if any to avoid regenerating them
  let allQuizzes = [];
  if (fs.existsSync(outputPath)) {
    try {
      allQuizzes = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      console.log(`Loaded ${allQuizzes.length} existing quizzes from ${outputPath}`);
    } catch (e) {
      console.log("Starting a fresh database.");
    }
  }

  const existingUnits = new Set(allQuizzes.map(q => q.unit));

  for (const unit of listeningUnits) {
    if (existingUnits.has(unit.unit)) {
      console.log(`Skipping Unit ${unit.unit} (already generated)`);
      continue;
    }

    let questions = null;
    let retries = 5;

    while (retries > 0 && !questions) {
      questions = await generateQuizForUnit(unit);
      if (!questions) {
        retries--;
        if (retries > 0) {
          console.log(`Rate limit or error hit. Retrying Unit ${unit.unit} in 65 seconds... (${retries} retries left)`);
          await delay(65000);
        }
      }
    }

    if (questions) {
      allQuizzes.push({
        unit: unit.unit,
        questions: questions
      });
      // Save progressively
      allQuizzes.sort((a, b) => a.unit - b.unit);
      fs.writeFileSync(outputPath, JSON.stringify(allQuizzes, null, 2), 'utf8');
      console.log(`Saved Unit ${unit.unit} successfully.`);
    } else {
      console.error(`Skipping Unit ${unit.unit} after failed retries.`);
    }

    // Delay 5 seconds between requests to prevent hitting rate limits
    console.log("Waiting 5 seconds before the next request...");
    await delay(5000);
  }

  console.log(`\nPre-generation complete! Total units generated and stored: ${allQuizzes.length}`);
}

main();
