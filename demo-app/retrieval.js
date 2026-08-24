import { documents } from './data.js';

export function retrieveRelevantDoc(question) {
  const questionWords = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  let bestMatch = null;
  let bestScore = 0;

  for (const doc of documents) {
    const docText = doc.text.toLowerCase();
    let score = 0;

    for (const word of questionWords) {
      if (docText.includes(word)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = doc;
    }
  }

  if (bestScore === 0) {
    return {
      id: null,
      title: null,
      text: "No relevant documentation found for this question."
    };
  }

  return bestMatch;
}