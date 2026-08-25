import { useState} from "react";
import { useNavigate } from "react-router-dom";

const wordmarkStyle = {
    textAlign: "center",
    marginBottom: "100px",
    marginTop : "0px",
    fontSize: "70px",
    fontWeight: 600,
    letterSpacing: "-0.04em"
};

const pageStyle = {
    flexDirection: "column",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-base)"
};

const cardStyle = {
    background: "var(--bg-surface-2)",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "24px",
    width: "360px"
};

const labelStyle = {
    color: "var(--text-secondary)",
    fontSize: "13px",
    display: "block",
    marginBottom: "4px"
};

const inputStyle = {
    background: "var(--bg-base)",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-primary)",
    fontSize: "13px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box"
};

const buttonStyle = {
    background: "var(--accent)",
    border: "none",
    borderRadius: "var(--radius)",
    color: "var(--bg-base)",
    fontSize: "13px",
    padding: "8px 12px",
    width: "100%",
    cursor: "pointer",
    marginTop: "8px"
};

const linkButtonStyle = {
    background: "transparent",
    border: "none",
    color: "var(--accent)",
    fontSize: "13px",
    cursor: "pointer",
    padding: 0,
    marginTop: "16px"
};


export function Signup(){
         const navigate= useNavigate();
        const [email,setEmail] = useState("");
        const [password,setPassword] = useState("");
        const [error , setError] = useState("");
        const [loading , setLoading]  = useState(false);
        
       const handleSignup = async(event)=>{
           event.preventDefault();

           setError("");
           setLoading(true);
           try{
              const response = await fetch("http://localhost:4000/api/auth/signup",{
                   method : "POST",
                   credentials : "include",
                   headers :{
                     "Content-type" : "application/json"
                   },
                   body : JSON.stringify({
                    email,
                    password
                   })

              });

              const data = await response.json();
              if(!response.ok){
                  setError(data.message || "Signup failed");
                  return ;
            }
              navigate("/verify-otp",{
                state :{
                      email
                }
              });

           } catch{
            
                setError("Unable to connect to server");

           }finally{
               setLoading(false);
           }

       };





        return (
        <div style = {pageStyle}>
            <div>
                <h1 style = {wordmarkStyle}>
                    <span style={{ color: "var(--text-primary)" }}>Trace</span>
                    <span style={{ color: "var(--accent)" }}>Lens</span>
                </h1>
            <div style = {cardStyle}>
                <h1 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 500, marginTop: 0 }}
                >Create your TraceLens account</h1>
            <form onSubmit={handleSignup}>
                
                <div style={{ marginBottom: "14px" }}>
                    <label htmlFor="email" style={labelStyle}> Email</label>
                    <input
                    id = "email"
                    type = "email"
                    value = {email}
                    onChange = {(event)=>setEmail(event.target.value)}
                    placeholder="email"
                    required
                     style={inputStyle}
                    />
                </div>
                <div style={{ marginBottom: "14px" }}>
                    <label htmlFor="password" style={labelStyle}>Password</label>
                    <input
                    id = "password"
                    type = "password"
                    value = {password}
                    onChange = {(event)=> setPassword(event.target.value)}
                    placeholder="password"
                    minLength={8}
                    required
                     style={inputStyle}
                    />
                </div>
                {error && (
                    <p style={{ color: "var(--span-error)", fontSize: "13px" }}>{error}</p>
                )}
                <button type = "submit" disabled = {loading} style={buttonStyle}>
                    {loading ? "Creating account.... ":"Sign up"}
                </button>
            </form>
            <button
              type = "button" 
               style={linkButtonStyle}
               onClick = {()=> navigate("/login")}>
                Already have an account? Login

            </button>
            </div>
        </div>
        </div>
        );
}