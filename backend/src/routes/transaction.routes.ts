import { Router } from "express";
import { getTransactions, createTransaction, deleteTransaction, updateTransaction } from "../controllers/transaction.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect); // All transaction routes require authentication

router.route("/")
    .get(getTransactions)
    .post(createTransaction);

router.route("/:id")
    .put(updateTransaction)
    .delete(deleteTransaction);

export default router;