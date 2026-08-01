import express from "express";
import { getDashboardStats, getAllUsers, deleteUser, updateUserRole } from "../controllers/admin.controller";
import { protect, isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.use(protect, isAdmin);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", updateUserRole);

export default router;
