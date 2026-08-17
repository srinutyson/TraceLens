import Eval from "../models/eval.js";
import Trace from "../models/trace.js";
import { randomUUID } from "node:crypto";



const evalIngestion = async (req,res)=>{
        try{
            const projectId  = req.projectId;
            const traceId = req.params.traceId;
            const evaluationType = req.body.evaluationType;
            const tracedata = await Trace.findOne({traceId : traceId , projectId : projectId});
            
            if(!tracedata){
                return res.status(404).json({
                     error : "Trace not found"
                });
            }
            // const evalExists = await Eval.findOne({traceId , projectId , evaluationType});
            // if(evalExists){
            //     return res.status(409).json({
            //         error : "Evaluation already exists"
            //     })
            // }
            const evaluation = await Eval.create({
                evalId : randomUUID(),
                traceId,
                projectId,
                evaluationType,
                status : 'pending'
            });
            return res.status(200).json(evaluation);
        }
        catch(error){

            console.error("Evaluation creation error:" ,error);
            if(error.code === 11000){
                  return res.status(409).json({
                      error : "Evaluation already exists"
                  });
            }
            return res.status(500).json({
                error : "Internal server error"
            });
        }
}

export default evalIngestion;