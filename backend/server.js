import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import mongoose from 'mongoose';
import { errorHandler } from './utils/errorHandler.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use('/auth', authRoutes);
app.get('/', (req, res) => res.send('Server is running!'));
app.use(errorHandler);

const startServer = async () => {
  try {
    // Ensure MONGO_URL is set
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL is not defined in environment variables');
    }

    await connectDB();
    console.log('✅ MongoDB Connected!');

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err && err.message ? err.message : err);
  mongoose.connection.close(() => process.exit(1));
});
