import { Link } from "react-router-dom";



function Trace({id , name,status,projectId}){
     return (
         
           <Link
           to={`/projects/${projectId}/traces/${id}`}
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--bg-surface-2)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "12px 16px",
                textDecoration: "none",
                marginBottom: "8px"
            }}
           >
            <div>
                <p style = {{color: "var(--text-primary)", fontSize: "13px", margin: 0 }}>
                  {name}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "2px 0 0" }}>
                  {id}
                </p>
            </div>

            <span
             style = {{
               fontSize: "12px",
                    color: status === "error" ? "var(--span-error)" : "var(--text-secondary)"
                
             }}
            >
               {status || "unknown"}
            </span>
           
           
           
           </Link>


     );
}
export default Trace;