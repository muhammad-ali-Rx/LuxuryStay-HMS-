import express from "express";
import { addRating, getRoomRating } from "../Controller/RatingController.mjs";

const router = express.Router();

// Room rating routes
router.post("/:roomId/rating", addRating);
router.get("/:roomId/rating", getRoomRating);

export default router;