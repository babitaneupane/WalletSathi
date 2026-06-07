import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FinFlow | Autonomous Financial Management",
  description: "AI-powered expense manager and financial planner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f8f9fc] font-sans text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
