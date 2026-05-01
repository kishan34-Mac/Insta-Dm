import express from "express";
import {
  connectInstagram,
  disconnectInstagram,
  getInstagramAccounts,
  instagramCallback,
} from "../controllers/instagram.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/connect", protect, connectInstagram);
router.get("/callback", instagramCallback);
router.get("/accounts", protect, getInstagramAccounts);
router.post("/disconnect", protect, disconnectInstagram);

export default router;
