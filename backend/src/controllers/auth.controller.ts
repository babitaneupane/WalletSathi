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
