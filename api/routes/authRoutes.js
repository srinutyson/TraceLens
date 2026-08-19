import express from 'express'
import signup from "../controllers/authController.js";

const authrouter = express.Router();

authrouter.post("/signup" , signup);

export default authrouter;