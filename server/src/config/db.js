import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Reuse existing connection if already connected/connecting.
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    if (mongoose.connection.readyState === 2) {
      return mongoose.connection;
    }

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
      maxPoolSize: 5,
      minPoolSize: 1,
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
