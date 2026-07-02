import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getLeads, getLeadById, updateLead } from "../controllers/lead.controller.js";
import { validate } from "../validators/auth.validator.js";
import { getLeadsSchema, updateLeadSchema } from "../validators/lead.validator.js";

const router = express.Router();

router.use(protect);

router.get("/", validate(getLeadsSchema), getLeads);
router.get("/:id", getLeadById);
router.put("/:id", validate(updateLeadSchema), updateLead);

export default router;