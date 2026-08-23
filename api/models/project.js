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
        apiKeyHash : {
            type : String ,
            required : true
        },
        apiKeyLookupId : {
              type : String,
              required: true,
              index : true,
              unique : true,

        }
    },{
        timestamps : true
    }
)

export default mongoose.model('Projects',projectSchema);