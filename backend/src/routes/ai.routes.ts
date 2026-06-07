import { Router } from "express";
import { generateInsight, getInsights, chat } from "../controllers/ai.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/insights", getInsights);
router.post("/insights/generate", generateInsight);
router.post("/chat", chat);

export default router;