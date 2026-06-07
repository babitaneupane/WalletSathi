import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const transactions = await prisma.transaction.findMany({
            where: { userId },
            include: { category: true }
        });

        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach(t => {
            if (t.type === "INCOME") totalIncome += t.amount;
            else totalExpenses += t.amount;
        });

        res.json({
            totalIncome,
            totalExpenses,
            totalSavings: totalIncome - totalExpenses,
            recentTransactions: transactions.slice(0, 5),
            transactions
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
