import User from "../models/users.js";


export const requiresAuth = async(req,res,next)=>{
            try{
                const userId = req.session.userId;
            if(!userId){
                return res.status(401).json({
                    message : "Not Authorized"
                })
            }
            const user = await User.findById(userId);
            if(!user){
                return res.status(401).json({
                    message : "Not Authorized"
                });
            }
            req.user = user;
            next();
        }catch(error){
             console.log("Authorization error",error);
             return res.status(500).json({
                 message : "Internal server error"
             });
        }

}