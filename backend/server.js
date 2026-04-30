import express from "express";
import dotenv from 'dotenv'
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js'
dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000

app.use(express.json());

app.use(express.json());

app.use('/auth', authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});
connectDB()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});