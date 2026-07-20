import { Router } from "express";
import { createGroupExpense, getGroupExpenses, toggleSplitPaid } from "../controllers/groupExpense.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", createGroupExpense);
router.get("/:groupId", getGroupExpenses);
router.patch("/splits/:splitId/toggle-paid", toggleSplitPaid);

export default router;