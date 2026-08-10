import mongoose from "mongoose";

const traceSchema = new mongoose.Schema({
    traceId : {
        type : String,
        required : true,
        unique : true,
        index :true
    },
    projectId : {
        type : String ,
        required : true,
        index : true
    },
    name : {
        type : String,
        required : true
    },
    startTime : {
        type : Date,
        required : true
    },
    endTime : {
        type : Date,
        required : true
    },
    status : {
        type : String ,
        enum : ['success' , 'error'],
        required : true
    },
    spanCount : {
        type : Number,
        default : 0
    },
    totalTokens :{
          type : Number ,
          default : 0
    },
    totalCost : {
        type : Number ,
        default : 0
    },
    evalScore :{
         type : Number,
         default : null
    }
},{timestamps : true});

traceSchema.index({projectId : 1 , startTime : -1});

export default mongoose.model('Trace' , traceSchema);