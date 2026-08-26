import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        email : {
             type : String,
             required : true,
             unique : true,
             lowercase : true,
             index : true,
             trim : true
        },
        passwordHash : {
            type : String,
            required : true
        },
        isVerified : {
              type : Boolean,
              default : false
        },
        otpHash : {
            type : String
        },
        otpExpiresAt : {
            type : Date,
        },
        otpAttempts : {
             type : Number,
             default : 0
        },
        createdAt : {
            type : Date , default : Date.now
        },
        resetOtpHash: {
        type: String,
        default: null
        },
        resetOtpExpiresAt: {
            type: Date,
            default: null
        },
        resetOtpAttempts: {
            type: Number,
            default: 0
        }
},{
    timestamps : true
}
 );

 export default mongoose.model("User" , userSchema);