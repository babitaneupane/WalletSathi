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

        res.json(budgets);
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

        const { amount, month, year, categoryId } = req.body;

        const budget = await prisma.budget.create({
            data: {
                amount,
                month,
                year,
                categoryId,
                userId,
            },
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
