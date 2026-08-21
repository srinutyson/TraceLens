import { useParams } from "react-router-dom";
import { useState,useEffect } from "react";

  function processSpanTree(spans){
    if(!spans || spans.length === 0) return[];
    const spanMap = new Map();
    const roots = [];
    const orphans = [];
    spans.forEach((span)=>{
        span.children = [];
         spanMap.set(span.spanId , span);
        
    });
    spans.forEach((span) =>{
        if(!span.parentSpanId){
             roots.push(span);
        }
        else {
            const parentId = span.parentSpanId;
            if(spanMap.has(parentId)){
                 spanMap.get(parentId).children.push(span);
            }
            else {
                span.isOrphan = true;
                orphans.push(span);
            }
        }
    });
    const flattenedList = [];
    function traverse(span,depth){
         span.Depth = depth;
          flattenedList.push(span);
         span.children.forEach((children)=>{
               traverse(children,depth+1);
         });

    }
    roots.forEach((root)=>{
        traverse(root,0);
    });
    orphans.forEach((orphan)=>{
         traverse(orphan,0);
    });

    return flattenedList;
  }

  function TraceWaterFall(){
    const {traceId,projectId} = useParams();
    const [loadingStatus , setLoadingStatus] = useState(true);
    const [Tracedata , setTraceData] = useState([]);
    useEffect(() =>{
         const fetchTrace = async () =>{
              try{
                const response = await fetch(`http://localhost:4000/api/projects/${projectId}/traces/${traceId}`,{
                    credentials : "include",
                     headers :{
                        "Content-Type" : "application/json"
                     }
                });

                const data = await response.json();
                setTraceData(data);

              }
              catch(error){
                   console.error("Failed to fetch Trace details" , error);
              }
              finally{
                 setLoadingStatus(false);
              }
         };

         fetchTrace();


    },[traceId,projectId]);
      if(loadingStatus){
           return (
              <div>
                <p>
                    Loading Trace details..........
                </p>
              </div>
           )
      }

    
      const evals  = Tracedata.evals || [];
      const ruleEvals = evals.filter((evaluation) => evaluation.evaluationType === "rule_based").sort((a,b)=>
                                 new Date(b.createdAt|| 0) - new Date(a.createdAt || 0));

      const llmEvals = evals.filter((evaluation) => evaluation.evaluationType === "llm_judge").sort((a,b)=>
                                 new Date(b.createdAt|| 0) - new Date(a.createdAt || 0));
      




      const trace = Tracedata.trace;
      const startTime = new Date(trace.startTime).getTime();
      const endTime = new Date(trace.endTime).getTime();
      const traceDuration = endTime - startTime;
      const processedSpans = processSpanTree(Tracedata.spans);

          return (
          <div>
                {processedSpans.map((span) =>{
                    const spanStart = new Date(span.startTime).getTime();
                    const spanEnd = new Date(span.endTime).getTime();
                    const rootStart = new Date(startTime).getTime();

                    
                    const offset = ((spanStart - rootStart) / traceDuration) * 100;
                    const width = ((spanEnd - spanStart) / traceDuration) * 100;

                    
                     return (

                        <div key = {span.spanId} style = {{display : 'flex' , marginBottom : '10px', alignItems : 'center' , height : '40px'  }}>
                         <div style = {{flexShrink : 0 , width : '200px' , overflow : 'hidden', paddingLeft: `${10 * span.Depth}px`,}}>
                                   {span.isOrphan && <span>⚠️</span>}
                                    <strong>{span.name}</strong>
                            </div>
                            <div style = {{flexGrow : 1 , position : 'relative' , height : '25px' , backgroundColor:  '#eceff2' , color: "#1E293B"}}>
                                  <div style = {{
                                     position : 'absolute',
                                     left : `${offset}%`,
                                     width : `${width}%`,
                                     height : '100%',
                                  backgroundColor: span.status === 'success' ? 'rgb(49, 103, 229)' : '#ef3535',
                                     borderRadius : '4px',
                                     minWidth : '20px'
                                  }}>

                                    </div>
                            </div>

                        </div>
                     );
                })}
                 <div style={{marginTop : "30px"}}>
                        <h2>Evaluations</h2>
                        <div style={{marginTop : "20px"}}>
                             <h2>Rule Based Evaluations</h2>
                              
                             {ruleEvals.length == 0 && (<p>No rule-based evaluations available</p>)}
                              {ruleEvals.map((ruleEval)=>(
                                   <div key = {ruleEval.evalId}
                                        style = {{marginTop : "20px" , marginLeft : "10px"}}>
                                             <h3>
                                                  Evaluation: {ruleEval.evalId}
                                             </h3>
                                             {ruleEval.createdAt && (
                                                  <p>
                                                       <strong>Created:</strong>{new Date(ruleEval.createdAt).toLocaleString()}
                                                  </p>
                                             )}
                                              {ruleEval && ruleEval.status === "pending" && (<p>
                                   Waiting to be evaluated.....
                              </p>)}
                              {ruleEval && ruleEval.status === "scoring" && (<p>
                                    Evaluation in progress
                              </p>)}
                              {ruleEval && ruleEval.status === "failed" && (
                                    <p>
                                        <strong>Evaluation Failed:</strong>{" "}
                                        {ruleEval.reasoning?.summary || "Unknown error"}
                                    </p>
                              )}
                              {ruleEval && ruleEval.status === "completed" &&(
                                   <div>
                                        <p>
                                             <strong>Overall Score:</strong>{" "}
                                             {ruleEval.score}/100
                                        </p>
                                        <p>
                                              <strong>Quality:</strong>{" "}
                                             {ruleEval.reasoning?.quality?.score}/100
                                        <div style = {{marginTop : "20px"}}>
                                        <strong>Quality Factors:</strong>

                                        {ruleEval.reasoning?.quality?.factors?.map((factor, index) => (
                                             <div key={index} style={{ marginLeft: "10px", marginTop: "8px" }}>
                                                  <p>
                                                       <strong>{factor.rule}:</strong>{" "}
                                                       {factor.detail}
                                                  </p>

                                                  <p>
                                                       Deduction: {factor.deduction}
                                                  </p>
                                             </div>
                                        ))}
                                        </div>
                                        </p>
                                        <p>
                                             <strong>Latency:</strong>{" "}
                                             {ruleEval.reasoning?.latency?.score}/100             
                                        </p>
                                        <p style = {{marginLeft : "10px"}}>
                                              {ruleEval.reasoning?.latency?.detail}
                                        </p>
                                        <p>
                                             <strong>Cost:</strong>{" "}
                                             {ruleEval.reasoning?.cost?.score}/100
                                        </p>
                                        <p style = {{marginLeft : "10px"}}>
                                              {ruleEval.reasoning?.cost?.detail}
                                           </p>
                                           <p>
                                             <strong>Summary:</strong>{" "}{ruleEval.reasoning?.summary}
                                           </p>
                                   </div>
                              )}
                                        </div>
                              ))}

                        </div>
                        <div style = {{marginTop : "20px"}}>
                         <h2>LLM Judge Evaluation</h2>
                         {llmEvals.length === 0 && (
                              <p>
                                   No LLM-judge evaluation available
                              </p>
                         )}
                         {llmEvals.map((llmEval)=>(
                              <div key = {llmEval.evalId}
                                   style = {{marginTop : "20px" , marginLeft : "10px"}}>
                                        <h3>
                                             Evaluation: {llmEval.evalId}
                                        </h3>
                                        {llmEval.createdAt && (
                                             <p>
                                                  <strong>Created:</strong>{" "}
                                                  {new Date(llmEval.createdAt).toLocaleString()}
                                             </p>
                                        )}
                                         {llmEval && llmEval.status === "pending" && (<p>
                                   Waiting to be evaluated.....
                              </p>)}
                         {llmEval && llmEval.status === "scoring" && (<p>
                                   Evaluation in progress
                         </p>)}
                         {llmEval && llmEval.status === "failed" && (
                                   <p>
                                   <strong>Evaluation Failed</strong>:{" "}
                                   {llmEval.reasoning?.summary || "Unknown error"}
                                   </p>
                         )}
                         {llmEval && llmEval.status === "completed" &&(
                              <div>

                                  <p>
                                        <strong>Overall Score:</strong>{" "}
                                        {llmEval.score}/100
                                  </p>
                                   <p>
                                        <strong>Correctness:</strong>{" "}
                                        {llmEval.reasoning?.correctness?.score}/100
                                  </p>
                                   <p>
                                        Comment:{" "}{llmEval.reasoning?.correctness?.comment}
                                   </p>
                                  <p>
                                        <strong>Relevance:</strong>{" "}
                                        {llmEval.reasoning?.relevance?.score}/100
                                  </p>
                                    <p>
                                        Comment:{" "}{llmEval.reasoning?.relevance?.comment}
                                    </p>
                                  <p>
                                        <strong>Completeness:</strong>{" "}
                                        {llmEval.reasoning?.completeness?.score}/100
                                  </p>
                                  <p>
                                       Comment:{" "}{llmEval.reasoning?.completeness?.comment}
                                  </p>
                                  <p>
                                        <strong>Clarity:</strong>{" "}
                                        {llmEval.reasoning?.clarity?.score}/100
                                  </p>
                                  <p>
                                        Comment:{" "}{llmEval.reasoning?.clarity?.comment}
                                  </p>
                                  <p>
                                        <strong>Instruction Following:</strong>{" "}
                                        {llmEval.reasoning?.instructionFollowing?.score}/100
                                  </p>
                                  <p>
                                       Comment:{" "}{llmEval.reasoning?.instructionFollowing?.comment}
                                  </p>
                                  <p>
                                       <strong>Summary:</strong>{" "}{llmEval.reasoning?.summary}
                                  </p>
                              </div>
                         )}

                                   </div>
                         ))}
                        </div>
                 </div>
          </div>);

      }

       export default TraceWaterFall;