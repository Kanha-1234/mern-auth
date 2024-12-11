import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userModel from "../models/user.model.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "all fields are required",
    });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user already exit",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newuser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await newuser.save();

    const registerToken = jwt.sign(
      { id: newuser._id },
      process.env.JWT_SEKRET,
      { expiresIn: "7d" }
    );

    res.status(201).cookie("token", registerToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    //mail service

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: `registration successfull`,
      text: `hey ${name} welcome to our web site`,
    };

    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      newuser,
    });
  } catch (error) {
    res.json({
      succes: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "both fields are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "user does not found with this email",
      });
    }

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.json({
        success: false,
        message: "invalid email or password",
      });
    }

    const loginToken = jwt.sign({ id: user._id }, process.env.JWT_SEKRET, {
      expiresIn: "7d",
    });

    res.status(201).cookie("token", loginToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      user,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.status(200).cookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "logged out",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//send verification account
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (user.isAccoutVerified) {
      return res.json({ success: false, message: "account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: `Account verification otp`,
      text: `hey ${user.name} your otp ${otp} for account verification`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "account verification otp",
    });
  } catch (error) {}
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.json({
      success: false,
      message: "missing details",
    });
  }
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "user does not exit",
      });
    }
    if (user.VerifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "invalid otp",
      });
    }

    if (user.VerifyOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "otp Expired",
      });
    }

    user.isAccoutVerified = true;

    user.VerifyOtp = "";
    user.VerifyOtpExpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "email verified successfull",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//check the user is authenticated or not
export const isAutenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({
      success: false,
      message: error.mesage,
    });
  }
};

//send password reset otp

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.json({
      message: "email required",
      success: false,
    });
  }
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15*60*1000;
     user.save()
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: `password reset otp`,
      text: `hey ${user.name} your otp ${otp} for password reset`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
        success:true,
        message:"otp send to your email"
    })
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};


//verify otp and reset pasword

export const resetPassword = async(req,res)=>{
    const {email,otp,newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({
            success:false,
            message:"all fields are rwquired"
        })
    }

    try {
        
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({
                success:false,
                message:"does not find user"
            })
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({
                success:false,
                message:"invalid otp"
            })
        }
          
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({
                success:false,
                message:"otp expired"
            })
        }

         const hashesPassword = await bcrypt.hash(newPassword,10)
 
          user.password = hashesPassword

          user.resetOtp="";
          user.resetOtpExpireAt=0;

          user.save();

          return  res.json({
            success:true,
            message:"password update successfully"
        })


    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
          });
    }
}