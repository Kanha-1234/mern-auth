import jwt from "jsonwebtoken";

const userAuth = async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        res.json({
            success:false,
            message:"login again"
        })
    }
    try {
        
       const tokenDecode =   jwt.verify(token,process.env.JWT_SEKRET)

       if(tokenDecode.id){
        req.body.userId = tokenDecode.id
       }
       else{
        res.json({
            success:false,
            message:"login again"
        })
       }
       next()
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export default userAuth