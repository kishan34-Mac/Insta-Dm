import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { validate } from "../validators/auth.validator.js";
import { getAdminListSchema, updateSubscriptionSchema } from "../validators/admin.validator.js";

import {
  getAdminDashboard,
  getAdminUsers,
  getAdminPayments,
  getAdminCampaigns,
  updateUserPlan,
} from "../controllers/admin.controller.js";

const router = express.Router();

/*
  Every admin route requires:
  1. Valid JWT token
  2. Logged-in user must have role: "admin"
*/
router.use(protect);
router.use(requireAdmin);

/*
  GET /api/v1/admin/dashboard
  Returns platform statistics, revenue, plans, recent users and payments.
*/
router.get("/dashboard", getAdminDashboard);

/*
  GET /api/v1/admin/users?page=1&limit=10&search=&plan=&status=
  Returns all users with filters and pagination.
*/
router.get("/users", validate(getAdminListSchema), getAdminUsers);

/*
  PATCH /api/v1/admin/users/:userId/subscription
*/
router.patch("/users/:userId/subscription", validate(updateSubscriptionSchema), updateUserPlan);

/*
  GET /api/v1/admin/payments?page=1&limit=10&search=&status=&plan=
  Returns all Razorpay payment records.
*/
router.get("/payments", validate(getAdminListSchema), getAdminPayments);

/*
  GET /api/v1/admin/campaigns?page=1&limit=10&search=&status=
  Returns campaigns from every user.
*/
router.get("/campaigns", validate(getAdminListSchema), getAdminCampaigns);

export default router;
