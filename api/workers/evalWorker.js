import Eval from '../models/eval.js'
import Trace from '../models/trace.js';
import Span from '../models/span.js';
import  {ruleEvaluator} from '../evalModels/ruleEvaluator.js';
import  {llmEvaluator} from '../evalModels/llmEvaluator.js'

async function completeEvaluation(claimedEval , evaluation) {
    return await Eval.findOneAndUpdate({
           evalId : claimedEval.evalId
    },
     {
        $set : {
              score : evaluation.score,
              reasoning  : evaluation.reasoning,
              status : "completed",
              lockedAt : null
        }
     },{
        new : true
     });
}

async function failEvaluation(claimedEval , error){
     return await Eval.findOneAndUpdate(
          {evalId : claimedEval.evalId},
          {
            $set : {
                status : "failed",
                reasoning : {
                    summary : error.message
                },
                lockedAt : null
            }
          },
          {new : true}
     );
}

async function claimWork(){
    const now = new Date();
    const staleTime = new Date(now.getTime() - 5 * 60 * 1000);
    const workEval = await Eval.findOneAndUpdate({
          $or : [
                 {status : "pending"},
                 {
                     status : "scoring",
                     lockedAt : {$lte : staleTime}
                 }
          ]
     },
       {
        $set : {
            status : "scoring",
            lockedAt : now
        }
       },{
        new : true
       }
        );
        if(!workEval) return null;
   
     try{
        const evaluation = await processEvaluation(workEval);
        const completeEval = await completeEvaluation(workEval , evaluation);
        return completeEval; 
     } 
     catch(error){
          const failedEval = await failEvaluation(workEval , error);
          return failedEval;
     }
     
}


async function processEvaluation(claimedEval){
      const trace = await Trace.findOne({traceId : claimedEval.traceId, projectId : claimedEval.projectId});
      if(!trace){
          throw new Error(`Trace  not found`)
      }
      const spans = await Span.find({traceId : claimedEval.traceId , projectId : claimedEval.projectId});
      if(spans.length === 0){
          throw new Error(`Spans  not found`)
      }
      let  evaluation ;
     if(claimedEval.evaluationType === 'rule_based'){
        evaluation = ruleEvaluator(trace,spans);
     }
     else if (claimedEval.evaluationType === 'llm_judge')evaluation = await llmEvaluator(spans);
     else throw new Error("Invalid evaluation Type");

     return evaluation;
    
      
}