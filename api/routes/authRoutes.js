import express from 'express'
import {signupController , loginController, logoutController,otpVerificationController,otpResendController} from "../controllers/authController.js";
import { requiresAuth } from '../middleware/authMiddleware.js';
import { otpResendLimiter,otpVerificationLimiter } from '../middleware/rateLimiting.js';
const authrouter = express.Router();

authrouter.post("/signup" , signupController);
authrouter.post("/login" , loginController);
authrouter.post("/logout",logoutController);
authrouter.post("/verify-otp",otpVerificationLimiter,otpVerificationController);
authrouter.post("/otp-resend",otpResendLimiter,otpResendController);
export default authrouter;