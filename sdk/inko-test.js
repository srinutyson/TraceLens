// sdk/stress-test.js
import { randomUUID } from 'node:crypto';

const TARGET_URL = 'http://localhost:4000/api/ingest';
const NUM_REQUESTS = 50;

async function runStressTest() {
    console.log(`Firing ${NUM_REQUESTS} concurrent spans...`);
    
    // We use the exact same traceId for all 50 spans so they fight for the same document
    const sharedTraceId = randomUUID();
    const startTime = Date.now();

    const requests = Array.from({ length: NUM_REQUESTS }).map((_, i) => {
        const spanData = {
            traceId: sharedTraceId,
            spanId: randomUUID(),
            parentSpanId: i === 0 ? null : 'some-parent-id', // First one acts as root
            name: i === 0 ? 'Stress Test Root' : `Child Span ${i}`,
            type: 'custom',
            startTime: new Date(startTime + i), // Staggered by 1ms
            endTime: new Date(startTime + 100 + i),
            status: 'success',
            tokens: { total: 10, prompt: 5, completion: 5 }, // 10 tokens per span
            cost: 0.01 // $0.01 per span
        };

        return fetch(TARGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-project-id': 'test-project-123'
            },
            body: JSON.stringify(spanData)
        }).catch(err => console.error("Request failed:", err));
    });

    // Promise.all fires them concurrently
    await Promise.all(requests);
    console.log(`✅ All ${NUM_REQUESTS} requests fired.`);
    console.log(`🔍 Check MongoDB for Trace ID: ${sharedTraceId}`);
}

runStressTest();