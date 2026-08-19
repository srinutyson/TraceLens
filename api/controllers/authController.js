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
                existingUser.otpHash = otpHash;
                existingUser.otpExpiresAt = new Date(Date.now() + (10 * 60 * 1000));
                existingUser.otpAttempts = 0;
                await existingUser.save();
                const {error} = await resend.emails.send({
                      from : "onboarding@resend.dev",
                      to : [normalizedEmail],
                      subject : "TraceLens email Verification",
                      html : `
                              <h2>TraceLens Email Verification</h2>
                              <p>Your verification OTP is:<p>
                              <h1>${otp}</h1>
                              <p>This OTP expires in 10 minutes<p>
                              `

                });
                if(error){
                       console.error("Resend error" , error);
                       return res.status(500).json({
                         message : "Failed to send verification mail"
                       });
                }
                return res.status(200).json({
                    message : "Verification OTP sent"
                });

             }
           const passwordHash = await bcrypt.hash(password,10);
           const otp = crypto.randomInt(100000,1000000).toString();
           const otpHash = await bcrypt.hash(otp,10);
           const user = new User({
              email : normalizedEmail,
              passwordHash,
              isVerified : false,
              otpHash,
              otpAttempts:0,
              otpExpiresAt : new Date(Date.now() + 10 * 60 *1000)
           });
           await user.save();

           const {error} = await resend.emails.send({
              from : "onboarding@resend.dev",
              to : [normalizedEmail],
              subject : "TraceLens email Verification",
              html : `
                        <h2>TraceLens Email Verification</h2>
                        <p>Your verification OTP is:<p>
                        <h1>${otp}</h1>
                        <p>This OTP expires in 10 minutes<p>
                        `
           });
           if(error){
              console.error("Resend error" , error);
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
                  message :  "Invalid email or password"
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
                      message : "Invalid Email or password"
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
                   message : "Invalid Email or password"
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
            httponly : true,
            secure : false,
            sameSite : "lax"
         });

         return res.status(200).json({
             message : "Logout sussessful"
         });
      });
};
