import mongoose from "mongoose"
import dotenv from "dotenv"
import { generateVendorTestData,clearTestData}  from "../utils/test.js"
import { createIndexes } from "./database-indexes.js";
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    //await createIndexes();
    //clearTestData();
    //generateVendorTestData();

    console.log("MongoDB Connected Successfully")
  } catch (error) {
    console.error("MongoDB Connection Error:", error)
    process.exit(1)
  }
}

