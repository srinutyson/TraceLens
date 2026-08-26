import { useState , useEffect } from "react";
import { useParams , useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
export function Evaluations(){
      const {projectId} = useParams();
      const navigate = useNavigate();
     
      const [evaluations, setEvaluations] = useState([]);
      const [loading , setLoading] = useState(false);
      const [error , setError] = useState("");

      useEffect(()=>{
         const fetchEvaluations = async()=>{
             setLoading(true);
             setError("");

             try{
                 const response = await fetch(`${API_BASE}/projects/${projectId}/evaluations`,{
                      credentials : "include",
                      headers : {
                          "Content-Type" : "application/json"
                      }
                 });

                 const data = await response.json();
                 if(!response.ok){
                     if(response.status === 401) {
                        navigate("/login");
                        return;
                     }
                     setError(data.message || "Could not load Evaluations");
                     return;
                 }
                 setEvaluations(data.evaluations);

             }catch{
                 setError("Something went wrong, please try again")
             }finally{
                setLoading(false);
             }
         }
          fetchEvaluations();
      },[projectId , navigate]);

      if(loading){
          return (
            <div>
                <p style ={{color : "var(--text-secondary"}}>Loading evaluations...</p>
            </div>
          );
      }
      if(error){
         return (
            <div>
                <p style = {{color : "var(--span-error"}}>{error}</p>
            </div>
         )
      }
     return (
          <div>
             <h2 style = {{color : "var(--text-primary" , fontSize : "16px",fontWeight: 500, marginBottom: "16px"}}>Evaluations</h2>
              
            {evaluations.length == 0 && (
                <p style = {{color : "var(--text-secondary)"}}>No evaluations for this project yet.</p>
            )}
            <div style = {{
                 display : "flex" , flexDirection : "column" , gap : "8px"
            }}>
                {evaluations.map((evaluation)=>(
                    <div
                     key = {evaluation.evalId}
                     onClick={() =>navigate(`/projects/${projectId}/traces/${evaluation.traceId}`)}
                     style = {{
                        background: "var(--bg-surface-2)",
                            border: "0.5px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "12px 16px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                     }}
                       >
                     <div>
                            <p style={{ color: "var(--text-primary)", fontSize: "13px", margin: 0 }}>
                                {evaluation.evaluationType === "rule_based" ? "Rule Based" : "LLM Judge"}
                            </p>
                            <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "2px 0 0" }}>
                                trace: {evaluation.traceId}
                            </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                                {evaluation.status}
                            </span>
                            {evaluation.status === "completed" && (
                                <span style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}>
                                    {evaluation.score}/100
                                </span>
                            )}
                        </div>
                       </div>
                ))}
            </div>
          </div>
     );
}