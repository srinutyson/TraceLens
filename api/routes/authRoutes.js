import express from 'express'
import {signupController , loginController, logoutController,otpVerificationController} from "../controllers/authController.js";
import { requiresAuth } from '../middleware/authMiddleware.js';
const authrouter = express.Router();

authrouter.post("/signup" , signupController);
authrouter.post("/login" , loginController);
authrouter.post("/logout",logoutController);
authrouter.post("/verify-otp",otpVerificationController);
export default authrouter;