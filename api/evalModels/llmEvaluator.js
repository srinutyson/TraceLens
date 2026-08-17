import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config';


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
const models = await ai.models.list();
 function getLLMData(spans){
      const llmSpans = spans.filter(span => 
        span.type === "llm_call"&&
        span.output !== null&&
        span.output !== undefined&&
       !( typeof span.output === "string" && span.output.trim() === "")
);
     if(llmSpans.length === 0) return null;
     return llmSpans.reduce((latest,span) =>{
          return new Date(span.startTime) > new Date(latest.startTime) ? span : latest;
     });
}


export async function llmEvaluator(spans){
   const LLMSpan = getLLMData(spans);
   if(!LLMSpan){
      throw new Error(
         "LLM judge failed : no llm_call span contained usable output"
      );
   }
 
   const originalPrompt = typeof LLMSpan.input === "string" ? LLMSpan.input : JSON.stringify(LLMSpan.input);
   const originalOutput = typeof LLMSpan.output === "string" ? LLMSpan.output : JSON.stringify(LLMSpan.output);


   const precedingSpans = spans.filter((span)=>
       span.spanId !== LLMSpan.spanId &&
       new Date(span.startTime) < new Date(LLMSpan.startTime)
   ).map((span)=>({
         type : span.type,
         name : span.name,
         summary : {
             input : span.input,
             output : span.output,
             status : span.status,
         }

   }));
   
   const prompt = `
                    You are a strict, calibrated evaluator for AI-generated responses in an LLM observability platform. Your job is to assess response quality objectively and consistently — you are not being asked to be encouraging or lenient.

                    Score the response on exactly five dimensions, each from 0 to 100:

                    1. CORRECTNESS — Is the response factually accurate and free of errors, hallucinations, or logical mistakes? A response with any material factual error should score below 50, regardless of how well-written it is.

                    2. RELEVANCE — Does the response directly address what was actually asked, without going off-topic or answering a different question than the one posed?

                    3. COMPLETENESS — Does the response cover everything the input reasonably required? A technically correct but incomplete answer should be scored down proportionally to what's missing.

                    4. CLARITY — Is the response well-organized, easy to read, and free of unnecessary confusion or ambiguity?

                    5. INSTRUCTION FOLLOWING — Did the response follow any explicit instructions in the input (format, length, tone, constraints)? If no explicit instructions were given, score this 100 by default.

                    Calibration rules — follow these strictly:
                    - Use the full 0-100 range. Do not default to scores clustered between 70-90 out of politeness. A genuinely poor response on a dimension should score below 40. A flawless response should score above 95.
                    - Every score must be justified by a specific comment citing concrete evidence from the actual response — no generic praise or criticism.
                    - If prior steps are provided as context, use them to judge whether a flaw in the final output originated there, but still score the final output on its own merits.
                    - Do not calculate an overall weighted score yourself. Only return the five dimension scores and comments plus the summary.
                    - Return only the structured JSON response defined by the schema.

                    ORIGINAL INPUT/PROMPT:
                    ${originalPrompt}

                    ${
                        precedingSpans.length > 0
                            ? `PRIOR EXECUTION STEPS (for context only — do not evaluate these directly):
                    ${precedingSpans
                        .map(
                            (s) =>
                                `- [${s.type}] ${s.name}: ${JSON.stringify(s.summary)}`
                        )
                        .join("\n")}
                    `
                            : ""
                    }

                    FINAL AI-GENERATED OUTPUT TO EVALUATE:
                    ${originalOutput}

                    Evaluate the FINAL OUTPUT above against the rubric.
                    `;


    const response = await ai.models.generateContent({
        model : "gemini-3.5-flash-lite",
        contents : prompt,
        config : {
                responseMimeType : "application/json",
                responseSchema : {
                    type : Type.OBJECT,
                    properties :{
                        correctness : {
                            type : Type.OBJECT,
                            properties : {
                                score : { type : Type.NUMBER},
                                comment : {type : Type.STRING}
                            },
                            required : ["score" , "comment"]

                        },
                        relevance : {
                             type : Type.OBJECT,
                            properties : {
                                score : { type : Type.NUMBER},
                                comment : {type : Type.STRING}
                            },
                            required : ["score" , "comment"]

                        },
                        completeness : {
                             type : Type.OBJECT,
                            properties : {
                                score : { type : Type.NUMBER},
                                comment : {type : Type.STRING}
                            },
                            required : ["score" , "comment"]

                        },
                        clarity : {
                             type : Type.OBJECT,
                            properties : {
                                score : { type : Type.NUMBER},
                                comment : {type : Type.STRING}
                            },
                            required : ["score" , "comment"]
                        },
                        instructionFollowing : {
                            type : Type.OBJECT,
                            properties : {
                                score : { type : Type.NUMBER},
                                comment : {type : Type.STRING}
                            },
                            required : ["score" , "comment"]

                        },

                        summary : {
                            type : Type.STRING
                        }

                    },
                    required : [
                                "correctness",
                                "relevance",
                                "completeness",
                                "clarity",
                                "instructionFollowing",
                                "summary"

                    ]
                }
        }
    });

    if(!response.text){
         throw new Error("LLM judge returned an empty response. ");
    }
    let judgement ;
    try{
        judgement = JSON.parse(response.text);
    }
    catch(error){
        throw new Error("LLM judge returned ans invalid JSON. ");
    }

    const dimensions = [
                        "correctness",
                        "relevance",
                        "completeness",
                        "clarity",
                        "instructionFollowing",
                               
                        ];
    for(const dimension of dimensions){
          const score = judgement?.[dimension]?.score;
          const comment = judgement?.[dimension]?.comment;
           if (
            typeof score !== "number" ||
            score < 0 ||
            score > 100 ||
            typeof comment !== "string" ||
            comment.trim() === ""
        ) {
            throw new Error(
                `LLM judge returned invalid ${dimension} evaluation.`
            );
        }
    }
    if(typeof judgement.summary !== "string" || judgement.summary.trim() === ""){
         throw new Error("LLM judge returned an invalid summary");
    }
    const evalScore = 
                       judgement.correctness.score * 0.40 +
                       judgement.relevance.score * 0.20+
                       judgement.completeness.score * 0.20+
                       judgement.clarity.score * 0.10+
                       judgement.instructionFollowing.score * 0.10;
    const reasoning = {
                      correctness : judgement.correctness,
                      relevance : judgement.relevance,
                      completeness : judgement.completeness,
                      clarity : judgement.clarity,
                      instructionFollowing : judgement.instructionFollowing,
                      summary : judgement.summary
    };
       return {evalScore , reasoning};

   
}

