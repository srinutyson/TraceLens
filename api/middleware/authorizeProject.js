import Project from "../models/project.js";

export const authorizeProject = async(req,res,next)=>{
     try{ 
        const projectId  = req.params.projectId;
      const userId = req.user._id;
      const project = await Project.findOne({projectId : projectId , ownerId : userId});
     
      if(!project){
           return res.status(404).json({
            message : "Project not found"
           });
      }
      req.projectId = project.projectId;
      next();
    }
    catch(error){
         console.error("Authorize project error",error);

         return res.status(500).json({
            message : "Internal server error"
         });
    }
}