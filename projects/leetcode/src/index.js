import express from "express";
import dotenv from "dotenv"

dotenv.config()

const app = express();

const PORT = process.env.PORT || 8080


app.get("/" , (req , res)=>{
    res.json({
        success:true,
        message:"Welcome to leetcode backend api"
    })
})

app.listen(PORT , ()=>{
    console.log(`Your server is running on port http://localhost:${PORT}`)
})