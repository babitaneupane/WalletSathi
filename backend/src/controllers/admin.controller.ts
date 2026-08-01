import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        
        // Sum total income across all transactions
        const totalIncome = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { type: "INCOME" }
        });

        const totalExpense = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { type: "EXPENSE" }
        });

        res.json({
            totalUsers,
            totalIncome: totalIncome._sum.amount || 0,
            totalExpense: totalExpense._sum.amount || 0,
            platformBalance: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0)
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { transactions: true, groupMembers: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        
        // Prevent deleting oneself
        if (id === req.user?.id) {
            return res.status(400).json({ message: "You cannot delete your own admin account." });
        }

        // Must delete dependent data first or rely on cascade. 
        // For now, let's assume cascade is not set up perfectly for everything, so we might need a more robust delete later. 
        // Let's try basic delete and see if it fails due to foreign keys.
        await prisma.user.delete({
            where: { id }
        });

        res.json({ message: "User deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Cannot delete user. They may have dependent records (transactions, groups) preventing deletion." });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { role } = req.body;
        
        if (id === req.user?.id) {
            return res.status(400).json({ message: "You cannot change your own role." });
        }

        if (!["USER", "ADMIN"].includes(role)) {
            return res.status(400).json({ message: "Invalid role." });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role }
        });

        res.json({ message: "User role updated successfully", user });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
