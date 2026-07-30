import { Router } from "express";
import { register, login, getMe, deleteAccount, deactivateAccount, sendOtp, resetPassword } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.delete("/delete", protect, deleteAccount);
router.post("/deactivate", protect, deactivateAccount);

export default router;