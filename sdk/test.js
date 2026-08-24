import { TraceLens } from './index.js';

// 1. Initialize our SDK tracker
const tracer = new TraceLens({ projectId: '00326b2c-55fb-4cd1-b22d-f9c84533db07', apiKey: 'tl_e78d168771d6_4144845db9a8f548e7552a6666aee4151b4f73c44b0a188fc8f85d342f0411fb' });

// Helper function to simulate network lag (turns setTimeout into an awaitable Promise)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDemoWorkflow() {
  console.log('--- Starting Async Context Test ---\n');

  // 2. The Root Execution Block
  await tracer.trace('RAG-Chat-Workflow', async () => {
    
    // Simulate some initial setup time
    await delay(50); 
    
    // Step 1: Simulated Database Retrieval (Child Span 1)
    await tracer.startSpan('Vector-DB-Fetch', 'retrieval', async (childData) => {
      await delay(150); // Faking database latency
      childData({ output: { rowsFound: 5 } });
      return 'Retrieved context...';
    });

    // Step 2: Simulated LLM Generation (Child Span 2)
    await tracer.startSpan('Anthropic-Claude', 'llm_call', async (childData) => {
      await delay(300); // Faking LLM latency
      childData({ 
        model: 'claude-3-haiku',
        tokens: { prompt: 400, completion: 50, total: 450 },
        output: { text: 'Final AI answer' }
      });
      return 'Final AI answer';
    });

  });

  console.log('\n--- Workflow Completed ---');
}

runDemoWorkflow();

// At the bottom of test.js
setTimeout(() => console.log("Test finished"), 1000);