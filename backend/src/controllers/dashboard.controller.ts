import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const { startDate, endDate } = req.query;

        // Build optional date filter
        const dateFilter: Record<string, Date> = {};
        if (startDate && typeof startDate === "string") {
            dateFilter.gte = new Date(startDate);
        }
        if (endDate && typeof endDate === "string") {
            // Include the full end day by setting time to end of day
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.lte = end;
        }

        const whereClause: any = { userId };
        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter;
        }

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: { category: true },
            orderBy: { createdAt: "desc" }
        });

        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach(t => {
            if (t.type === "INCOME") totalIncome += t.amount;
            else totalExpenses += t.amount;
        });

        const savingsGoals = await prisma.savingsGoal.findMany({
            where: { userId }
        });

        res.json({
            totalIncome,
            totalExpenses,
            totalSavings: totalIncome - totalExpenses,
            recentTransactions: transactions.slice(0, 5),
            transactions,
            savingsGoals,
            isFiltered: Object.keys(dateFilter).length > 0,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
