import express from "express";
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  toggleCampaignStatus,
  getCampaignLogs,
} from "../controllers/campaign.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../validators/auth.validator.js";
import {
  createCampaignSchema,
  updateCampaignSchema,
  getCampaignByIdSchema,
} from "../validators/campaign.validator.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getCampaigns)
  .post(validate(createCampaignSchema), createCampaign);

router.get("/:id/logs", validate(getCampaignByIdSchema), getCampaignLogs);

router.route("/:id")
  .get(validate(getCampaignByIdSchema), getCampaignById)
  .put(validate(updateCampaignSchema), updateCampaign)
  .delete(validate(getCampaignByIdSchema), deleteCampaign);

router.patch("/:id/toggle", validate(getCampaignByIdSchema), toggleCampaignStatus);

export default router;
