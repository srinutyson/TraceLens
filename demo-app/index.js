import { TraceLens } from 'tracelens-sdk';
import { retrieveRelevantDoc } from './retrieval.js';
import { checkSystemStatus, lookupPricingTier, validateSession, checkRateLimit, fetchAccountUsage } from './data.js';
import { synthesizeAnswer, MODEL_NAME } from './llm.js';
import 'dotenv/config';

const tracer = new TraceLens({
  apiKey: process.env.TRACELENS_PROJECT_API_KEY,
  ingestUrl :  'https://tracelens-3uqc.onrender.com/api/ingest'
});

const userQuestion = "What's included in the Pro plan and is the API up right now?";

async function runPulseApiSupportQuery() {
  console.log(`--- PulseAPI Support Query ---\nQuestion: "${userQuestion}"\n`);

  await tracer.trace('PulseAPI-Support-Query', async () => {

    await tracer.startSpan('Validate-Session', 'custom', async (childData) => {
      const session = validateSession();
      childData({ output: session });
      return session;
    });

    await tracer.startSpan('Check-Rate-Limit', 'custom', async (childData) => {
      const rateLimit = checkRateLimit();
      childData({ output: rateLimit });
      return rateLimit;
    });

    const { retrievedDoc, toolOutput, pricingInfo } = await tracer.startSpan('Prepare-Context', 'custom', async (childData) => {

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

      const pricingInfo = await tracer.startSpan('Lookup-Pricing-Tier', 'tool_call', async (childData) => {
        const pricing = lookupPricingTier('pro');
        childData({
          input: { planName: 'pro' },
          output: pricing
        });
        return pricing;
      });

      childData({ output: { docFound: Boolean(retrievedDoc.id), statusChecked: true, pricingChecked: true } });
      return { retrievedDoc, toolOutput, pricingInfo };
    });

    const accountUsage = await tracer.startSpan('Fetch-Account-Usage', 'tool_call', async (childData) => {
      const usage = fetchAccountUsage();
      childData({
        input: {},
        output: usage
      });
      return usage;
    });

    const answer = await tracer.startSpan('Gemini-Synthesis', 'llm_call', async (childData) => {
      const { text, tokens, cost } = await synthesizeAnswer(userQuestion, retrievedDoc, toolOutput, pricingInfo);
      childData({
        input: { question: userQuestion, context: retrievedDoc.text, toolOutput, pricingInfo },
        output: { text },
        model: MODEL_NAME,
        tokens,
        cost
      });
      return text;
    });

    await tracer.startSpan('Post-Process', 'custom', async (childData) => {
      const summary = { answerLength: answer.length, accountUsage };
      childData({ output: summary });
      return summary;
    });

    console.log(`\nAnswer: ${answer}\n`);
  });

  console.log('--- Query Complete ---');
}

runPulseApiSupportQuery();