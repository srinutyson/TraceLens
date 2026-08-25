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
  apiKey: 'tl_your_project_api_key'
});

await tracer.trace('My-Workflow', async () => {

  const result = await tracer.startSpan('Fetch-Data', 'retrieval', async (childData) => {
    const data = { some: 'result' };
    childData({ output: data });
    return data;
  });

  await tracer.startSpan('Call-LLM', 'llm_call', async (childData) => {
    const answer = 'the answer';
    childData({ input: result, output: answer, model: 'gemini-2.5-flash' });
    return answer;
  });

});
```

## Span types

- `retrieval`
- `tool_call`
- `llm_call`
- `custom`

Each call to `tracer.startSpan(name, type, fn)` automatically nests under whichever span is active in the current async context, so nested spans reflect real call structure without manually passing IDs around.

## License

MIT