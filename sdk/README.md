# tracelens-sdk

Lightweight tracing SDK for [TraceLens](https://github.com/srinutyson/TraceLens) — capture nested spans and traces for LLM and agent applications, using `AsyncLocalStorage` for automatic context propagation.

## Install

```bash
npm install tracelens-sdk
```

## Usage

```js
import { TraceLens } from 'tracelens-sdk';

const tracer = new TraceLens({
  apiKey: 'tl_your_project_api_key',
  ingestUrl: 'https://your-tracelens-backend.example.com/api/ingest'
});

await tracer.trace('My-Workflow', async () => {

  const result = await tracer.startSpan('Fetch-Data', 'retrieval', async (childData) => {
    const data = { some: 'result' };
    childData({ output: data });
    return data;
  });

  await tracer.startSpan('Call-LLM', 'llm_call', async (childData) => {
    const answer = 'the answer';
    childData({ input: result, output: answer, model: 'gemini-3.6-flash' });
    return answer;
  });

});
```

## Self-hosted: the `ingestUrl` option

TraceLens is self-hosted — there is no single shared API endpoint, since every user runs their own backend instance. You must tell the SDK where your own deployed TraceLens backend lives using the `ingestUrl` option, as shown above.

If `ingestUrl` is omitted, the SDK defaults to `http://localhost:4000/api/ingest` — convenient for local development, but **spans will fail silently in production** if you forget to set this explicitly when deploying your instrumented application.

The correct value for your deployment is shown automatically, pre-filled, in the code snippet on your TraceLens dashboard's Projects page whenever you create or view a project.

## Span types

- `retrieval`
- `tool_call`
- `llm_call`
- `custom`

Each call to `tracer.startSpan(name, type, fn)` automatically nests under whichever span is active in the current async context, so nested spans reflect real call structure without manually passing IDs around.

## License

MIT