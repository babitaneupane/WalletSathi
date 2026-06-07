import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../config/prisma";
import { ENV } from "../config/env";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY || "");

export const generateInsight = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        // In a real scenario, fetch transaction data to analyze
        const transactions = await prisma.transaction.findMany({ where: { userId } });
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Analyze these transactions and provide a short financial insight: ${JSON.stringify(transactions)}`;
        
        let insightSummary = "AI features require a valid GEMINI_API_KEY. Add it to .env to see real insights.";
        
        if (ENV.GEMINI_API_KEY) {
            const result = await model.generateContent(prompt);
            insightSummary = result.response.text();
        }

        const insight = await prisma.aIInsight.create({
            data: {
                summary: insightSummary,
                userId
            }
        });

        res.json(insight);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const getInsights = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const insights = await prisma.aIInsight.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        res.json(insights);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};

export const chat = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        const { message } = req.body;

        // Save user message
        await prisma.chatHistory.create({
            data: { role: "user", message, userId }
        });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        let reply = "I am currently running without a Gemini API key. Please add it to your .env to chat with me!";
        
        if (ENV.GEMINI_API_KEY) {
            const result = await model.generateContent(message);
            reply = result.response.text();
        }

        // Save AI reply
        await prisma.chatHistory.create({
            data: { role: "assistant", message: reply, userId }
        });

        const history = await prisma.chatHistory.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" }
        });

        res.json({ reply, history });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
