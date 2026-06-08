import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Parse VITE_GEMINI_API_KEY from .env
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

// 2. Read local databases
const topicsPath = path.join(__dirname, '../src/data/grammarTopics.json');
const quizzesPath = path.join(__dirname, '../src/data/grammarQuizzes.json');

const grammarTopics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
const grammarQuizzes = JSON.parse(fs.readFileSync(quizzesPath, 'utf8'));

async function generateQuestionsForTopic(topicId) {
  const topic = grammarTopics.find(t => t.id === topicId);
  if (!topic) {
    console.error(`Error: Topic ${topicId} not found in grammarTopics.json!`);
    return [];
  }

  console.log(`Pinging Gemini to generate 5 questions for ${topicId} (${topic.title})...`);

  const prompt = `
You are a Senior English Examiner. Create exactly 5 challenging multiple-choice English grammar questions focusing on this topic:
ID: ${topic.id}
Title: ${topic.title}
Key Structures: ${topic.keyStructures}
Special Difficulties: ${topic.specialDifficulties}

Provide the response in JSON format. Ensure all questions are grammatically correct, natural, and directly test the rules or special difficulties listed above.
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
    console.error(`Failed to generate for ${topicId}:`, error.message);
    return [];
  }
}

async function main() {
  // Get topics from command line arguments, e.g. "node scripts/generate-questions.js PP1 PP2"
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: node scripts/generate-questions.js <TopicId1> <TopicId2> ...");
    console.log("Example: node scripts/generate-questions.js PP1 PP2");
    console.log("Available Topic IDs:", grammarTopics.map(t => t.id).join(', '));
    process.exit(0);
  }

  console.log(`Starting question generation for topics: ${args.join(', ')}`);

  // Calculate starting ID number
  let maxIdNum = 0;
  grammarQuizzes.forEach(q => {
    const num = parseInt(q.id.replace('Q', ''));
    if (num > maxIdNum) maxIdNum = num;
  });

  let newQuestionsCount = 0;

  for (const topicId of args) {
    try {
      const questions = await generateQuestionsForTopic(topicId);
      if (questions.length === 0) continue;

      questions.forEach((q, index) => {
        maxIdNum++;
        const newQuizItem = {
          id: `Q${maxIdNum}`,
          topicId: topicId,
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation
        };
        grammarQuizzes.push(newQuizItem);
        newQuestionsCount++;
      });
      console.log(`Successfully generated and queued 5 questions for ${topicId}.`);
    } catch (e) {
      console.error(`Error processing topic ${topicId}:`, e.message);
    }
  }

  if (newQuestionsCount > 0) {
    fs.writeFileSync(quizzesPath, JSON.stringify(grammarQuizzes, null, 2), 'utf8');
    console.log(`\nSuccess! Appended ${newQuestionsCount} new questions to ${quizzesPath}.`);
    console.log(`Total questions in database: ${grammarQuizzes.length}`);
  } else {
    console.log("\nNo questions were appended.");
  }
}

main();
