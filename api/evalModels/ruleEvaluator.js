function getOutputSpan(spans){
     const llmSpans = spans.filter(span => span.type === "llm_call");
     if(llmSpans.length === 0) return null;
     return llmSpans.reduce((latest,span) =>{
          return new Date(span.startTime) > new Date(latest.startTime) ? span : latest;
     });
}

function getDeduction(span){
       if(!span || span.output === null || span.output === undefined) return 30;
       if(typeof span.output === "string" && span.output.trim() === "") return 20;
       return 0;
}

export function ruleEvaluator(trace , spans){
        const reasoningParts = []; 
        let latencyScore = 100;
        let qualityScore = 100;
        let costScore = 100;
        if(trace.status === 'error') qualityScore  = qualityScore - 40;

   
        let traceTime = trace.endTime.getTime() - trace.startTime.getTime();
        let latencyRange = "";
        if(traceTime <= 1000){
            latencyRange = "≤1s";
        }
        if(traceTime > 1000 && traceTime <= 3000){ 
            latencyScore -= 10;
             latencyRange = ">1–3s";
        }
        if(traceTime > 3000 && traceTime <= 5000) {
            latencyScore -= 25;
            latencyRange = ">3–5s";
            }
        if(traceTime > 5000 && traceTime <= 10000){ 
            latencyScore -= 50;
             latencyRange = ">5–10s";
        }
        if(traceTime > 10000) {
            latencyScore -= 75;
            latencyRange = ">10s";
        }
        traceTime = traceTime/1000;
        

        
        const cost = trace.totalCost;
        let costRange = "";
        if(cost <= 0.005){
             costRange = "≤$0.005";
        }
        if(cost > 0.005 && cost <= 0.01) {
            costScore -= 10;
            costRange = ">$0.005–$0.01";
        }
        if(cost > 0.01 && cost <= 0.03) {
            costScore -= 25;
            costRange = ">$0.01–$0.03";
        }
        if(cost > 0.03 && cost <= 0.1){
            costScore -= 50;
            costRange = ">$0.03–$0.10";
        }
        if(cost > 0.1) {
            costScore -= 75;
             costRange = ">$0.10";
        }
      



        let errorSpans = 0;
        spans.forEach((span) =>{
             if(span.status === 'error') errorSpans++;
        })
        if(errorSpans > 1) qualityScore -= 30;
        if(errorSpans === 1)qualityScore -= 20;


        const outputSpan = getOutputSpan(spans);
        const deduction = getDeduction(outputSpan);
        qualityScore -= deduction;


        const evalScore = (qualityScore * 0.5) + (latencyScore * 0.25) + (costScore * 0.25);


        const qualityFactors = [];

        if (trace.status === "error") {
            qualityFactors.push({
                rule: "trace_status",
                detail: "error",
                deduction: -40
            });
        } else {
            qualityFactors.push({
                rule: "trace_status",
                detail: "success",
                deduction: 0
            });
        }

        if (errorSpans === 0) {
            qualityFactors.push({
                rule: "span_errors",
                detail: "0 error spans",
                deduction: 0
            });
        } else if (errorSpans === 1) {
            qualityFactors.push({
                rule: "span_errors",
                detail: "1 error span",
                deduction: -20
            });
        } else {
            qualityFactors.push({
                rule: "span_errors",
                detail: `${errorSpans} error spans`,
                deduction: -30
            });
        }

        if (!outputSpan || outputSpan.output === null || outputSpan.output === undefined) {
            qualityFactors.push({
                rule: "output_empty",
                detail: "output missing",
                deduction: -30
            });
        } else if (
            typeof outputSpan.output === "string" &&
            outputSpan.output.trim() === ""
        ) {
            qualityFactors.push({
                rule: "output_empty",
                detail: "whitespace-only output",
                deduction: -20
            });
        } else {
            qualityFactors.push({
                rule: "output_empty",
                detail: "output contains content",
                deduction: 0
            });
        }

        const reasoning = {
            quality: {
                score: qualityScore,
                factors: qualityFactors
            },

            latency: {
                score: latencyScore,
                detail: `Duration ${traceTime}s (in range ${latencyRange})`
            },

            cost: {
                score: costScore,
                detail: `Total cost $${cost} (in range ${costRange})`
            },

            summary:
                `Overall ${evalScore}/100 — ` +
                `quality×0.50 + latency×0.25 + cost×0.25`
        };
        return {evalScore,reasoning};
}


// const testTrace = {
//     traceId: "trace-003",
//     projectId: "test-project",
//     status: "error",
//     startTime: new Date("2026-08-14T11:00:00.000Z"),
//     endTime: new Date("2026-08-14T11:00:04.200Z"),
//     totalCost: 0.008,
//     totalTokens: 25,
//     spanCount: 3
// };
// const testSpans = [
//     {
//         traceId: "trace-003",
//         spanId: "span-003-1",
//         parentSpanId: null,
//         name: "Database lookup",
//         type: "tool_call",
//         startTime: new Date("2026-08-14T11:00:00.000Z"),
//         endTime: new Date("2026-08-14T11:00:01.000Z"),
//         status: "error",
//         input: "lookup",
//         output: null,
//         model: null,
//         tokens: {
//             prompt: 0,
//             completion: 0,
//             total: 0
//         },
//         cost: 0,
//         projectId: "test-project"
//     },
//     {
//         traceId: "trace-003",
//         spanId: "span-003-2",
//         parentSpanId: null,
//         name: "Retrieval",
//         type: "retrieval",
//         startTime: new Date("2026-08-14T11:00:01.000Z"),
//         endTime: new Date("2026-08-14T11:00:02.000Z"),
//         status: "error",
//         input: "retrieve context",
//         output: null,
//         model: null,
//         tokens: {
//             prompt: 0,
//             completion: 0,
//             total: 0
//         },
//         cost: 0,
//         projectId: "test-project"
//     },
//     {
//         traceId: "trace-003",
//         spanId: "span-003-3",
//         parentSpanId: null,
//         name: "OpenAI call",
//         type: "llm_call",
//         startTime: new Date("2026-08-14T11:00:02.000Z"),
//         endTime: new Date("2026-08-14T11:00:04.200Z"),
//         status: "error",
//         input: "Explain recursion.",
//         output: null,
//         model: "gpt-4o-mini",
//         tokens: {
//             prompt: 20,
//             completion: 5,
//             total: 25
//         },
//         cost: 0.008,
//         projectId: "test-project"
//     }
// ];
// const result  = ruleEvaluator(testTrace,testSpans);
// console.log(result);