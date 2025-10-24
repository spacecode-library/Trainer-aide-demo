import type { Metadata } from "next";
import { Bodoni_Moda, Lato } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { StoreInitializer } from "@/components/providers/StoreInitializer";
import { Toaster } from "@/components/ui/toaster";
import { GlobalSessionTimer } from "@/components/session/GlobalSessionTimer";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bodoni",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trainer Aide Demo | Wondrous",
  description: "Standalone demo of the Trainer Aide feature for Wondrous fitness platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${lato.variable} ${bodoniModa.variable} antialiased bg-gray-50 font-sans overflow-x-hidden`}
      >
        <StoreInitializer />
        <div className="min-h-screen overflow-x-hidden pb-20 lg:pb-0">
          <Sidebar />
          <MobileNav />
          <main className="lg:ml-64 pt-14 lg:pt-0">
            {children}
          </main>
          <MobileBottomNav />
          <GlobalSessionTimer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
