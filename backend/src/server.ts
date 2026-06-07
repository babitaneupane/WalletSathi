import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ENV } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";

// Routes
import authRoutes from "./routes/auth.routes";
import transactionRoutes from "./routes/transaction.routes";
import budgetRoutes from "./routes/budget.routes";
import groupRoutes from "./routes/group.routes";
import groupExpenseRoutes from "./routes/groupExpense.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import aiRoutes from "./routes/ai.routes";
import rentRoutes from "./routes/rent.routes";
import splitRoutes from "./routes/split.routes";
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/", (req, res) => res.json({ message: "FinFlow API running" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/group-expenses", groupExpenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/rent", rentRoutes);
app.use("/api/split", splitRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
});