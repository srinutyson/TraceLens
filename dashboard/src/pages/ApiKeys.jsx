import { useState , useEffect } from "react";
import {useParams ,useNavigate} from 'react-router-dom';
import { API_BASE } from "../api";

export function ApiKeys(){
    const {projectId} = useParams();
    const navigate = useNavigate();

    const [project , setProject] = useState(null);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState("");

    const [regenerating , setRegenerating] = useState(false);
    const [newApiKey , setNewApiKey] = useState(null);
    
    useEffect(()=>{
         const fetchProject = async()=>{
             setLoading(true);
             setError("");
             try{
                const response = await fetch(`${API_BASE}/projects/${projectId}`,{
                    credentials : "include",
                    headers : {
                        "Content-Type" : "application/json"
                    }
                });
                const data = await response.json();

                if(!response.ok){
                    if(response.status === 401){
                        navigate("/login");
                        return;
                    }
                    setError(data.message || "Could not load project");
                    return;
                }
                setProject(data.project);
             }
             catch{
                 setError("Something went wrong,please try again");
             }finally{
                 setLoading(false);
             }

            
         };
          fetchProject();
    },[projectId , navigate]);

    const handleRegenerate = async()=>{
        setError("");
        setRegenerating(true);

        try{
            const response = await fetch(`${API_BASE}/projects/${projectId}/regenerate-key`,{
                method : "POST",
                headers :{
                    "Content-Type" : "application/json"
                },
                credentials : "include"
            });

            const data = await response.json();

           if (!response.ok) {
                setError(data.message || "Could not regenerate key");
                return;
            }

            setNewApiKey(data.apiKey);
        }catch{
             setError("Something went wrong, please try again");
        }finally{
            setRegenerating(false);
        }
    };
    if(loading){
         return (
            <div>
                 <p style = {{color : "var(--text-secondary"}}>Loading Project...</p>
            </div>
         );
    }
        if (error && !project) {
        return (
            <div>
                <p style={{ color: "var(--span-error)" }}>{error}</p>
            </div>
        );
    }
    return (
        <div>
            <h2 style = {{color : "var(--text-primary)",fontSize: "16px", fontWeight: 500, marginBottom: "4px"}}>API Keys</h2>
            <p style = {{color : "var(--text-secondary" , fontSize: "13px", marginBottom: "20px"  }}>
                {project?.name}
            </p>

             {error && (
                <p style={{ color: "var(--span-error)" }}>{error}</p>
            )}
                     {newApiKey ? (
                <div style={{
                    background: "var(--bg-surface-2)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "16px"
                }}>
                    <p style={{ color: "var(--text-primary)", fontSize: "13px", margin: "0 0 8px" }}>
                        Save this key now — it won't be shown again:
                    </p>
                    <code style={{ color: "var(--accent)", fontSize: "13px", wordBreak: "break-all" }}>
                        {newApiKey}
                    </code>
                    <div style={{ marginTop: "12px" }}>
                        <button type="button" onClick={() => setNewApiKey(null)}
                            style={{
                            background: "transparent",
                            border: "0.5px solid var(--border)",
                            color: "green",
                            fontSize: "13px",
                            padding: "6px 12px",
                            borderRadius: "var(--radius)",
                            cursor: "pointer"
                        }}>
                            Done
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{
                    background: "var(--bg-surface-2)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
                        Regenerating a key immediately invalidates the previous one.
                    </p>
                    <button type="button" onClick={handleRegenerate} disabled={regenerating}>
                        { regenerating? "Regenerating..." : "Regenerate key"}
                    </button>
                </div>
            )}

        </div>
    );

}