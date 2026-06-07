import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import crypto from "crypto";

export const getGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const groups = await prisma.group.findMany({
            where: { members: { some: { userId } } },
            include: { members: { include: { user: { select: { name: true, email: true } } } } },
        });

        res.json(groups);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const { name } = req.body;
        const inviteCode = crypto.randomBytes(4).toString("hex");

        const group = await prisma.group.create({
            data: {
                name,
                inviteCode,
                members: {
                    create: { userId }
                }
            },
        });

        res.status(201).json(group);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const joinGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const { inviteCode } = req.body;

        const group = await prisma.group.findUnique({ where: { inviteCode } });
        if (!group) {
            res.status(404).json({ message: "Invalid invite code" });
            return;
        }

        const existingMember = await prisma.groupMember.findFirst({
            where: { groupId: group.id, userId }
        });

        if (existingMember) {
            res.status(400).json({ message: "Already a member of this group" });
            return;
        }

        await prisma.groupMember.create({
            data: { groupId: group.id, userId }
        });

        res.status(200).json({ message: "Successfully joined the group", groupId: group.id });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
