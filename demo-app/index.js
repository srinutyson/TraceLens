import { TraceLens } from '../sdk/index.js';
import { retrieveRelevantDoc } from './retrieval.js';
import { checkSystemStatus, lookupPricingTier } from './data.js';
import { synthesizeAnswer } from './llm.js';
import 'dotenv/config';

const tracer = new TraceLens({
  apiKey: process.env.TRACELENS_PROJECT_API_KEY
});

const userQuestion = "What's included in the Pro plan and is the API up right now?";

async function runPulseApiSupportQuery() {
  console.log(`--- PulseAPI Support Query ---\nQuestion: "${userQuestion}"\n`);

  await tracer.trace('PulseAPI-Support-Query', async () => {

    const retrievedDoc = await tracer.startSpan('Doc-Retrieval', 'retrieval', async (childData) => {
      const doc = retrieveRelevantDoc(userQuestion);
      childData({
        input: { question: userQuestion },
        output: { matchedDoc: doc.title, text: doc.text }
      });
      return doc;
    });

    const toolOutput = await tracer.startSpan('Check-System-Status', 'tool_call', async (childData) => {
      const status = checkSystemStatus();
      childData({
        input: {},
        output: status
      });
      return status;
    });

    const answer = await tracer.startSpan('Gemini-Synthesis', 'llm_call', async (childData) => {
      const result = await synthesizeAnswer(userQuestion, retrievedDoc, toolOutput);
      childData({
        input: { question: userQuestion, context: retrievedDoc.text },
        output: { text: result },
        model: 'gemini-2.5-flash'
      });
      return result;
    });

    console.log(`\nAnswer: ${answer}\n`);
  });

  console.log('--- Query Complete ---');
}

runPulseApiSupportQuery();