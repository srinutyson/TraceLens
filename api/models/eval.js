import mongoose from "mongoose";

const evalSchema = new mongoose.Schema({
    evalid : {
        type : String,
        required : true,
        unique : true
    },
    traceId : {
         type : String,
         required : true,
         index : true,
    },
    scoredType :{
        type : String , 
        enum : ['rule_based' , 'llm_judge'],
        required : true 
    },
    score : {
         type : Number,
         required : true 
    },
    reasoning : {
         type : String
    },
    status : {
        type : String,
        enum : ['pending', 'completed' , 'failed'],
        default : 'pending'
    },
    projectId :{
        type : String,
        required : true
    }
   
},{timestamps : true});

export default mongoose.model('Eval' , evalSchema);