import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const createSplit = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const { title, totalAmount, splits } = req.body;
        // splits: Array of { ghostName: string, amount: number }

        // Find or create 'Split' group if it doesn't exist for simplicity, or we just create a group on the fly.
        let group = await prisma.group.findFirst({ where: { name: "Shared Expenses" } });
        if (!group) {
            group = await prisma.group.create({
                data: {
                    name: "Shared Expenses",
                    inviteCode: `SE-${Math.random().toString(36).substring(7)}`,
                }
            });
        }

        const groupExpense = await prisma.groupExpense.create({
            data: {
                title,
                amount: parseFloat(totalAmount),
                paidById: userId,
                groupId: group.id,
                splits: {
                    create: splits.map((s: any) => ({
                        amount: parseFloat(s.amount),
                        ghostName: s.ghostName,
                        // if ghostName is 'Me', attach userId
                        userId: s.ghostName === 'Me' ? userId : null
                    }))
                }
            },
            include: { splits: true }
        });

        // Add expense transaction for the user
        let category = await prisma.category.findFirst({ 
            where: { 
                name: 'Shared Expense',
                OR: [{ userId: null }, { userId }]
            } 
        });
        if (!category) {
            category = await prisma.category.create({ data: { name: 'Shared Expense', userId } });
        }

        // Deduct only user's share or full amount? The user paid the full amount.
        await prisma.transaction.create({
            data: {
                amount: parseFloat(totalAmount),
                description: `Paid for ${title}`,
                type: 'EXPENSE',
                categoryId: category.id,
                userId
            }
        });

        res.status(201).json(groupExpense);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const getSplits = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const expenses = await prisma.groupExpense.findMany({
            where: { paidById: userId },
            include: { splits: true, group: true },
            orderBy: { createdAt: "desc" }
        });

        res.json(expenses);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
