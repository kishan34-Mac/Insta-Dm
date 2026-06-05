import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getLeads, updateLead } from "../controllers/lead.controller.js";

const router = express.Router();

// Apply auth protection to all lead routes
router.use(protect);

// GET /api/v1/leads - Fetch user-scoped leads populated with campaigns
router.get("/", getLeads);

// PUT /api/v1/leads/:id - Update lead details (status, notes, tags) from CRM
router.put("/:id", updateLead);

export default router;