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
    const {traceId} = useParams();
    const [loadingStatus , setLoadingStatus] = useState(true);
    const [Tracedata , setTraceData] = useState([]);
    useEffect(() =>{
         const fetchTrace = async () =>{
              try{
                const response = await fetch(`http://localhost:4000/api/traces/${traceId}`,{
                     headers :{
                        "Content-Type" : "application/json",
                        "x-project-id" : "test-project"
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


    },[traceId]);
      if(loadingStatus){
           return (
              <div>
                <p>
                    Loading Trace details..........
                </p>
              </div>
           )
      }

      const trace = Tracedata.trace;
      const startTime = new Date(trace.startTime).getTime();
      const endTime = new Date(trace.endTime).getTime();
      const traceDuration = endTime - startTime;
      const processedSpans = processSpanTree(Tracedata.spans);

          return (<div>
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
          </div>);

      }

       export default TraceWaterFall;