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
        
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
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

        // Fetch user's transactions with full context
        const transactions = await prisma.transaction.findMany({ 
            where: { userId },
            include: { category: true },
            orderBy: { createdAt: "desc" }
        });

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        let reply = "I am currently running without a Gemini API key. Please add it to your .env to chat with me!";
        
        if (ENV.GEMINI_API_KEY) {
            // Compute summary stats for richer context
            const totalIncome = transactions
                .filter(t => t.type === "INCOME")
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const totalExpense = transactions
                .filter(t => t.type === "EXPENSE")
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const netBalance = totalIncome - totalExpense;

            // Category breakdown for expenses
            const categoryBreakdown: Record<string, number> = {};
            transactions
                .filter(t => t.type === "EXPENSE")
                .forEach(t => {
                    const cat = t.category?.name || "Uncategorized";
                    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + Number(t.amount);
                });

            // Recent 10 transactions for quick reference
            const recent = transactions.slice(0, 10).map(t => ({
                date: t.createdAt,
                type: t.type,
                amount: Number(t.amount),
                description: t.description,
                category: t.category?.name || "Uncategorized"
            }));

            const systemPrompt = `You are WalletSathi AI, a smart and friendly personal finance assistant. 
You have access to the user's complete financial data. Answer questions accurately using ONLY their actual data below.

=== USER FINANCIAL SUMMARY ===
- Total Income: ${totalIncome.toFixed(2)}
- Total Expenses: ${totalExpense.toFixed(2)}
- Net Balance: ${netBalance.toFixed(2)}
- Total Transactions: ${transactions.length}

=== EXPENSE BREAKDOWN BY CATEGORY ===
${Object.entries(categoryBreakdown).map(([cat, amt]) => `- ${cat}: ${amt.toFixed(2)}`).join("\n")}

=== RECENT TRANSACTIONS (last 10) ===
${JSON.stringify(recent, null, 2)}

=== FULL TRANSACTION HISTORY ===
${JSON.stringify(transactions.map(t => ({
    date: t.createdAt,
    type: t.type,
    amount: Number(t.amount),
    description: t.description,
    category: t.category?.name || "Uncategorized"
})), null, 2)}

=== USER QUESTION ===
${message}

Instructions:
- Answer ONLY based on the actual data provided above.
- Be specific: use real numbers, real category names, real dates from the data.
- If the user asks about spending in a category, sum up the relevant transactions.
- If the user asks for trends, analyze patterns across dates.
- Provide actionable advice where appropriate.
- Keep responses concise but informative. Use bullet points when listing multiple items.
- If there is no data for what they asked, say so honestly.`;

            const result = await model.generateContent(systemPrompt);
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

export const predictCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { description, type } = req.body;
        if (!description) {
            res.json({ category: "Other" });
            return;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const systemPrompt = `You are a transaction categorizer for a personal finance app.
Classify the following transaction description into exactly ONE category name.
The transaction type is: ${type || 'EXPENSE'}
Output ONLY the category name. Do not output any other text, reasoning, or markdown.
Examples for EXPENSE: Food & Dining, Transport, Utilities, Shopping, Entertainment, Rent, Bills, Groceries, Healthcare.
Examples for INCOME: Salary, Freelance, Investment, Initial balance, Bonus, Rent Income.

Transaction description: "${description}"`;

        let category = type === "INCOME" ? "Salary" : "Food & Dining";

        if (ENV.GEMINI_API_KEY) {
            const result = await model.generateContent(systemPrompt);
            const text = result.response.text().trim();
            // Clean up common AI responses if it adds extra text
            category = text.split('\n')[0].replace(/["']/g, '');
        }

        res.json({ category });
    } catch (error: any) {
        console.error("AI Categorization error:", error.message);
        res.json({ category: "Other" });
    }
};

export const getForecast = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) return;

        // Fetch user's transactions from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const transactions = await prisma.transaction.findMany({ 
            where: { 
                userId,
                createdAt: {
                    gte: thirtyDaysAgo
                }
            },
            include: { category: true }
        });

        const totalIncome = transactions
            .filter(t => t.type === "INCOME")
            .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const totalExpense = transactions
            .filter(t => t.type === "EXPENSE")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        
        let forecastData = {
            projectedIncome: totalIncome,
            projectedExpense: totalExpense,
            explanation: "I am currently running without a Gemini API key. Please add it to your .env to see actual AI forecasts based on your data. The figures shown are simply your totals from the last 30 days."
        };

        if (ENV.GEMINI_API_KEY) {
            const systemPrompt = `You are a financial AI forecaster.
Analyze the user's spending from the last 30 days and predict next month's income and expenses.
Last 30 days total income: ${totalIncome}
Last 30 days total expenses: ${totalExpense}
Transactions: ${JSON.stringify(transactions.map(t => ({ amount: Number(t.amount), type: t.type, category: t.category?.name, date: t.createdAt })))}

Respond with ONLY a JSON object in this exact format:
{
  "projectedIncome": 1000,
  "projectedExpense": 500,
  "explanation": "A short, helpful explanation of why you predicted these numbers based on their spending trends."
}
Do not include markdown blocks, just the JSON string.`;

            const result = await model.generateContent(systemPrompt);
            const text = result.response.text().trim();
            
            try {
                const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
                forecastData = JSON.parse(cleanedText);
            } catch (err) {
                console.error("Failed to parse forecast JSON", err, text);
                forecastData.explanation = "AI generated a forecast but failed to format it correctly.";
            }
        }

        res.json(forecastData);
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Server error" });
    }
};
