import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getSavingsGoals = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const goals = await prisma.savingsGoal.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        res.json(goals);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const createSavingsGoal = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const { name, targetAmount, currentAmount } = req.body;

        const goal = await prisma.savingsGoal.create({
            data: {
                name,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount || 0),
                userId,
            },
        });

        res.status(201).json(goal);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const updateSavingsGoal = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const goal = await prisma.savingsGoal.findUnique({ where: { id } });
        if (!goal || goal.userId !== userId) {
            res.status(404).json({ message: "Goal not found" });
            return;
        }

        const { name, targetAmount, currentAmount } = req.body;

        const updated = await prisma.savingsGoal.update({
            where: { id },
            data: {
                name: name !== undefined ? name : goal.name,
                targetAmount: targetAmount !== undefined ? parseFloat(targetAmount) : goal.targetAmount,
                currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : goal.currentAmount,
            },
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const deleteSavingsGoal = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const goal = await prisma.savingsGoal.findUnique({ where: { id } });
        if (!goal || goal.userId !== userId) {
            res.status(404).json({ message: "Goal not found" });
            return;
        }

        await prisma.savingsGoal.delete({ where: { id } });
        res.json({ message: "Goal deleted" });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
