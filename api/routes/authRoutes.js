import express from 'express'
import {signupController , loginController, logoutController} from "../controllers/authController.js";

const authrouter = express.Router();

authrouter.post("/signup" , signupController);
authrouter.post("/login" , loginController);
authrouter.post("/logout",logoutController)

export default authrouter;