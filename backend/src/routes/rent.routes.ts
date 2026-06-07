import { Router } from "express";
import { getTenants, addTenant, createBill, payBill, deleteTenant } from "../controllers/rent.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/tenants", getTenants);
router.post("/tenants", addTenant);
router.delete("/tenants/:id", deleteTenant);
router.post("/bills", createBill);
router.put("/bills/:id/pay", payBill);

export default router;
