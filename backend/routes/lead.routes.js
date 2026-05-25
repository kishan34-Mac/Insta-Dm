import express from "express";
import Lead from "../models/Lead.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth protection to all lead routes
router.use(protect);

// GET /api/v1/leads - Fetch user-scoped leads populated with campaigns
router.get("/", async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;

    const leads = await Lead.find({ user: userId })
      .populate("campaigns")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    console.error("GET LEADS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
});

// PUT /api/v1/leads/:id - Update lead details (status, notes, tags) from CRM
router.put("/:id", async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const { status, notes, tags } = req.body;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      {
        $set: {
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
          ...(tags && { tags }),
          lastContacted: new Date(),
        },
      },
      { returnDocument: "after", runValidators: true }
    ).populate("campaigns");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    console.error("UPDATE LEAD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update lead",
    });
  }
});

export default router;