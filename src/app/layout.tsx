import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import WalletProvider from "@/components/providers/WalletProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "OnchainBudget GPT",
  description: "AI budgeting assistant for onchain and offchain finances",
  keywords: ["crypto", "budget", "AI", "finance", "wallet", "DeFi"],
  authors: [{ name: "OnchainBudget Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
