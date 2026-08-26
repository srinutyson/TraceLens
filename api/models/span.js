import mongoose from 'mongoose'

 const spanSchema  = new mongoose.Schema({

  traceId : {
      type : String ,
      required : true,
      index : true
  },
   spanId : {
      type : String,
      required : true,
      unique : true,
      index : true
   },
   parentSpanId : {
      type : String ,
      default : null,
      index : true,
   },
   name :{
     type : String,
     required : true
   },
   type :{
      type : String,
      enum : ['llm_call' , 'tool_call' , 'retrieval' , 'custom'],
      required : true
   },
   startTime : {
    type : Date,
    required : true
   },
   status : {
    type : String ,
    enum : ['success' , 'error'],
    required : true
   },
   endTime : {
     type : Date,
     required : true
   },
   attributes :{
     type : mongoose.Schema.Types.Mixed,
     default : {}
   },
   input :{
     type : mongoose.Schema.Types.Mixed
   },
   output :{
     type : mongoose.Schema.Types.Mixed
   },
   model : {
    type : String
   },
   tokens :{
       prompt : {
          type : Number,
          default : 0
       },
       completion : {
           type : Number,
          default : 0
       },
       total :{
        type : Number,
          default : 0
       }
   },
   cost :{
      type : Number , default : 0
   },
   projectId :{
    type : String ,
    required : true,
    index : true
   },
   errorMessage :{
      type : String,
      default : null
   }


}, {timestamps : true});

spanSchema.index({traceId : 1 , startTime : 1});

export default mongoose.model('Span',spanSchema);