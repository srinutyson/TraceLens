import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


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
             const response = await fetch("http://localhost:4000/api/projects",{
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
            }catch(error){
                 console.error(error);
                 setError("Failed to fetch projects");
            }finally{
                 setLoading(false);
            }
        };
        fetchProjects();
    },[navigate]);
  const handleLogout = async()=>{
    
        try{
             await fetch("http://localhost:4000/api/auth/logout",
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
            const response = await fetch("http://localhost:4000/api/projects",{
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

         }catch(error){
             setError("Something went wrong please try again");
             console.error(error);
         }finally{
             setCreating(false);
         }
    }
    return (
         <div>
             <div>
                <h1>Your Projects</h1>
                <button type = "button" onClick = {handleLogout}>
                    Log out
                </button>
             </div>
              
               {error && (
                  <p>{error}</p>
               )}
               {createdApiKey && (
                 <div>
                    <p>
                        Save this API key now - it will not be shown again:
                    </p>
                   
                    <code>{createdApiKey}</code>
                    {"       "}
                    <button type  = "button" onClick  = {()=> setCreatedApiKey(null)}>
                         Done
                    </button>
                    </div>
               )}
                {
                    loading? (
                        <p>Loading Projects...</p>
                    ): projects.length === 0? (
                        <p>You don't have any projects yet</p>
                    ): (
                        <ul>
                            {projects.map((project)=>(
                                 <li key = {project.projectId}>
                                    <button type = "button" onClick = {()=> navigate(`/projects/${project.projectId}/traces`)}>
                                        {project.name} ({project.projectId})
                                    </button>
                                 </li>
                            ))}
                        </ul>
                    )
                }
                <form onSubmit = {handelCreateProject}>
                     <label htmlFor="newProjectName">Project name:</label>
                     {" "}
                     <input
                      id = "newProjectName"
                      type = "text"
                      value = {newProject}
                      onChange = {(event)=> setNewProject(event.target.value)}
                      placeholder="Project:"
                      required
                     />
                     {"    "}
                     <button type = "submit" disabled = {creating}>
                         {creating? "Creating.." : "Create"}
                     </button>
                     
                     
                </form>
                   
                
               
         </div>
    );
}