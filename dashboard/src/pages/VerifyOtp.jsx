import { useState } from "react";
import { useNavigate , useLocation  } from "react-router-dom";



export function VerifyOtp(){
    
    const navigate = useNavigate();
    const location = useLocation();

    const emailFromSignup = location?.state?.email;
    const emailIsLocked = Boolean(emailFromSignup);

    const [email , setEmail] = useState(emailFromSignup || "");
    const [otp,setOtp] = useState("");
    const [error,setError] = useState("");
    const [loading,setLoading] = useState(false);
    const [resendLoading , setResendLoading] = useState(false);
    const [resendMessage , setResendMessage] = useState("");
   


   const handleVerify = async(event)=>{
        event.preventDefault();
        setError("");
        setResendMessage("");
        setLoading(true);
        try{
            const response = await fetch("http://localhost:4000/api/auth/verify-otp",{
                  method : "POST",
                  credentials : "include",
                  headers :{"Content-Type" : "application/json"},
                  body : JSON.stringify({email , otp})
            });

            const data = await response.json();

            if(!response.ok){
                setError(data.message || "Verification failed");
                return;
            }
            navigate("/login",{state : {email}});
        } catch(error){
              console.error(error);
             setError("Something went wrong please try again");
        }
         finally{
             setLoading(false);
         }
   }

   const handleResend = async()=>{
       setError("");
       setResendMessage("");
       setResendLoading(true);
       try{
            const response = await fetch("http://localhost:4000/api/auth/otp-resend",{
                  method : "POST",
                  headers : {"Content-Type" : "application/json"},
                  credentials : "include",
                  body : JSON.stringify({email})
            });

            const  data = await response.json();
            console.log("iiji")
            if(!response.ok){
                setError(data.message || "Verification failed")
               
            }
           
            setResendMessage("New OTP has been sent");
       }
       catch(err){
            console.error(err);
            setError("Something went wrong please try again");
       }
       finally{
           setResendLoading(false);
       }
   }

    return (
              
                <form onSubmit={handleVerify}>
                    <h1>Verify your Email</h1>
                   <div>
                    <label htmlFor="email">Email</label>
                    <input
                      id = "email"
                      type = "email"
                      value = {email}
                      onChange={(event)=> setEmail(event.target.value)}
                      placeholder="email"
                       disabled  = {emailIsLocked}
                      required
                    />
                     {emailIsLocked && (
                        <p>Code sent to this email.Go back to signup to change it.</p>
                     )}
                   </div>
                   <div>
                    <label htmlFor="otp">OTP</label>
                    <input
                    id = "otp"
                    type = "text"
                    inputMode="numeric"
                    maxLength={6}
                    value = {otp}
                    onChange={(event)=> setOtp(event.target.value)}
                    placeholder="6-digit code"
                    required
                    
                    />
                   </div>
                   {error && (<p>{error}</p>)}
                   {resendMessage && (<p>{resendMessage}</p>)}

                   <button type = "submit" disabled = {loading}>
                      {loading ? "Verifying OTP....":"Verify your OTP"}
                   </button>
                   <button type = "button" onClick = {handleResend} disabled = {resendLoading}>
                      {resendLoading? "Resending....":"Resend code"}
                   </button>
                     <div>
                         <button type = "button" onClick = {()=> navigate("/login")}>
                            Already verified? Log in
                         </button>
                     </div>
                </form>

        
    );
}