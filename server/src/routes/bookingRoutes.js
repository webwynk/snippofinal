import express from "express";
import { getBookings, createBooking, extendBooking } from "../controllers/bookingController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth(), getBookings);
router.post("/", requireAuth(["user"]), createBooking);
router.patch("/:id/extend", requireAuth(["user"]), extendBooking);

export default router;
