import { Request, Response } from "express";
import { prisma } from "../config/prisma";

// Get all global categories + user's custom categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const categories = await prisma.category.findMany({
            where: {
                OR: [
                    { userId: null },
                    { userId: userId }
                ]
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

// Create a new custom category for the user
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { name, icon } = req.body;

        if (!name || typeof name !== "string") {
            res.status(400).json({ message: "Category name is required" });
            return;
        }

        // Check if category already exists globally or for this user
        const existingCategory = await prisma.category.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive' // case-insensitive check
                },
                OR: [
                    { userId: null },
                    { userId: userId }
                ]
            }
        });

        if (existingCategory) {
            res.status(400).json({ message: "Category already exists" });
            return;
        }

        const category = await prisma.category.create({
            data: {
                name,
                icon,
                userId
            }
        });

        res.status(201).json(category);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

// Optional: Delete a custom category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const id = req.params.id as string;

        const category = await prisma.category.findUnique({
            where: { id }
        });

        if (!category || category.userId !== userId) {
            res.status(404).json({ message: "Category not found or cannot be deleted" });
            return;
        }

        // Check if category is used in any transactions
        const transactionCount = await prisma.transaction.count({
            where: { categoryId: id }
        });

        if (transactionCount > 0) {
            res.status(400).json({ message: "Cannot delete category because it is used in transactions" });
            return;
        }

        await prisma.category.delete({
            where: { id }
        });

        res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
