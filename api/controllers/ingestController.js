import Span from "../models/span.js";
import Trace from "../models/trace.js";
import mongoose from "mongoose";
 const ingestSpan = async (req,res)=>{

   try {
    const  spanData = req.body;
    if(!spanData || typeof spanData !== "object" || Array.isArray(spanData)){
        return res.status(400).json({
        message : "Request body must be a JSON object"
            });
        }
    if(!spanData.traceId){
        return res.status(400).json({
        message : "traceId is required"
            });
        }

    const  projectId = req.projectId;
    spanData.projectId = projectId;
    await Span.create(spanData);
    const isRoot = spanData.parentSpanId === null;

    const updatequery = {
        $inc : {
             spanCount : 1,
             totalTokens : spanData.tokens?.total || 0,
             totalCost : spanData.cost || 0
        },
        $min :{
            startTime : spanData.startTime
        },
        $max : {
            endTime : spanData.endTime
        },
        $setOnInsert : {
            traceId : spanData.traceId,
            projectId : projectId,
            
        }

    };

    updatequery.$set = {};

    if(spanData.status === 'error'){
         updatequery.$set.status = 'error';
    }
    else {
        updatequery.$set.status = 'success';
    }

    if(isRoot){
         updatequery.$set.name = spanData.name;
    }
    else {
         updatequery.$setOnInsert.name = 'Untitled Trace';
    }
    if(Object.keys(updatequery.$set).length === 0){
        delete updatequery.$set;
    }
    try{
        await Trace.updateOne(
        {
        traceId : spanData.traceId,
        projectId : projectId
         },
         updatequery,
         {upsert : true}
    );
    }
    catch(dbError){
        if(dbError.code === 11000){
            console.log(`Upsert collision detected for trace ${spanData.traceId}.Retrying update.........`);
            delete updatequery.$setOnInsert;
            await Trace.updateOne({
                traceId : spanData.traceId ,
                projectId : projectId
            },
        updatequery);
        }
        else {
              throw dbError;
        }
    }
       res.status(200).json({
        message : 'Span Ingested successfully'
       });
}
catch(error){
        if(error instanceof mongoose.Error.ValidationError){
        const fieldErrors = Object.keys(error.errors).map((field) => ({
        field : field,
        message : error.errors[field].message
                }));
        console.log('Ingest validation failed:', fieldErrors);
        return res.status(400).json({
        message : 'Invalid span data',
        errors : fieldErrors
                });
            }
        console.error('Ingestion Error', error);
        res.status(500).json({
            error : 'Internal server error'
        });
        
}

} 

export default ingestSpan