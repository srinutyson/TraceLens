import express from 'express'
import {signupController , loginController} from "../controllers/authController.js";

const authrouter = express.Router();

authrouter.post("/signup" , signupController);
authrouter.post("/login" , loginController);

export default authrouter;