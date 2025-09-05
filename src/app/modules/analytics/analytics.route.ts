import { Router } from "express";
import { isAuthenticated, authorizeUser } from "../../middlewares/authGuards";
import { getAnalyticsData } from "./analytics.controller";

const router = Router();

// Analytics endpoint - Admin only
router.get("/overview", isAuthenticated, authorizeUser("admin"), getAnalyticsData);

export default router;