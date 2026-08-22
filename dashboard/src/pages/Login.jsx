import {useState} from 'react';
import { useNavigate , useLocation } from 'react-router-dom';


export function Login(){

    const location = useLocation();
    const navigate = useNavigate();
    const emailFromSignup = location?.state?.email;

    const [email , setEmail] = useState(emailFromSignup|| "");
    const [password , setPassword] = useState("");
    const [error , setError] = useState("");
    const [loading , setLoading] = useState(false);


  const handleLogin = async(event)=>{
       event.preventDefault();
       setError("");
       setLoading(true);
       try{
          const response = await fetch("http://localhost:4000/api/auth/login",{
              method : "POST",
              credentials : "include",
              headers : {"Content-Type" : "application/json"},
              body : JSON.stringify({email,password})
          });

          const data = await response.json();
          if(!response.ok){
             setError(data.message || "Login failed");
             return;
          }
          navigate("/projects");
       }catch(error){
     console.error(error);
     setError("Login failed. please try again");
  }finally{
       setLoading(false);
  }
  }

    return (
  <div>
          <form onSubmit={handleLogin}>
            <h1>Log in to your Tracelens account</h1>
            <div>
                <label htmlFor='email'>
                    Email
                </label>

                <input
                 id = "email"
                 type = "email"
                 value = {email}
                 onChange = {(event)=>setEmail(event.target.value)}
                 placeholder='email'
                 required
                />
            </div>
            <div>
                <label htmlFor='password'>
                    Password
                </label>
                <input
                id = "password"
                type = "password"
                value = {password}
                onChange={(event)=>setPassword(event.target.value)}
                placeholder='password'
                minLength={8}
                required
                />
            </div>
             {error && (
                    <p>{error}</p>
                )}
                <button type = "submit" disabled = {loading}>
                      {loading? "Verifying credentials.." : "Verify"}
                </button>
          </form>

          <div>
             <button type  = "button" onClick = {()=> navigate("/signup")}>
                Don't have an account? Sign up
             </button>
          </div>
</div>

    );
}