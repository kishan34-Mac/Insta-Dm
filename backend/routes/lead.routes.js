import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getLeads, updateLead } from "../controllers/lead.controller.js";
import { validate } from "../validators/auth.validator.js";
import { getLeadsSchema, updateLeadSchema } from "../validators/lead.validator.js";

const router = express.Router();

router.use(protect);

router.get("/", validate(getLeadsSchema), getLeads);

router.put("/:id", validate(updateLeadSchema), updateLead);

export default router;