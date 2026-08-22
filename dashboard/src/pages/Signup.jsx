import { useState} from "react";
import { useNavigate } from "react-router-dom";

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

           } catch(error){
                console.error("Signup request error",error);
                setError("Unable to connect to server");

           }finally{
               setLoading(false);
           }

       };





        return (
            <div>
                <h1>Create your TraceLens account</h1>
            <form onSubmit={handleSignup}>
                
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                    id = "email"
                    type = "email"
                    value = {email}
                    onChange = {(event)=>setEmail(event.target.value)}
                    placeholder="email"
                    required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                    id = "password"
                    type = "password"
                    value = {password}
                    onChange = {(event)=> setPassword(event.target.value)}
                    placeholder="password"
                    minLength={8}
                    required
                    />
                </div>
                {error && (
                    <p>{error}</p>
                )}
                <button type = "submit" disabled = {loading}>
                    {loading ? "Creating account.... ":"Sign up"}
                </button>
            </form>
            <button
              type = "button" 
               onClick = {()=> navigate("/login")}>
                Already have an account? Login

            </button>
            </div>
        );
}