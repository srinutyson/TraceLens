import { useState , useEffect } from "react";
import  Trace  from "./TraceItem.jsx";
import { useParams } from "react-router-dom";


 function TraceList(){
    console.log("rendering");
    const {projectId} = useParams();
    const [loadingStatus , setLoadingStatus] = useState(true);
    const [traces , setTraces] = useState([]);

     useEffect(() =>{
         const fetchTraces = async () =>{
            try{
                const response = await fetch(`http://localhost:4000/api/projects/${projectId}/traces`,{
                    credentials : "include",
            headers : {
               "Content-Type" : "application/json",
              
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
   },[projectId]);

       if(loadingStatus){
           return (<div>
               <p>Loading Traces..................</p>
           </div>);
       }
          return (<>
                <table>
                    <thead>
                        <tr>
                       <th>NAME</th>
                        <th>ID</th>
                        
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