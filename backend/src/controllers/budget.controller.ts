import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getBudgets = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const budgets = await prisma.budget.findMany({
            where: { userId },
            include: { category: true },
        });

        // For each budget, calculate how much was actually spent in that category/month/year
        const budgetsWithSpent = await Promise.all(
            budgets.map(async (budget) => {
                const startDate = new Date(budget.year, budget.month - 1, 1);
                const endDate = new Date(budget.year, budget.month, 1);

                const transactions = await prisma.transaction.findMany({
                    where: {
                        userId,
                        categoryId: budget.categoryId,
                        type: "EXPENSE",
                        createdAt: { gte: startDate, lt: endDate },
                    },
                });

                const spent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
                return { ...budget, spent };
            })
        );

        res.json(budgetsWithSpent);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const createBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const { amount, month, year, categoryId, categoryName } = req.body;

        // Support both categoryId (legacy) and categoryName (new frontend)
        let resolvedCategoryId = categoryId;
        if (!resolvedCategoryId && categoryName) {
            let category = await prisma.category.findFirst({ where: { name: categoryName, userId } });
            if (!category) {
                category = await prisma.category.create({ data: { name: categoryName, userId } });
            }
            resolvedCategoryId = category.id;
        }

        const budget = await prisma.budget.create({
            data: {
                amount: parseFloat(String(amount)),
                month: parseInt(String(month)),
                year: parseInt(String(year)),
                categoryId: resolvedCategoryId,
                userId,
            },
            include: { category: true }
        });

        res.status(201).json(budget);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const deleteBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;

        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const budget = await prisma.budget.findUnique({ where: { id } });

        if (!budget || budget.userId !== userId) {
            res.status(404).json({ message: "Budget not found or not authorized" });
            return;
        }

        await prisma.budget.delete({ where: { id } });
        res.json({ message: "Budget removed" });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
