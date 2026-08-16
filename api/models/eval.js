import mongoose from "mongoose";

const evalSchema = new mongoose.Schema({
    evalId : {
        type : String,
        required : true,
        unique : true
    },
    traceId : {
         type : String,
         required : true,
         index : true,
    },
    evaluationType :{
        type : String , 
        enum : ['rule_based' , 'llm_judge'],
        required : true 
    },
    score : {
         type : Number
    },
    reasoning : {
         type : mongoose.Schema.Types.Mixed
    },
    status : {
        type : String,
        enum : ['pending', 'completed' , 'failed','scoring'],
        default : 'pending'
    },
    projectId :{
        type : String,
        required : true
    },
    lockedAt :{
        type : Date
    }
   
},{timestamps : true});

export default mongoose.model('Eval' , evalSchema);