import { useState , useEffect } from "react";
import  Trace  from "./TraceItem.jsx";
import { useParams,useNavigate } from "react-router-dom";


 function TraceList(){
    
    const {projectId} = useParams();
    const [loadingStatus , setLoadingStatus] = useState(true);
    const [traces , setTraces] = useState([]);
    const [error,setError] = useState("");
    const navigate = useNavigate();
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
         if(!response.ok){
              if(response.status === 404) setError("Project not found")
              else setError("Could not load traces");
              return ;
         }
          setTraces( data);
            }catch{
         
          setError("Failed to fetch traces ");
       }
       finally{
            setLoadingStatus(false);
       }
      }    
        fetchTraces();
   },[projectId,navigate]);
        
       if(loadingStatus){
           return (<div>
               <p>Loading Traces..................</p>
           </div>);
       }
        if(error){
           return (
              <div>
                <p>{error}</p>
              </div>
           )
       }
       if(traces.length === 0){
           return (
              <div>
                <p>Your project didn't record any traces</p>
              </div>
           )
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
                             <Trace key = {trace.traceId} id = {trace.traceId} name = {trace.name} projectId = {projectId}/> 
                        ))}
                    </tbody>
                </table>
                </>);
       
};

export default TraceList;