import express from "express";
import { createReview, getStaffReviews } from "../controllers/reviewController.js";
import { protect } from "../auth.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/staff/:staffId", getStaffReviews);

export default router;
