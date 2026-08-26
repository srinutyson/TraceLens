import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

const cardStyle = {
    background: "var(--bg-surface-2)",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "16px"
};

const buttonStyle = {
    background: "transparent",
    border: "0.5px solid var(--border)",
    color: "var(--accent)",
    fontSize: "13px",
    padding: "6px 12px",
    borderRadius: "var(--radius)",
    cursor: "pointer"
};

const codeBlockStyle = {
    background: "var(--bg-base)",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-primary)",
    fontSize: "12px",
    padding: "10px 12px",
    overflowX: "auto",
    whiteSpace: "pre",
    marginTop: "8px",
    marginBottom: "8px"
};


const inputStyle = {
    background: "var(--bg-surface-2)",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-primary)",
    fontSize: "13px",
    padding: "6px 10px"
};

export function Projects(){
     const navigate = useNavigate();

    const [projects,setProjects] = useState([]);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState("");

    const [creating , setCreating] = useState(false);
    const [createdApiKey , setCreatedApiKey] = useState(null);
    const [newProject , setNewProject] = useState("");


    useEffect(()=>{
        const fetchProjects = async()=>{
            setLoading(true);
            setError("");
            try{
             const response = await fetch(`${API_BASE}/projects`,{
                method : "GET",
                credentials : "include"
             });

             const data = await response.json();
             if(!response.ok){
                 if(response.status === 401){
                 navigate("/login");
                return;
             }
                 setError(data.message || "Could not load projects");
                 return;
             }
             
              
              
                setProjects(data);
            }catch{      
                 setError("Failed to fetch projects");
            }finally{
                 setLoading(false);
            }
        };
        fetchProjects();
    },[navigate]);
  const handleLogout = async()=>{
    
        try{
             await fetch(`${API_BASE}/auth/logout`,
                {
                    method : "POST",
                    credentials : "include"
                }
             );

        }catch(error){
             console.log(error);
        }finally{
            navigate("/login");
        }
  }
    const handelCreateProject = async(event)=>{
         event.preventDefault();
         setError("");
         setCreating(true);
         try{
            const response = await fetch(`${API_BASE}/projects`,{
                 method : "POST",
                 headers : {"Content-Type" : "application/json"},
                 credentials : "include",
                 body : JSON.stringify({name : newProject})

            });
            const data = await response.json();
            if(!response.ok){
                setError(data.message || "Could not create project");
                return;
            }
            setCreatedApiKey(data.apiKey);
            setProjects((prev) => [
                 ...prev,
                 {projectId : data.project.projectId , name : data.project.name},
            ]);
            setNewProject("");

         }catch{
             setError("Something went wrong please try again");
           
         }finally{
             setCreating(false);
         }
    }
    return (
         <div>
             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h1 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 500, margin: 0 }}>Your Projects</h1>
                <button type = "button" onClick = {handleLogout} style={buttonStyle}>
                    Log out
                </button>
             </div>
              
               {error && (
                  <p style={{ color: "var(--span-error)", fontSize: "13px" }}>{error}</p>
               )}
               {createdApiKey && (
                 <div style={{ ...cardStyle, marginBottom: "16px" }}>
                    <p style={{ color: "var(--text-primary)", fontSize: "13px", margin: "0 0 8px" }}>
                        Save this API key now - it will not be shown again:
                    </p>
                   
                    <code style={{ color: "var(--accent)", fontSize: "13px", wordBreak: "break-all" }}>{createdApiKey}</code>
                    <div style={{ marginTop: "12px" }}>
                    <button type  = "button" onClick  = {()=> setCreatedApiKey(null)} style={buttonStyle}>
                         Done
                    </button>
                    </div>
                    </div>
               )}
                {
                    loading? (
                        <p style={{ color: "var(--text-secondary)" }}>Loading Projects...</p>
                    ): projects.length === 0? (
                        <p style={{ color: "var(--text-secondary)" }}>You don't have any projects yet</p>
                    ): (
                        <div  style={{ marginBottom: "20px" }}>
                            {projects.map((project)=>(
                                 <div 
                                  key = {project.projectId}
                                  onClick={() => navigate(`/projects/${project.projectId}/traces`)}
                                  style={{ ...cardStyle, marginBottom: "8px", cursor: "pointer" }}
                                 >
                                <p style={{ color: "var(--text-primary)", fontSize: "13px", margin: 0 }}>
                                    {project.name}
                                </p>
                                <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "2px 0 0" }}>
                                    {project.projectId}
                                </p>
                                 </div>
                            ))}
                        </div>
                    )
                }
                <form onSubmit = {handelCreateProject} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                     <label htmlFor="newProjectName" style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Project name:</label>
                     {" "}
                     <input
                      id = "newProjectName"
                      type = "text"
                      value = {newProject}
                      onChange = {(event)=> setNewProject(event.target.value)}
                      placeholder="Project:"
                      required
                      style = {inputStyle}
                     />
                     <button type = "submit" disabled = {creating} style={buttonStyle}>
                         {creating? "Creating.." : "Create"}
                     </button>
                     
                     
                </form>
                    <div style={{ ...cardStyle, marginTop: "20px" }}>
                <h2 style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 500, margin: "0 0 8px" }}>
                    Using the SDK
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: "0 0 8px" }}>
                    Create a project above to get your API key, then install the SDK in your own app:
                </p>
                <pre style={codeBlockStyle}>npm install tracelens-sdk</pre>
                <pre style={codeBlockStyle}>{`import { TraceLens } from 'tracelens-sdk';

const tracer = new TraceLens({ apiKey: 'your_project_api_key' });

await tracer.trace('My-Workflow', async () => {
  await tracer.startSpan('Step-One', 'custom', async (childData) => {
    childData({ output: 'result' });
    return 'result';
  });
});`}</pre>
            </div>
                
               
         </div>
    );
}