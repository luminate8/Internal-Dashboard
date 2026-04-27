import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LMN8 Ketamine Therapy",
  description: "AI-powered ketamine therapy assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
