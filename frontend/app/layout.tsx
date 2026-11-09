import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayPal SmartRewards AI | Personalized Coupon Recommendation & Sandbox Payments",
  description: "AI-Powered Personalized Coupon Recommendation & Payment Engagement Platform for PayPal AI Hackathon 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
