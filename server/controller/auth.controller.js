import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import userModel from "../models/user.model"

export const register = async(req,res)=>{
    const {name,email,password} = req.body
    if(!name || !email || !password){
        return res.status(400).json({
            success:false,
            message:"all fields are required"
        })
    }

    try {

        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"user already exit"
            })
        }


      const hashedPassword = await bcrypt.hash(password,10)

      const newuser = new userModel({
        name,email,password:hashedPassword
      });

      await newuser.save();

      const token = jwt.sign({id:newuser._id},process.env.JWT_SEKRET,{expiresIn:'7d'})
        

       res.staus(201).cookie("token",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:process.env.NODE_ENV == "production" ? "none":"strict",
        maxAge:7*24*60*60*1000
      })
        
    } catch (error) {
        res.json({
            succes:false,
            message:error.message
        })
    }
}