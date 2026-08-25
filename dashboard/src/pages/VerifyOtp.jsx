import { useState } from "react";
import { useNavigate , useLocation  } from "react-router-dom";


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

const secondaryButtonStyle = {
    background: "transparent",
    border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-secondary)",
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
           
            if(!response.ok){
                setError(data.message || "Verification failed")
               return;
            }
           
            setResendMessage("New OTP has been sent");
       }
       catch{
          
            setError("Something went wrong please try again");
       }
       finally{
           setResendLoading(false);
       }
   }

    return (
        <div style={pageStyle} >
            <div>
                <h1 style = {wordmarkStyle}>
                    <span style={{ color: "var(--text-primary)" }}>Trace</span>
                    <span style={{ color: "var(--accent)" }}>Lens</span>
                </h1>
            <div style={cardStyle}>
                <form onSubmit={handleVerify}>
                    <h1 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 500, marginTop: 0 }}
                    >Verify your Email</h1>
                   <div style={{ marginBottom: "14px" }}>
                    <label htmlFor="email" style={labelStyle}>Email</label>
                    <input
                      id = "email"
                      type = "email"
                      value = {email}
                      onChange={(event)=> setEmail(event.target.value)}
                      placeholder="email"
                      disabled  = {emailIsLocked}
                      required
                      style={inputStyle}
                    />
                     {emailIsLocked && (
                        <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Code sent to this email.Go back to signup to change it.</p>
                     )}
                   </div>
                   <div style={{ marginBottom: "14px" }}>
                    <label htmlFor="otp" style={labelStyle}>OTP</label>
                    <input
                    id = "otp"
                    type = "text"
                    inputMode="numeric"
                    maxLength={6}
                    value = {otp}
                    onChange={(event)=> setOtp(event.target.value)}
                    placeholder="6-digit code"
                    required
                    style={inputStyle}
                    />
                   </div>
                   {error && (<p style={{ color: "var(--span-error)", fontSize: "13px" }}>{error}</p>)}
                   {resendMessage && (<p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{resendMessage}</p>)}

                   <button type = "submit" disabled = {loading} style={buttonStyle}>
                      {loading ? "Verifying OTP....":"Verify your OTP"}
                   </button>
                   <button type = "button" onClick = {handleResend} disabled = {resendLoading} style={secondaryButtonStyle}>
                      {resendLoading? "Resending....":"Resend code"}
                   </button>
                    </form>
                     <div>
                         <button type = "button" style={linkButtonStyle} onClick = {()=> navigate("/login")}>
                            Already verified? Log in
                         </button>
                     </div>
                </div>
             </div>
          </div>
            
        
    );
}