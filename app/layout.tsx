import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Ledger — Karthik & Likhita",
  description: "A shared finance tracker for two.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
