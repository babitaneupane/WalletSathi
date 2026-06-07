import { Router } from "express";
import { createSplit, getSplits } from "../controllers/split.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/", getSplits);
router.post("/", createSplit);

export default router;
