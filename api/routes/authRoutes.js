import express from 'express'
import {signupController , loginController,
      logoutController,otpVerificationController,otpResendController,
      forgotPassword, resetPassword
    } from "../controllers/authController.js";
import { otpResendLimiter,otpVerificationLimiter,forgotPasswordLimiter,resetPasswordLimiter } from '../middleware/rateLimiting.js';


const authrouter = express.Router();

authrouter.post("/signup" , signupController);
authrouter.post("/login" , loginController);
authrouter.post("/logout",logoutController);
authrouter.post("/verify-otp",otpVerificationLimiter,otpVerificationController);
authrouter.post("/resend-otp",otpResendLimiter,otpResendController);
authrouter.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
authrouter.post('/reset-password', resetPasswordLimiter, resetPassword);
export default authrouter;