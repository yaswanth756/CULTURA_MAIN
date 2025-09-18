import express from "express"
import { connectDB } from "./config/database.js"
import dotenv from "dotenv"
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from './routes/listing.routes.js';
dotenv.config()


const app=express();
const PORT=process.env.PORT;



app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// connnect db
app.use('/api/listings', listingRoutes);
connectDB();

app.get("/test",(req,res)=>{
    return res.send("hellow world");
})

app.listen(PORT,()=>{
    console.log("Server is running on Port no : 3000 👍")
})