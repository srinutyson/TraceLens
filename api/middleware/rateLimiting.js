import rateLimit from 'express-rate-limit';


export const otpResendLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 3,
    message :{
        message : "Too many OTP requests. Please try again later"
    },
    standardHeaders : true,
    legacyHeaders : true
});

export const otpVerificationLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 5,
    message :{
          message : "Too many otp verification attempts. Please try again later"
    },
    standardHeaders : true,
    legacyHeaders : true
});

export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: { message: "Too many password reset requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false
});

export const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false
});