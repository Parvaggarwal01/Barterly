import mongoose from "mongoose";

const isPlaceholderMongoUri = (uri) => {
  if (!uri) return true;

  try {
    const parsed = new URL(uri);
    const host = parsed.hostname.toLowerCase();

    return host === "cluster.mongodb.net" || host.includes("<") || host.includes(">");
  } catch {
    return false;
  }
};

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    if (isPlaceholderMongoUri(process.env.MONGODB_URI)) {
      throw new Error(
        "MONGODB_URI is missing or still uses the placeholder Atlas host. Replace it with the full connection string from MongoDB Atlas, including your real cluster hostname."
      );
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options as they're now defaults in mongoose 6+
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
