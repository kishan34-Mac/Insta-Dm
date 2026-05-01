import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async () => {
  await mongoose.connect(env.mongoUrl);
};

export default connectDB;
