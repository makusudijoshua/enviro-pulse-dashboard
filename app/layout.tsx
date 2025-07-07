import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EnviroPulse",
  description: `A real-time environmental monitoring dashboard built with Next.js, 
  PostgreSQL, and ESP32. Tracks temperature, humidity, and sound levels with dynamic 
  visualizations and data filtering.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
