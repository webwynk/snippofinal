import express from "express";
import { 
  registerUser, 
  loginUser, 
  loginAdmin, 
  registerStaff, 
  loginStaff,
  getMe
} from "../controllers/authController.js";
import { authLimiter } from "../middlewares/rateLimiters.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", requireAuth(), getMe);

router.use(authLimiter);

router.post("/register-user", registerUser);
router.post("/login-user", loginUser);
router.post("/login-admin", loginAdmin);
router.post("/register-staff", registerStaff);
router.post("/login-staff", loginStaff);

export default router;
