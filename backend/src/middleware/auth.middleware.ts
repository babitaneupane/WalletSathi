import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export const protect = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: string; email: string };
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

import { prisma } from "../config/prisma";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { role: true },
        });

        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Server error checking admin privileges" });
    }
};