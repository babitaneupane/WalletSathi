import { Router } from "express";
import { generateInsight, getInsights, chat, predictCategory, getForecast } from "../controllers/ai.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/insights", getInsights);
router.get("/forecast", getForecast);
router.post("/insights/generate", generateInsight);
router.post("/chat", chat);
router.post("/predict-category", predictCategory);

export default router;