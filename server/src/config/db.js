import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Make sure:");
    console.error("1. Your IP is whitelisted in MongoDB Atlas (use 0.0.0.0/0 for Render)");
    console.error("2. MONGO_URI / MONGODB_URI is set in Render Environment (use your Atlas mongodb+srv://... string)");
    process.exit(1);
  }
};

export default connectDB;
