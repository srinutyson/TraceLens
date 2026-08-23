import Projects from "../models/project.js";
import bcrypt from 'bcrypt';



export const protectAuth = async(req,res,next)=>{
       try {
           const authHeader = req.headers.authorization;
           if(!authHeader || !authHeader.startsWith("Bearer ")){
               return res.status(401).json({
                    message : "Invalid or missing API key"
               });
           }

           const token = authHeader.slice("Bearer ".length).trim();

           if(!token){
               return res.status(401).json({
                    message : "Invalid or missing API key"
               });
           }
           const parts = token.split("_");
           if(parts.length !== 3 || parts[0] !== "tl"){
               return res.status(401).json({
                    message : "Invalid or missing API key"
               });
           }
           const [,lookupId,secret] = parts;
           if(!lookupId || !secret){
               return res.status(401).json({
                    message : "Invalid or missing API key"
               });
           }
           
           const project = await Projects.findOne({
               apiKeyLookupId : lookupId
           });
           if(!project){
               return res.status(401).json({
                     message : "Invalid or missing API key"
               });
           }
           const isMatch = await bcrypt.compare(secret,project.apiKeyHash);
           if(!isMatch){
                return res.status(401).json({
                    message : "Invalid or missing API key"
                });
           }
            req.projectId = project.projectId;
            next();
}catch(error){
     console.error("protectAuth error:",error);
     res.status(400).json({
        message : "Internal server error"
     });
}

};
