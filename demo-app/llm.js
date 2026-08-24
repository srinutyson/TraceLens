import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function synthesizeAnswer(question, retrievedDoc, toolOutput) {
  const prompt = `You are a support assistant for PulseAPI, a webhook delivery and event-tracking API product.

A user asked: "${question}"

Here is a relevant excerpt from the documentation:
"${retrievedDoc.text}"

Here is additional live system data retrieved for this query:
${JSON.stringify(toolOutput, null, 2)}

Using only the information above, write a short, direct, helpful answer to the user's question. Do not mention that you were given "documentation" or "tool output" — just answer naturally as a support assistant would.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt
  });

  return response.text;
}