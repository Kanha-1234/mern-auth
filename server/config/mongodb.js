import mongoose from "mongoose"

const connectDB = async()=>{
   try{
    mongoose.connection.on("connected",()=>{
        console.log("db connected")
    })
    await mongoose.connect(`${process.env.MONGO_URI}mern-auth`)
    
   }
   catch(err){
    console.log(err)
   }
}

export default connectDB;