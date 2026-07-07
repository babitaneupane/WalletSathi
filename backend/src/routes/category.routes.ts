import express from "express";
import { getCategories, createCategory, deleteCategory } from "../controllers/category.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.use(protect);

router.get("/", getCategories);
router.post("/", createCategory);
router.delete("/:id", deleteCategory);

export default router;
