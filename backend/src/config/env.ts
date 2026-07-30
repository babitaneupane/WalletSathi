import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    PORT: process.env.PORT || 5000,
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    NODE_ENV: process.env.NODE_ENV || "development",
    SMTP_HOST: process.env.SMTP_HOST || "",
    SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASS: process.env.SMTP_PASS || "",
    SMTP_FROM: process.env.SMTP_FROM || '"WalletSathi" <noreply@walletsathi.com>',
};