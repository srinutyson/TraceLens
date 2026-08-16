import Trace from "../models/trace.js"
import Span from "../models/span.js"
import Eval from "../models/eval.js";
export const getTraces = async (req,res) =>{
   try{
     const projectId = req.projectId;
       const traces =    await Trace.find({projectId : projectId }) .sort({ startTime : -1}) .limit(50);
      return  res.status(200).json(traces);
   }
   catch(error){
         console.error(error);
         res.status(500).json({
            error : "Internal server error"
         });
   }
};

export const getTracesById = async(req,res) =>{
     try {
        const traceId = req.params.traceId;
        const projectId = req.projectId;
        const trace = await Trace.findOne({traceId : traceId, projectId : projectId});
        const spans = await Span.find({
           traceId : traceId,
           projectId : projectId
        }) . sort({startTime : 1});
        const evals = await Eval.find({traceId : traceId , projectId : projectId});
         res.status(200).json({
            trace,
            spans,
            evals
         })
      }
      catch(error){
          console.error(error);
         res.status(500).json({
            error : "Internal server error"
         });
      }

}