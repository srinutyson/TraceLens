import Projects from '../models/project.js'
import crypto from 'crypto';
import bcrypt from 'bcrypt';


export const createProject = async(req,res)=>{
     try{
        const {name} = req.body;
     if(!name){
        return res.status(400).json({
            message : "Invalid name"
        })
     }
     if(typeof name !== "string"){
          return res.status(400).json({
             message : "name must be string"
          })
     };
     const normalizedName = name.trim();
     if(!normalizedName){
        return res.status(400).json({
            message : "Project name cannot be empty"
        })
     };
     const projectId = crypto.randomUUID();
     const apiKeyLookupId = crypto.randomBytes(6).toString("hex");
     const apiKeySecret = crypto.randomBytes(32).toString("hex");
      const apiKey = `tl_${apiKeyLookupId}_${apiKeySecret}`
        const apiKeyHash = await bcrypt.hash(apiKeySecret,10);
     const project = new Projects({
          projectId : projectId,
          name : normalizedName,
          apiKeyHash : apiKeyHash,
          ownerId : req.user._id,
          apiKeyLookupId : apiKeyLookupId
     });
     await project.save();
     return res.status(201).json({
         message : "Project created successfully",
         project :{
            projectId : project.projectId,
            name : project.name
         },
         apiKey : apiKey
     });
    }
    catch(error){
        console.error("Project creation error:" , error);
        return res.status(500).json({
            message : "Internal server error"
        })
    }

}

export const getProjects = async(req,res)=>{
     try{
     const user = req.user;
     const projects = await Projects.find({ownerId : user._id}).select("projectId name updatedAt createdAt");
     return res.status(200).json(
          projects
     )
     }catch(error){
        console.error("Get projects error:",error);

           return res.status(500).json({
              message : "Internal server error"
           });
     }
}

export const getProjectById = async (req, res) => {
    try {
        const projectId = req.projectId;
        const project = await Projects.findOne({ projectId }).select("projectId name createdAt updatedAt");

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        return res.status(200).json({ project });
    }
    catch (error) {
        console.error("Get project by id error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const regenerateApiKey = async (req, res) => {
    try {
        const projectId = req.projectId;
        const project = await Projects.findOne({ projectId });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const apiKeyLookupId = crypto.randomBytes(6).toString("hex");
        const apiKeySecret = crypto.randomBytes(32).toString("hex");
        const apiKey = `tl_${apiKeyLookupId}_${apiKeySecret}`;
        const apiKeyHash = await bcrypt.hash(apiKeySecret, 10);

        project.apiKeyHash = apiKeyHash;
        project.apiKeyLookupId = apiKeyLookupId;
        await project.save();

        return res.status(200).json({
            message: "API key regenerated successfully",
            apiKey
        });
    }
    catch (error) {
        console.error("Regenerate API key error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};