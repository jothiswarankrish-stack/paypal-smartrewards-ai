import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayPal SmartRewards AI",
  description: "AI-Powered Personalized Rewards & Payment Platform",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SmartRewards",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#003087",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#E8ECF0] text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
