import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const createGroupExpense = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const { title, amount, groupId, splits } = req.body;

        const groupExpense = await prisma.groupExpense.create({
            data: {
                title,
                amount,
                groupId,
                paidById: userId,
                splits: {
                    create: splits // Array of { amount: number, userId: string }
                }
            },
            include: { splits: true }
        });

        res.status(201).json(groupExpense);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const getGroupExpenses = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const groupId = req.params.groupId as string;

        const expenses = await prisma.groupExpense.findMany({
            where: { groupId },
            include: { paidBy: { select: { name: true } }, splits: { include: { user: { select: { name: true } } } } },
            orderBy: { createdAt: "desc" }
        });

        res.json(expenses);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const toggleSplitPaid = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const splitId = req.params.splitId as string;

        const split = await prisma.expenseSplit.findUnique({
            where: { id: splitId }
        });

        if (!split) {
            res.status(404).json({ message: "Split not found" });
            return;
        }

        // Toggle the isPaid status
        const updatedSplit = await prisma.expenseSplit.update({
            where: { id: splitId },
            data: { isPaid: !split.isPaid }
        });

        res.json(updatedSplit);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
