import mongoose from "mongoose";
import { AppError } from "./errorHandler.js";

/**
 * Execute a callback within a MongoDB transaction.
 * Ensures atomicity and handles rollbacks automatically on error.
 * 
 * @param {Function} callback - Function that takes the session as an argument and executes DB ops
 * @returns {Promise<any>} Result of the callback
 */
export const withTransaction = async (callback) => {
  const session = await mongoose.startSession();
  let result;
  
  try {
    session.startTransaction();
    
    // Execute the callback passing the session
    result = await callback(session);
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Transaction aborted due to error:", error);
    
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Database transaction failed", 500, { details: error.message });
  } finally {
    await session.endSession();
  }
  
  return result;
};

export default withTransaction;
