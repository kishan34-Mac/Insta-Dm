import express from "express";
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  toggleCampaignStatus,
} from "../controllers/campaign.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getCampaigns)
  .post(createCampaign);

router.route("/:id")
  .get(getCampaignById)
  .put(updateCampaign)
  .delete(deleteCampaign);

router.patch("/:id/toggle", toggleCampaignStatus);

export default router;
