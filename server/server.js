import express from "express"
import { connectDB } from "./config/database.js"
import dotenv from "dotenv"
import cors from "cors";
import authRoutes from "./routes/users/auth.routes.js";
import listingRoutes from './routes/users/listing.routes.js';
import paymentRoutes from './routes/users/payment.routes.js';
import bookingRoutes from './routes/users/booking.routes.js';


import vendorAuthRoutes from "./routes/vendor/vendor.auth.routes.js";

dotenv.config()


const app=express();
const PORT=process.env.PORT;



app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// connnect db
app.use('/api/listings', listingRoutes);
connectDB();

app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);


app.use('/api/vendor', vendorAuthRoutes);


app.get("/test",(req,res)=>{
    return res.send("hellow world");
})

app.listen(PORT,()=>{
    console.log("Server is running on Port no : 3000 👍")
})