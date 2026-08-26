import { useParams } from "react-router-dom";
import { useState,useEffect } from "react";
import { API_BASE } from "../api";
  function getSpanColor(span){
     if(span.status === 'error') return 'var(--span-error)';
     if(span.type === 'llm_call') return 'var(--span-llm)';
     if(span.type === 'retrieval') return 'var(--span-retrieval)';
     if(span.type === 'tool-call') return 'var(--span-tool)';
     if(span.type === 'custom') return 'var(--span-custom)';
     return 'var(--span-tool)';
  }
  const cardStyle = {
      background : "var(--bg-surface-2)",
      border : "0.5px solid var(--border)",
      borderRadius: 'var(--radius)',
      padding: '16px'
  }
  const buttonStyle = {
     background: 'transparent',
     border: '0.5px solid var(--border)',
     color: 'var(--accent)',
     fontSize: '13px',
     padding: '6px 12px',
     borderRadius: 'var(--radius)',
     cursor: 'pointer'
  }
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
    const [triggeringRule , setTrigerringRule] = useState(false);
    const  [triggeringLLM , setTriggeringLLM] = useState(false);
    const [triggerError , setTriggerError] = useState("");
    const [selectedSpan , setSelectedSpan] = useState(null);

   const fetchTrace = async () =>{
              try{
                const response = await fetch(`${API_BASE}/projects/${projectId}/traces/${traceId}`,{
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

    useEffect(() =>{
         
      // eslint-disable-next-line react-hooks/set-state-in-effect
         fetchTrace();


    },[traceId,projectId]);


     const handleTriggerEval = async(evaluationType)=>{
             setTriggerError("");
             if(evaluationType === 'rule_based'){
               setTrigerringRule(true);
             }
             else setTriggeringLLM(true);

             try{
               const response = await fetch(`${API_BASE}/projects/${projectId}/traces/${traceId}/eval`,{
                    method : "POST",
                    headers : {"Content-Type" : "application/json"},
                    credentials : "include",
                    body : JSON.stringify({evaluationType}),
               });
               const data = await response.json();
               if(!response.ok){
                    if(response.status === 409)setTriggerError("An evaluation is already in progress fo this trace");
                    else setTriggerError(data.message||data.error||"Could not start evaluation")
                    return;
               }
              const maxAttempts = 5;
               const delayMs = 3000;

               for(let attempt = 0; attempt < maxAttempts; attempt++){
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                    await fetchTrace();
               };
             }catch{
                 setTriggerError("Something went wrong, please try again");
             }
             finally{
                 if(evaluationType === 'rule_based') setTrigerringRule(false);
                 else setTriggeringLLM(false);
             }
     }
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
      const spanTypesPresent = [...new Set(processedSpans.map((span)=> span.type || 'custom'))];
          return (
          <div>
               <div style = {{marginBottom : '20px', paddingBottom : '16px', borderBottom : '0.5px solid var(--border)'}}>
                    <div style={{display : 'flex', alignItems : 'center', justifyContent : 'space-between'}}>
                         <h2 style = {{color : 'var(--text-primary)', fontSize : '16px', fontWeight : 500, margin : 0}}>
                              {trace.name}
                         </h2>
                         <span style={{
                               color : trace.status === 'error' ? 'var(--span-error)' : 'var(--text-secondary)',
                               fontSize : '12px'
                          }}>
                              {trace.status}
                         </span>
                    </div>
                    <p style = {{color : 'var(--text-muted)', fontSize : '12px', margin : '6px 0 0'}}>
                         {traceId} · {traceDuration}ms · {processedSpans.length} spans · {new Date(trace.startTime).toLocaleString()}
                    </p>
                     <p style = {{color : 'var(--text-muted)', fontSize : '12px', margin : '4px 0 0'}}>
                         {trace.totalTokens} tokens · ${trace.totalCost.toFixed(4)}
                         
                    </p>
               </div>
                {processedSpans.map((span) =>{
                    const spanStart = new Date(span.startTime).getTime();
                    const spanEnd = new Date(span.endTime).getTime();
                    const rootStart = new Date(startTime).getTime();

                    
                    const offset = ((spanStart - rootStart) / traceDuration) * 100;
                    const width = ((spanEnd - spanStart) / traceDuration) * 100;

                    
                     return (

                        <div key = {span.spanId} onClick = {()=>setSelectedSpan(span)}style = {{display : 'flex' , marginBottom : '6px', alignItems : 'center' , height : '32px'  }}>
                         <div style = {{
                              flexShrink : 0 ,
                              width : '200px' ,
                              overflow : 'hidden',
                              paddingLeft: span.Depth?`${16 * span.Depth}px`:'0px',
                              marginLeft: span.Depth > 0 ? '6px' : '0px',
                              borderLeft: span.Depth > 0 ? '1px solid var(--border)' : 'none',
                              color : 'var(--text-primary)',
                              fontSize : '12px',
                              whiteSpace : 'nowrap',
                              textOverflow : 'ellipsis'
                                 }}>
                                   {span.isOrphan && <span>⚠️</span>}
                                      {span.name}
                            </div>
                            <div style = {{flexGrow : 1 , position : 'relative' , height : '25px' , backgroundColor:  '#eceff2' , color: "#1E293B"}}>
                                  <div style = {{
                                     position : 'absolute',
                                     left : `${offset}%`,
                                     width : `${width}%`,
                                     height : '100%',
                                     backgroundColor: getSpanColor(span),
                                     borderRadius : '3px',
                                     minWidth : '20px'
                                  }}>

                                    </div>
                            </div>

                        </div>
                     );
                })}
               {selectedSpan && (
                    <div style = {{
                         position : 'fixed',
                         top : 0,
                         right : 0,
                         height : '100vh',
                         width : '380px',
                         background : 'var(--bg-surface-2)',
                         borderLeft : '0.5px solid var(--border)',
                         padding : '20px',
                         overflowY : 'auto',
                         zIndex : 100
                    }}>
                         <div style = {{display : 'flex', justifyContent : 'space-between', alignItems : 'center', marginBottom : '16px'}}>
                              <h3 style = {{color : 'var(--text-primary)', fontSize : '14px', margin : 0}}>
                                   {selectedSpan.name}
                              </h3>
                              <button type = "button" onClick = {() => setSelectedSpan(null)} style = {buttonStyle}>
                                   Close
                              </button>
                         </div>

                         <p style = {{color : getSpanColor(selectedSpan), fontSize : '12px', marginBottom : '4px'}}>
                              {selectedSpan.type} · {selectedSpan.status}
                         </p>
                         <p style = {{color : 'var(--text-muted)', fontSize : '12px', marginBottom : '16px'}}>
                              {new Date(selectedSpan.endTime) - new Date(selectedSpan.startTime)}ms
                         </p>

                         {selectedSpan.status === 'error' && selectedSpan.errorMessage && (
                              <div style = {{marginBottom : '16px'}}>
                                   <p style = {{color : 'var(--span-error)', fontSize : '12px', fontWeight : 600}}>Error</p>
                                   <p style = {{color : 'var(--text-primary)', fontSize : '12px'}}>{selectedSpan.errorMessage}</p>
                              </div>
                         )}

                         {selectedSpan.model && (
                              <p style = {{color : 'var(--text-secondary)', fontSize : '12px', marginBottom : '16px'}}>
                                   Model: {selectedSpan.model}
                                   {selectedSpan.tokens?.total && ` · ${selectedSpan.tokens.total} tokens`}
                                   {selectedSpan.cost != null && ` · $${selectedSpan.cost.toFixed(4)}`}
                              </p>
                         )}

                         {selectedSpan.input && (
                              <div style = {{marginBottom : '16px'}}>
                                   <p style = {{color : 'var(--text-secondary)', fontSize : '12px', fontWeight : 600, marginBottom : '4px'}}>Input</p>
                                   <pre style = {{color : 'var(--text-primary)', fontSize : '11px', whiteSpace : 'pre-wrap', wordBreak : 'break-word', background : 'var(--bg-surface-1)', padding : '8px', borderRadius : 'var(--radius)'}}>
                                        {typeof selectedSpan.input === 'string' ? selectedSpan.input : JSON.stringify(selectedSpan.input, null, 2)}
                                   </pre>
                              </div>
                         )}

                         {selectedSpan.output && (
                              <div>
                                   <p style = {{color : 'var(--text-secondary)', fontSize : '12px', fontWeight : 600, marginBottom : '4px'}}>Output</p>
                                   <pre style = {{color : 'var(--text-primary)', fontSize : '11px', whiteSpace : 'pre-wrap', wordBreak : 'break-word', background : 'var(--bg-surface-1)', padding : '8px', borderRadius : 'var(--radius)'}}>
                                        {typeof selectedSpan.output === 'string' ? selectedSpan.output : JSON.stringify(selectedSpan.output, null, 2)}
                                   </pre>
                              </div>
                         )}
    </div>
)}
                <div style = {{display : 'flex', gap : '14px',marginTop : '10px'}}>
                      {spanTypesPresent.map((type)=>(
                          <div key={type} style={{display : 'flex', alignItems : 'center', gap : '5px'}}>
                            <span style = {{
                               width : '7px',
                               height : '7px',
                               borderRadius : '2px',
                               display : 'inline-block',
                               backgroundColor : type === 'llm_call' ? 'var(--span-llm)' : type === 'retrieval' ? 'var(--span-retrieval)': type === 'custom' ? 'var(--span-custom)' : 'var(--span-tool)'
                            }}>
                            </span>
                            <span style={{color : 'var(--text-muted)', fontSize : '11px'}}>{type}</span>
                          </div>
                      ))}
                </div>
                 <div style={{marginTop : "30px"}}>
                        <h2 style={{color : 'var(--text-primary)', fontSize : '16px', fontWeight : 500}}>Evaluations</h2>
                        <div style = {{marginTop : "10px" , marginBottom : "10px", display : 'flex', alignItems : 'center', gap : '10px'}}>
                            <button type = "button" onClick = {()=> handleTriggerEval("rule_based")} disabled = {triggeringRule} style = {buttonStyle}>
                               {triggeringRule ? "Running..." : "Run Rule-Based Evaluation"}
                            </button>
                            {" "}
                            <button type = "button" onClick = {()=> handleTriggerEval("llm_judge")} disabled = {triggeringLLM} style = {buttonStyle}>
                               {triggeringLLM ? "Running..." : "Run LLM-Judge Evaluation"}
                            </button>
                          {triggerError && (
                               <p style={{color : 'var(--span-error)', fontSize : '13px', margin : 0}}>{triggerError}</p>
                          )}
                        </div>
                        <div style={{marginTop : "20px"}}>
                             <h3 style={{color : 'var(--text-primary)', fontSize : '14px', fontWeight : 500}}>Rule Based Evaluations</h3>
                              
                             {ruleEvals.length == 0 && (<p style={{color : 'var(--text-secondary)', fontSize : '13px'}}>No rule-based evaluations available</p>)}
                              {ruleEvals.map((ruleEval)=>(
                                   <div key = {ruleEval.evalId}
                                       style = {{...cardStyle, marginTop : "12px"}}>
                                              <p style={{color : 'var(--text-secondary)', fontSize : '12px', margin : '0 0 8px'}}>
                                                  {ruleEval.evalId}
                                             </p>
                                             {ruleEval.createdAt && (
                                                  <p style={{color : 'var(--text-muted)', fontSize : '12px'}}>
                                                       Created: {new Date(ruleEval.createdAt).toLocaleString()}
                                                  </p>
                                             )}
                              {ruleEval && ruleEval.status === "pending" && (<p style={{color : 'var(--text-secondary)', fontSize : '13px'}}>
                                   Waiting to be evaluated.....
                              </p>)}
                              {ruleEval && ruleEval.status === "scoring" && (<p style={{color : 'var(--text-secondary)', fontSize : '13px'}}>
                                    Evaluation in progress
                              </p>)}
                              {ruleEval && ruleEval.status === "failed" && (
                                    <p style={{color : 'var(--span-error)', fontSize : '13px'}}>
                                        Evaluation Failed: {ruleEval.reasoning?.summary || "Unknown error"}
                                    </p>
                              )}
                              {ruleEval && ruleEval.status === "completed" &&(
                                   <div style={{color : 'var(--text-secondary)', fontSize : '13px'}}>
                                        <p style={{color : 'var(--text-primary)', fontSize : '15px', fontWeight : 500}}>
                                             Overall Score: {ruleEval.score}/100
                                        </p>
                                        <p>
                                              Quality: {ruleEval.reasoning?.quality?.score}/100
                                        </p>
                                        <div style = {{marginTop : "10px"}}>
                                        <strong style={{color : 'var(--text-secondary)'}}>Quality Factors:</strong>

                                        {ruleEval.reasoning?.quality?.factors?.map((factor, index) => (
                                             <div key={index} style={{ marginLeft: "10px", marginTop: "8px" }}>
                                                  <p style={{margin : '0'}}>
                                                       {factor.rule}: {factor.detail}
                                                  </p>

                                                  <p style={{margin : '2px 0 0'}}>
                                                       Deduction: {factor.deduction}
                                                  </p>
                                             </div>
                                        ))}
                                        </div>
                                        <p style={{marginTop : '10px'}}>
                                             Latency: {ruleEval.reasoning?.latency?.score}/100
                                        </p>
                                        <p style = {{marginLeft : "10px"}}>
                                              {ruleEval.reasoning?.latency?.detail}
                                        </p>
                                        <p>
                                             Cost: {ruleEval.reasoning?.cost?.score}/100
                                        </p>
                                        <p style = {{marginLeft : "10px"}}>
                                              {ruleEval.reasoning?.cost?.detail}
                                           </p>
                                           <p>
                                             Summary: {ruleEval.reasoning?.summary}
                                           </p>
                                   </div>
                              )}
                                        </div>
                              ))}

                        </div>
                        <div style = {{marginTop : "20px"}}>
                         <h3 style={{color : 'var(--text-primary)', fontSize : '14px', fontWeight : 500}}>LLM Judge Evaluation</h3>
                         {llmEvals.length === 0 && (
                              <p style={{color : 'var(--text-secondary)', fontSize : '13px'}}>
                                   No LLM-judge evaluation available
                              </p>
                         )}
                         {llmEvals.map((llmEval)=>(
                              <div key = {llmEval.evalId}
                                   style = {{...cardStyle, marginTop : "12px"}}>
                                       <p style={{color : 'var(--text-secondary)', fontSize : '12px', margin : '0 0 8px'}}>
                                             {llmEval.evalId}
                                        </p>
                                       {llmEval.createdAt && (
                                             <p style={{color : 'var(--text-muted)', fontSize : '12px'}}>
                                                  Created: {new Date(llmEval.createdAt).toLocaleString()}
                                             </p>
                                        )}

                         {llmEval && llmEval.status === "pending" && (<p style={{color : 'var(--text-secondary)', fontSize : '13px'}}>
                                   Waiting to be evaluated.....
                              </p>)}
                         {llmEval && llmEval.status === "scoring" && (<p style={{color : 'var(--text-secondary)', fontSize : '13px'}}>
                                   Evaluation in progress
                         </p>)}
                         {llmEval && llmEval.status === "failed" && (
                                   <p style={{color : 'var(--span-error)', fontSize : '13px'}}>
                                        Evaluation Failed: {llmEval.reasoning?.summary || "Unknown error"}
                                        </p>
                              )}
                         {llmEval && llmEval.status === "completed" &&(
                              <div style={{color : 'var(--text-secondary)', fontSize : '13px'}}>

                                  <p style={{color : 'var(--text-primary)', fontSize : '15px', fontWeight : 500}}>
                                        Overall Score: {llmEval.score}/100
                                  </p>
                                   <p>
                                        Correctness: {llmEval.reasoning?.correctness?.score}/100
                                  </p>
                                   <p style={{marginLeft : '10px'}}>
                                        Comment: {llmEval.reasoning?.correctness?.comment}
                                   </p>
                                  <p>
                                        Relevance: {llmEval.reasoning?.relevance?.score}/100
                                  </p>
                                    <p style={{marginLeft : '10px'}}>
                                        Comment: {llmEval.reasoning?.relevance?.comment}
                                    </p>
                                  <p>
                                        Completeness: {llmEval.reasoning?.completeness?.score}/100
                                  </p>
                                  <p style={{marginLeft : '10px'}}>
                                       Comment: {llmEval.reasoning?.completeness?.comment}
                                  </p>
                                  <p>
                                        Clarity: {llmEval.reasoning?.clarity?.score}/100
                                  </p>
                                  <p style={{marginLeft : '10px'}}>
                                        Comment: {llmEval.reasoning?.clarity?.comment}
                                  </p>
                                  <p>
                                        Instruction Following: {llmEval.reasoning?.instructionFollowing?.score}/100
                                  </p>
                                  <p style={{marginLeft : '10px'}}>
                                       Comment: {llmEval.reasoning?.instructionFollowing?.comment}
                                  </p>
                                  <p style={{marginTop : '10px'}}>
                                       Summary: {llmEval.reasoning?.summary}
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