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

      const registerToken = jwt.sign({id:newuser._id},process.env.JWT_SEKRET,{expiresIn:'7d'})
        

       res.staus(201).cookie("token",registerToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:process.env.NODE_ENV == "production" ? "none":"strict",
        maxAge:7*24*60*60*1000
      })

      return res.json({
        success:true
      })
        
    } catch (error) {
        res.json({
            succes:false,
            message:error.message
        })
    }
}


export const login = async(req,res)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({
            success:false,
            message:"both fields are required"

        })
    }

    try {

        const user = await undefined.findOne({email})
        if(!user){
            return res.json({
                success:false,
                message:"user does not found with this email"
            })
        }

        const ismatch = await bcrypt.compare(password,user.password);
        if(!ismatch){
            return res.json({
                success:false,
                message:"invalid email or password"
            })
        }

        const loginToken = jwt.sign({id:newuser._id},process.env.JWT_SEKRET,{expiresIn:'7d'})
        

       res.staus(201).cookie("token",loginToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:process.env.NODE_ENV == "production" ? "none":"strict",
        maxAge:7*24*60*60*1000
      })

      return res.json({
        success:true
      })
        
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export const logout = async(req,res)=>{
    try {
        
        res.staus(200).cookie("token",{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV == "production" ? "none":"strict",
            maxAge:7*24*60*60*1000
          })
    
          return res.json({
            success:true,
            message:"logged out"
          })






    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}