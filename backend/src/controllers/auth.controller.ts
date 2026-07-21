import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { ENV } from "../config/env";

const generateToken = (id: string, email: string) => {
    return jwt.sign({ id, email }, ENV.JWT_SECRET, {
        expiresIn: "30d",
    });
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ message: "Please provide all required fields" });
            return;
        }

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id, user.email),
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id, user.email),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        // req.user is set in the auth middleware
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        // Delete in FK-safe order: children first, then user
        await prisma.chatHistory.deleteMany({ where: { userId } });
        await prisma.aIInsight.deleteMany({ where: { userId } });
        await prisma.expenseSplit.deleteMany({ where: { userId } });
        await prisma.groupExpense.deleteMany({ where: { paidById: userId } });
        await prisma.groupMember.deleteMany({ where: { userId } });
        await prisma.rentBill.deleteMany({ where: { userId } });
        await prisma.tenant.deleteMany({ where: { userId } });
        await prisma.savingsGoal.deleteMany({ where: { userId } });
        await prisma.transaction.deleteMany({ where: { userId } });
        await prisma.budget.deleteMany({ where: { userId } });
        await prisma.category.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });

        res.json({ message: "Account permanently deleted." });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const deactivateAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        // Wipe all data but keep the user account intact
        await prisma.chatHistory.deleteMany({ where: { userId } });
        await prisma.aIInsight.deleteMany({ where: { userId } });
        await prisma.expenseSplit.deleteMany({ where: { userId } });
        await prisma.groupExpense.deleteMany({ where: { paidById: userId } });
        await prisma.groupMember.deleteMany({ where: { userId } });
        await prisma.rentBill.deleteMany({ where: { userId } });
        await prisma.tenant.deleteMany({ where: { userId } });
        await prisma.savingsGoal.deleteMany({ where: { userId } });
        await prisma.transaction.deleteMany({ where: { userId } });
        await prisma.budget.deleteMany({ where: { userId } });
        await prisma.category.deleteMany({ where: { userId } });

        res.json({ message: "Account deactivated. All data has been cleared." });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

