import express from "express";
import { authorize, protect } from "../middleware/auth.js";
import {
  getComprehensiveAnalytics,
  getDashboardStats,
  getSalesReport,
} from "../controllers/admin.controller.js";
import userRoutes from "./admin.user.routes.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/sales-report", getSalesReport);
router.get("/analytics/comprehensive", getComprehensiveAnalytics);

router.use("/users", userRoutes);

export default router;
