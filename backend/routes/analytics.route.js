import express from "express";
import {adminRoute, protectedRoute} from "../middleware/auth.middleware.js";
import {getAnalyticsData, getSalesData} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData(req, res);

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

        const dailySalesData = await getSalesData(startDate, endDate);

        res.status(200).json({ analyticsData, dailySalesData });
    } catch (error) {
        console.error("Error in analytics route:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

export default router;