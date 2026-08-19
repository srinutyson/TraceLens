import mongoose from 'mongoose'


const projectSchema = new mongoose.Schema(
    {
        projectId : {
               type : String ,
               required : true,
               unique : true,
               index : true
        },
        name : {
            type : String,
            required : true,
            trim : true,
        },
        ownerId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true,
            index : true
        },
        apiKeyhash : {
            type : String ,
            required : true
        }
    },{
        timestamps : true
    }
)