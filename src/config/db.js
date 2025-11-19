import mongoose from "mongoose";

export async function connectToDatabase(mongoUrl) {
  if (!mongoUrl) {
    throw new Error(
      "MongoDB connection URL is not set in the environment variables."
    );
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUrl);
  console.log("[db] Connected to MongoDB");
}