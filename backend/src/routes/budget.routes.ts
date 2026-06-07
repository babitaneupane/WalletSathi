import { Router } from "express";
import { getBudgets, createBudget, deleteBudget } from "../controllers/budget.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.route("/")
    .get(getBudgets)
    .post(createBudget);

router.route("/:id")
    .delete(deleteBudget);

export default router;