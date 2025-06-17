import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected Successfully");
  } catch (error) {
    console.log("Error connection to MongoDB", error.message);
    process.exit(1);
  }
};
