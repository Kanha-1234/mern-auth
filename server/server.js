import express from "express";
import cors from "cors"
import "dotenv/config"
import cookieParser from "cookie-parser"
import connectDB from "./config/mongodb.js";


const app = express();


const port = process.env.PORT || 4000;
//db call
connectDB()

app.use(express.json())
app.use(cookieParser())
const corsOptions = {
    origin:"*",
credentials:true
}
app.use(cors(corsOptions))


app.listen(port,()=>{
    console.log(`server listen in port ${port}`)
})