import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hack Nation AI · Genomic AST",
  description:
    "E. coli ciprofloxacin genomic antimicrobial susceptibility testing dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
