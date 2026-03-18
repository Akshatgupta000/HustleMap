import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = (process.env.MONGO_URI || "").trim();

    if (!mongoUri) {
      console.error(
        "MongoDB connection error: MONGO_URI is not set. Check your .env file and restart the server.",
      );
      throw new Error("MONGO_URI environment variable is required");
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Make sure:");
    console.error("1. Your IP is whitelisted in MongoDB Atlas");
    console.error("2. MONGO_URI is correct in your .env file");
    process.exit(1);
  }
};

export default connectDB;
