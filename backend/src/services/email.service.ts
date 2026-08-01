import nodemailer from "nodemailer";
import dns from "dns";
import { ENV } from "../config/env";

// Force Node.js to use IPv4 first. Render sometimes fails to route IPv6 connections (ENETUNREACH).
dns.setDefaultResultOrder("ipv4first");

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
    if (transporter) return transporter;

    if (ENV.SMTP_HOST && ENV.SMTP_USER && ENV.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: ENV.SMTP_HOST,
            port: ENV.SMTP_PORT,
            secure: ENV.SMTP_PORT === 465, // true for port 465, false for other ports (like 587)
            auth: {
                user: ENV.SMTP_USER,
                pass: ENV.SMTP_PASS,
            },
        });
        console.log("SMTP Transporter configured successfully.");
    } else {
        console.log("No SMTP credentials found in .env. Creating test SMTP account via Ethereal Email...");
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log(`Test SMTP Transporter created using Ethereal.`);
            console.log(`Ethereal user: ${testAccount.user}`);
        } catch (err) {
            console.error("Failed to create test Ethereal account, falling back to console-only logger:", err);
            // Fallback to console mock logger
            transporter = {
                sendMail: async (mailOptions: any) => {
                    console.log("---------------- MOCK EMAIL ----------------");
                    console.log(`From: ${mailOptions.from}`);
                    console.log(`To: ${mailOptions.to}`);
                    console.log(`Subject: ${mailOptions.subject}`);
                    console.log(`Body: ${mailOptions.text}`);
                    console.log("--------------------------------------------");
                    return { messageId: "mock-id-" + Math.random() };
                }
            } as any;
        }
    }
    return transporter!;
}

export async function sendOtpEmail(email: string, code: string, type: "REGISTER" | "RESET_PASSWORD"): Promise<string | null> {
    const isRegister = type === "REGISTER";
    const subject = isRegister
        ? "Verify Your Email - WalletSathi"
        : "Reset Your Password - WalletSathi";

    const htmlContent = `
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #0F172A; color: #F1F5F9; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1E293B;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #06B6D4; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.025em;">WalletSathi</h1>
                <p style="color: #64748B; font-size: 14px; margin-top: 5px;">Your Autonomous Financial Assistant</p>
            </div>
            <div style="background-color: #1E293B; border-radius: 8px; padding: 30px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                <h2 style="color: #FFFFFF; font-size: 20px; margin-top: 0; font-weight: 700;">${isRegister ? 'Confirm Email Address' : 'Reset Your Password'}</h2>
                <p style="color: #94A3B8; font-size: 15px; line-height: 1.5; margin-bottom: 25px;">
                    ${isRegister
            ? 'Thank you for choosing WalletSathi! Please use the verification code below to complete your registration.'
            : 'You requested to reset your password. Use the verification code below to choose a new password.'}
                </p>
                <div style="background-color: #0F172A; border: 1px solid #06B6D4; border-radius: 8px; padding: 15px 30px; display: inline-block; letter-spacing: 6px; font-size: 32px; font-weight: 800; color: #06B6D4; margin-bottom: 25px;">
                    ${code}
                </div>
                <p style="color: #64748B; font-size: 12px; margin: 0; line-height: 1.4;">
                    This code is valid for 10 minutes. If you did not make this request, you can safely ignore this email.
                </p>
            </div>
            <div style="text-align: center; margin-top: 30px; color: #475569; font-size: 12px;">
                &copy; 2026 WalletSathi. All rights reserved.
            </div>
        </div>
    `;

    const textContent = isRegister
        ? `Welcome to WalletSathi! Use verification code ${code} to verify your email address. It is valid for 10 minutes.`
        : `We received a request to reset your password on WalletSathi. Use verification code ${code} to reset it. It is valid for 10 minutes.`;

    const transport = await getTransporter();
    const mailOptions = {
        from: ENV.SMTP_FROM,
        to: email,
        subject,
        text: textContent,
        html: htmlContent,
    };

    const info = await transport.sendMail(mailOptions);
    let previewUrl: string | null = null;

    // Ethereal helper to show link
    if (nodemailer.getTestMessageUrl && info) {
        previewUrl = nodemailer.getTestMessageUrl(info) || null;
        if (previewUrl) {
            console.log("-----------------------------------------");
            console.log(`[Ethereal Email Sent] Preview URL: ${previewUrl}`);
            console.log(`Verification Code (OTP): ${code}`);
            console.log("-----------------------------------------");
        }
    }
    return previewUrl;
}
