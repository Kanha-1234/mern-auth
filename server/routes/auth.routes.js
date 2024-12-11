import express from "express";
import { login, register,logout, sendVerifyOtp, verifyEmail, isAutenticated, sendResetOtp, resetPassword } from "../controller/auth.controller.js";
import userAuth from "../middleware/userAuth.js";
const authRouter = express.Router();


authRouter.post('/register',register)
authRouter.post('/login',login)
authRouter.post('/logout',logout)
authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp)
authRouter.post('/verify-account',userAuth,verifyEmail)
authRouter.post('/is-auth',userAuth,isAutenticated)
authRouter.post('/send-reset-otp',sendResetOtp)
authRouter.post('/reset-password',resetPassword)


export default authRouter;