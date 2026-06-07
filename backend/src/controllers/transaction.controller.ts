import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const transactions = await prisma.transaction.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });

        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const { amount, description, type, categoryName, groupId } = req.body;

        let categoryId = null;
        if (categoryName) {
            let category = await prisma.category.findUnique({ where: { name: categoryName } });
            if (!category) {
                category = await prisma.category.create({ data: { name: categoryName } });
            }
            categoryId = category.id;
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                description,
                type,
                categoryId: categoryId as string,
                groupId,
                userId,
            },
        });

        res.status(201).json(transaction);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;

        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const transaction = await prisma.transaction.findUnique({ where: { id } });

        if (!transaction || transaction.userId !== userId) {
            res.status(404).json({ message: "Transaction not found or not authorized" });
            return;
        }

        await prisma.transaction.delete({ where: { id } });
        res.json({ message: "Transaction removed" });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;

        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const transaction = await prisma.transaction.findUnique({ where: { id } });
        if (!transaction || transaction.userId !== userId) {
            res.status(404).json({ message: "Transaction not found or not authorized" });
            return;
        }

        const { amount, description, type, categoryName } = req.body;

        let categoryId = transaction.categoryId;
        if (categoryName) {
            let category = await prisma.category.findUnique({ where: { name: categoryName } });
            if (!category) {
                category = await prisma.category.create({ data: { name: categoryName } });
            }
            categoryId = category.id;
        }

        const updated = await prisma.transaction.update({
            where: { id },
            data: { amount: parseFloat(amount), description, type, categoryId },
            include: { category: true }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

