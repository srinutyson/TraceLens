export const protectAuth = (req,res,next)=>{
       try {
          
            const projectId = req.headers['x-project-id'] || req.body?.projectId || 'test-project-123';
            req.projectId = projectId;
            next();
}catch(error){
     res.status(400).json({
        message : "Invalid Token"
     });
}

}