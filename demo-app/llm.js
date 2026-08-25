import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const MODEL_NAME = 'gemini-3.6-flash';


const INPUT_PRICE_PER_MILLION = 0.75;
const OUTPUT_PRICE_PER_MILLION = 3.75;

function calculateCost(promptTokens, completionTokens) {
  const inputCost = (promptTokens / 1_000_000) * INPUT_PRICE_PER_MILLION;
  const outputCost = (completionTokens / 1_000_000) * OUTPUT_PRICE_PER_MILLION;
  return inputCost + outputCost;
}

export async function synthesizeAnswer(question, retrievedDoc, toolOutput, pricingInfo) {
  const prompt = `You are a support assistant for PulseAPI, a webhook delivery and event-tracking API product.

A user asked: "${question}"

Here is a relevant excerpt from the documentation:
"${retrievedDoc.text}"

Here is additional live system data retrieved for this query:
${JSON.stringify(toolOutput, null, 2)}

Here is pricing tier data retrieved for this query:
${JSON.stringify(pricingInfo, null, 2)}

Using only the information above, write a short, direct, helpful answer to the user's question. Do not mention that you were given "documentation", "tool output", or "pricing data" — just answer naturally as a support assistant would.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt
  });

  const promptTokens = response.usageMetadata?.promptTokenCount || 0;
  const completionTokens = response.usageMetadata?.candidatesTokenCount || 0;
  const totalTokens = response.usageMetadata?.totalTokenCount || (promptTokens + completionTokens);

  const cost = calculateCost(promptTokens, completionTokens);

  return {
    text: response.text,
    tokens: {
      prompt: promptTokens,
      completion: completionTokens,
      total: totalTokens
    },
    cost
  };
}