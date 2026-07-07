import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getTenants = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const tenants = await prisma.tenant.findMany({
            where: { userId },
            include: { bills: true },
        });

        res.json(tenants);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const addTenant = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const { name, roomOrProperty } = req.body;

        const tenant = await prisma.tenant.create({
            data: { name, roomOrProperty, userId }
        });

        res.status(201).json(tenant);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const createBill = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const { title, amount, tenantId } = req.body;

        const bill = await prisma.rentBill.create({
            data: {
                title,
                amount: parseFloat(amount),
                tenantId,
                userId
            }
        });

        res.status(201).json(bill);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const payBill = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const id = req.params.id as string;

        const bill = await prisma.rentBill.findUnique({ where: { id }, include: { tenant: true } });
        if (!bill || bill.userId !== userId) {
            res.status(404).json({ message: "Bill not found" });
            return;
        }

        if (bill.status === 'PAID') {
            res.status(400).json({ message: "Bill already paid" });
            return;
        }

        const updatedBill = await prisma.rentBill.update({
            where: { id },
            data: { status: 'PAID' }
        });

        // Automatically create an income transaction
        // First find or create 'Rent Income' category
        let category = await prisma.category.findFirst({ 
            where: { 
                name: 'Rent Income',
                OR: [{ userId: null }, { userId }]
            } 
        });
        if (!category) {
            category = await prisma.category.create({ data: { name: 'Rent Income', userId } });
        }

        await prisma.transaction.create({
            data: {
                amount: bill.amount,
                description: `${bill.title} from ${bill.tenant.name}`,
                type: 'INCOME',
                categoryId: category.id,
                userId
            }
        });

        res.json(updatedBill);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const deleteTenant = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const id = req.params.id as string;

        const tenant = await prisma.tenant.findUnique({ where: { id } });
        if (!tenant || tenant.userId !== userId) {
            res.status(404).json({ message: "Tenant not found" });
            return;
        }

        // Delete all bills first
        await prisma.rentBill.deleteMany({ where: { tenantId: id } });
        await prisma.tenant.delete({ where: { id } });

        res.json({ message: "Tenant deleted" });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

