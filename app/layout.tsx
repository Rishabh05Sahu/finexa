import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeInitializer from "@/components/ThemeInitializer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Finexa - AI-Powered Personal Finance Manager",
  description: "Take control of your finances with Finexa, the AI-powered personal finance manager that helps you budget, track expenses, and achieve your financial goals effortlessly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.variable} antialiased`}>
        <ThemeInitializer />
        {children}
         <Toaster richColors closeButton />
      </body>
    </html>
  );
}
