import { Router } from "express";
import { createGroupExpense, getGroupExpenses } from "../controllers/groupExpense.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", createGroupExpense);
router.get("/:groupId", getGroupExpenses);

export default router;