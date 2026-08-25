import { useState , useEffect } from "react";
import  Trace  from "./TraceItem.jsx";
import { useParams,useNavigate } from "react-router-dom";

 const inputStyle = {
    background: "var(--bg-surface-2)",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-primary)",
    fontSize: "13px",
    padding: "6px 10px"
};

const filterButtonStyle = (active) => ({
    background: active ? "var(--bg-surface-2)" : "transparent",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    color: active ? "var(--accent)" : "var(--text-secondary)",
    fontSize: "12px",
    padding: "6px 10px",
    cursor: "pointer"
});

 function TraceList(){
    
    const {projectId} = useParams();
    const [loadingStatus , setLoadingStatus] = useState(true);
    const [traces , setTraces] = useState([]);
    const [error,setError] = useState("");
    const [searchQuery , setSearchQuery] = useState("");
    const [statusFilter , setStatusFilter] = useState("all");
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
        } catch{
         
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
               <p style={{ color: "var(--text-secondary)" }}>Loading Traces..................</p>
           </div>);
       }
        if(error){
           return (
              <div>
                <p style={{ color: "var(--span-error)" }}>{error}</p>
              </div>
           )
       }
       if(traces.length === 0){
           return (
              <div>
                <p style={{ color: "var(--text-secondary)" }}>Your project didn't record any traces</p>
              </div>
           )
       }
       const filteredTraces = traces.filter((trace)=>{
            const matchesSearch = trace.name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || trace.status === statusFilter;
            return matchesSearch && matchesStatus;
       })
          return (
             <div>
                <div style = {{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: 500, margin: 0 }}>
                    Traces
                </h2>
                <div style = {{display: "flex", alignItems: "center", gap: "10px" }}>
                     <input 
                       type = "text"
                       placeholder="Search Traces"
                       value = {searchQuery}
                       onChange = {(e)=> setSearchQuery(e.target.value)}
                       style = {inputStyle}
                       />
                         <button type = "button" onClick = {()=> setStatusFilter("all")} style = {filterButtonStyle(statusFilter == "all")}>ALL</button>
                         <button type="button" onClick={() => setStatusFilter("success")} style={filterButtonStyle(statusFilter === "success")}>Success</button>
                         <button type="button" onClick={() => setStatusFilter("error")} style={filterButtonStyle(statusFilter === "error")}>Error</button>
                
                    
                </div>

                </div>
                 {filteredTraces.length === 0 ? (
                     <p style={{ color: "var(--text-secondary)" }}>No traces match your search</p>
                 ):(
                    <div>
                        {filteredTraces.map((trace)=>(
                            <Trace
                            key = {trace.traceId}
                            id = {trace.traceId}
                            name = {trace.name}
                            status = {trace.status}
                            projectId = {projectId}
                            ></Trace>
                        ))}
                    </div>
                 )}
             </div>
         );
       
};

export default TraceList;