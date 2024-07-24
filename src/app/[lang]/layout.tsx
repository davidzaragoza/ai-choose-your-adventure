import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Choose your story",
  description: "Create stories with different paths and choices with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>, params: {lang: string}) {
  console.log(params);

  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
