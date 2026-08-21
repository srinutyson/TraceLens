import rateLimit from 'express-rate-limit';


export const otpResendLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 1000,
    message :{
        message : "Too many OTP requests. Please try again later"
    },
    standardHeaders : true,
    legacyHeaders : true
});

export const otpVerificationLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 1000,
    message :{
          message : "Too many otp verification attempts. Please try again later"
    },
    standardHeaders : true,
    legacyHeaders : true
})