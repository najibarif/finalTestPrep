const fs = require('fs');
let text = fs.readFileSync('src/data/grammarTopics.json', 'utf8');
try {
  // Try to parse it normally first
  JSON.parse(text);
  console.log("Already valid JSON");
} catch (e) {
  try {
    // If invalid JSON, it might be valid JS
    const m = { exports: {} };
    // evaluate it as a module
    const evalFunction = new Function('module', 'module.exports = ' + text);
    evalFunction(m);
    fs.writeFileSync('src/data/grammarTopics.json', JSON.stringify(m.exports, null, 2));
    console.log("Fixed successfully.");
  } catch (err) {
    console.error("Failed to fix JSON", err);
  }
}
