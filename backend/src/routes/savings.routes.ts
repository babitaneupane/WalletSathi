import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { getSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from "../controllers/savings.controller";

const router = Router();

router.use(protect);

router.get("/", getSavingsGoals);
router.post("/", createSavingsGoal);
router.put("/:id", updateSavingsGoal);
router.delete("/:id", deleteSavingsGoal);

export default router;
