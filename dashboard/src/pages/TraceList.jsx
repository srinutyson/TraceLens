import { useState , useEffect } from "react";
import  Trace  from "./TraceItem.jsx";


 function TraceList(){
    console.log("rendering");
    const [loadingStatus , setLoadingStatus] = useState(true);
    const [traces , setTraces] = useState([]);

     useEffect(() =>{
         const fetchTraces = async () =>{
            try{
                const response = await fetch("http://localhost:4000/api/traces",{
            headers : {
               "Content-Type" : "application/json",
               "x-project-id" : "test-project-123"
            }
        });
         const data = await response.json();
          setTraces( data);
            }catch(error){
          console.error("Failed to fetch traces",error);
       }
       finally{
            setLoadingStatus(false);
       }
      }    
        fetchTraces();
   },[]);

       if(loadingStatus){
           return (<div>
               <p>Loading Traces..................</p>
           </div>);
       }
          return (<>
                <table>
                    <thead>
                        <tr>
                        <th>ID</th>
                        <th>NAME</th>
                        </tr>
                    </thead>

                    <tbody>
                       {
                        traces.map((trace) =>(
                             <Trace key = {trace.traceId} id = {trace.traceId} name = {trace.name}/> 
                        ))}
                    </tbody>
                </table>
                </>);
       
};

export default TraceList;