import express from "express";
import dotenv from "dotenv"
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js"
import problemRoutes from "./routes/problem.routes.js"
dotenv.config()

const app = express();

const PORT = process.env.PORT || 8080

// Middlewares
app.use(express.json())
app.use(morgan("dev"))
app.use(cookieParser())

app.get("/" , (req , res)=>{
    res.json({
        success:true,
        message:"Welcome to leetcode backend api"
    })
})


app.use("/api/v1/auth" , authRoutes);
app.use("/api/v1/problems" , problemRoutes);


app.listen(PORT , ()=>{
    console.log(`Your server is running on port http://localhost:${PORT}`)
})