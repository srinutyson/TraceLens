import User from "../models/users.js";
import bcrypt from 'bcrypt';
import {Resend} from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);


export const signupController  = async (req,res)=>{
       try{
            const email = req.body.email;
            const password = req.body.password;
            if(!email || !password){
                 return  res.status(400).json({
                      message : "Invalid Email or Password"
                  })
            }
             
             if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                message: "Email and password must be strings"
            });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const normalizedEmail = email.trim().toLowerCase();
            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({
                    message: "Invalid email format"
                });
            }
            if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
            }

         
            const existingUser = await User.findOne({email : normalizedEmail});
             if(existingUser){
                 if(existingUser.isVerified){
                     return res.status(409).json({
                        message : "User already exists"
                     });
                 }
                 const otpExpired = !existingUser.otpExpiresAt|| existingUser.otpExpiresAt.getTime() <= Date.now();
                 if(!otpExpired){
                    return res.status(429).json({
                         message : "OTP is still active.Please use the existing OTP"
                    });
                 }
                const otp = crypto.randomInt(100000,1000000).toString();
                const otpHash = await bcrypt.hash(otp,10);

                  const {error} = await resend.emails.send({
                      from : "onboarding@resend.dev",
                      to : [normalizedEmail],
                      subject : "TraceLens email Verification",
                      html : `
                              <h2>TraceLens Email Verification</h2>
                              <p>Your verification OTP is:</p>
                              <h1>${otp}</h1>
                              <p>This OTP expires in 10 minutes</p>
                              `

                });
                if(error){
                       console.error("Resend error" , error);
                       return res.status(500).json({
                         message : "Failed to send verification mail"
                       });
                }

             
                existingUser.otpHash = otpHash;
                existingUser.otpExpiresAt = new Date(Date.now() + (10 * 60 * 1000));
                existingUser.otpAttempts = 0;
                await existingUser.save();
                return res.status(200).json({
                    message : "Verification OTP sent"
                });
            }
              

             
           const passwordHash = await bcrypt.hash(password,10);
           const otp = crypto.randomInt(100000,1000000).toString();
           const otpHash = await bcrypt.hash(otp,10);
           let user ;
           try{
                user = await User.create({
              email : normalizedEmail,
              passwordHash,
              isVerified : false,
              otpHash,
              otpAttempts:0,
              otpExpiresAt : new Date(Date.now() + 10 * 60 *1000)
           });
           }catch(err){
              if(err.code === 11000){
                 return res.status(409).json({ message: "User already exists" });
              }
              throw err;
           }

           const {error} = await resend.emails.send({
              from : "onboarding@resend.dev",
              to : [normalizedEmail],
              subject : "TraceLens email Verification",
              html : `
                        <h2>TraceLens Email Verification</h2>
                        <p>Your verification OTP is:</p>
                        <h1>${otp}</h1>
                        <p>This OTP expires in 10 minutes</p>
                        `
           });
           if(error){
              console.error("Resend error" , error);
               await User.deleteOne({ _id: user._id });
              return res.status(500).json({
                 message : "Failed to send verification email"
              });
           }
            
          

           return res.status(201).json({
             message : "Signup succesful.Please verify your email using OTP send to you."
           });
       }
       catch(error){
            console.error("Singup error:",error);

            return res.status(500).json({
                message : "Internal server error"
            });
       }
}

export const loginController = async(req,res)=>{
     try{
           const {email,password} = req.body;
           if(!email || !password){
               return res.status(400).json({
                  message :  "Invalid email or password "
               });
           }
           if(typeof email !== "string" || typeof password !== "string"){
               return res.status(400).json({
                 message : "Email and password must be strings"
               })
           }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const normalizedEmail = email.trim().toLowerCase();
          if(!emailRegex.test(normalizedEmail)){
               return res.status(400).json({
                   message : "Invalid email format"
               });
          }
          if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
          }
          const existingUser = await User.findOne({email : normalizedEmail});
          if(!existingUser){
                return res.status(401).json({
                      message : "Invalid Email or password "
                })
          }
          if(!existingUser.isVerified){
                 return res.status(401).json({
                     message : "Authentication pending"
                 })
          }
          const passwordMatch = await bcrypt.compare(password , existingUser.passwordHash);
          if(!passwordMatch){
              return res.status(401).json({
                   message : "Invalid Email or password "
              })
          }

          req.session.userId = existingUser._id;

         req.session.save((error)=>{
            if(error){
                console.error("Session save error:",error);
                return res.status(500).json({
                    message : "Internal server error"
                })
            }
            return res.status(200).json({
              message : "Login successful"
            });
         })
     }
     catch(error){
           console.error("Login error" , error);
           return  res.status(500).json({
             message : "Internal server error"
           });
     }
}

export const logoutController = async(req,res)=>{
      req.session.destroy((error)=>{
        if(error){
            console.error("Logout error:",error);

            return res.status(500).json({
                 message : "Internal server error"
            });

        }
         res.clearCookie("connect.sid",{
            httpOnly : true,
            secure : false,
            sameSite : "lax"
         });

         return res.status(200).json({
             message : "Logout successful"
         });
      });
};

export const otpVerificationController = async ( req,res)=>{
    try{
         const {email , otp} = req.body;
         if(!email || !otp){
              return res.status(400).json({
                 message : "Invalid credentials"
              })
         }
         if(typeof email !== "string" || typeof otp !== "string"){
            return res.status(400).json({
                  message : "email and otp must be strings"
            });
         }

         const normalizedEmail = email.trim().toLowerCase();
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if(!emailRegex.test(normalizedEmail)){
            return res.status(400).json({
                 message : "Invalid Email"
            })
         }
         const existingUser = await User.findOne({email : normalizedEmail});
         if(!existingUser){
               return res.status(401).json({
                 message : "Invalid Email"
               });
         }
         if(existingUser.isVerified){
              return res.status(409).json({
                 message : "Email already exists"
              });
         }
         if(!existingUser.otpHash){
             return res.status(400).json({
                  message : "Invalid or Expired OTP"
             });
         }
         const otpExpired = !existingUser.otpExpiresAt|| existingUser.otpExpiresAt.getTime() <= Date.now();
         if(otpExpired){
              return res.status(400).json({
                 message : "Invalid or Expired OTP"
              });
         }
         
        if(existingUser.otpAttempts >= 5){
            return res.status(429).json({
              message : "Maximum OTP verification attempts exceeded. Please request a new OTP"
            });
        }
        const otpCompare = await bcrypt.compare(otp , existingUser.otpHash);
        if(!otpCompare){
            existingUser.otpAttempts += 1;
            await existingUser.save();
             return res.status(401).json({
                 message : "Invalid OTP"
             })
        }
        existingUser.isVerified  = true;
        existingUser.otpAttempts = 0;
        existingUser.otpHash = undefined;
        existingUser.otpExpiresAt = undefined;
        await existingUser.save();

        return res.status(200).json({
             message : "OTP verification successful"
        });
    }
    catch(error){
            console.error("OTP verification error",error);
            return res.status(500).json({
                message : "Internal server error"
            });
    }
}

export const otpResendController = async(req,res)=>{
     try{
           const {email} = req.body;
           if(!email){
              return res.status(400).json({
                 message : "Invalid email"
              })
           }
           if(typeof email !== "string"){
            return res.status(400).json({
                 message : "email should be a string"
            })
           }
           const normalizedEmail = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(normalizedEmail)){
                return res.status(400).json({
                     message : "Invalid Email"
                })
            }
            const user = await User.findOne({email : normalizedEmail});
            if(!user){
                 return res.status(401).json({
                    message : "Invalid Email"
                 })
            }
           if(user.isVerified){
              return res.status(409).json({
                 message : "Email already exists"
              });
            }
            const otp = crypto.randomInt(100000,1000000).toString();
            const otpHash = await bcrypt.hash(otp,10);
            user.otpExpiresAt  = new Date(Date.now() + 1000 * 10 * 60);
            user.otpHash  = otpHash;
            user.otpAttempts = 0;
            await user.save();

            const {error} = await resend.emails.send({
                from  : "onboarding@resend.dev",
                to : [normalizedEmail],
                subject : "TraceLens Email Verification",
                html : `
                        <h2>TraceLens Email Verification</h2>
                        <p>Your verification OTP is:</p>
                        <h1>${otp}</h1>
                        <p>This OTP expires in 10 minutes</p>
                      `
            });
            if(error){
                 console.error("Resend error",error);
                 return res.status(500).json({
                    message : "Internal server error"
                 });
            }

            return res.status(200).json({
                 message : "OTP sent successfully"
            });

     }
     catch(error){
        console.error("OTP resend error" , error);

        res.status(500).json({
             message : "Internal server error"
        });
     }
}

export const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;
        if (!email || typeof email !== "string") {
            return res.status(400).json({
                message: "Invalid email"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const normalizedEmail = email.trim().toLowerCase();
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        const genericMessage = "If an account exists for this email, a reset code has been sent.";

        const user = await User.findOne({ email: normalizedEmail });
        if (!user || !user.isVerified) {
            return res.status(200).json({
                message: genericMessage
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        const { error } = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: [normalizedEmail],
            subject: "TraceLens Password Reset",
            html: `
                    <h2>TraceLens Password Reset</h2>
                    <p>Your password reset code is:</p>
                    <h1>${otp}</h1>
                    <p>This code expires in 10 minutes</p>
                    `
        });

        if (error) {
            console.error("Resend error (forgot password):", error);
            return res.status(200).json({
                message: genericMessage
            });
        }

        user.resetOtpHash = otpHash;
        user.resetOtpExpiresAt = new Date(Date.now() + (10 * 60 * 1000));
        user.resetOtpAttempts = 0;
        await user.save();

        return res.status(200).json({
            message: genericMessage
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP, and new password are required"
            });
        }
        if (typeof email !== "string" || typeof otp !== "string" || typeof newPassword !== "string") {
            return res.status(400).json({
                message: "Invalid input types"
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "New password must be at least 8 characters long"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user || !user.resetOtpHash) {
            return res.status(400).json({
                message: "Invalid or expired reset code"
            });
        }

        const otpExpired = !user.resetOtpExpiresAt || user.resetOtpExpiresAt.getTime() <= Date.now();
        if (otpExpired) {
            return res.status(400).json({
                message: "Invalid or expired reset code"
            });
        }

        if (user.resetOtpAttempts >= 5) {
            return res.status(429).json({
                message: "Too many attempts. Please request a new code."
            });
        }

        const isMatch = await bcrypt.compare(otp, user.resetOtpHash);
        if (!isMatch) {
            user.resetOtpAttempts += 1;
            await user.save();
            return res.status(401).json({
                message: "Invalid or expired reset code"
            });
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.resetOtpHash = null;
        user.resetOtpExpiresAt = null;
        user.resetOtpAttempts = 0;
        await user.save();

        return res.status(200).json({
            message: "Password reset successful. Please log in with your new password."
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};