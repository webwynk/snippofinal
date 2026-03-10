import express from "express";
import {
  getAdminData,
  createService,
  updateService,
  deleteService,
  createStaff,
  updateStaff,
  deleteStaff,
  updateBookingStatus,
  approvePendingStaff,
  rejectPendingStaff,
} from "../controllers/adminController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(requireAuth(["admin"]));

router.get("/data", getAdminData);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);
router.patch("/bookings/:id/status", updateBookingStatus);
router.post("/pending/:id/approve", approvePendingStaff);
router.post("/pending/:id/reject", rejectPendingStaff);

export default router;
