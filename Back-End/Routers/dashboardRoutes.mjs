import express from "express";
import { getDashboardStats } from "../Controller/dashboardController.mjs";

const router = express.Router();

router.get("/stats", getDashboardStats);

export default router;
