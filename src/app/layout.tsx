import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Duc Le | Personal Portfolio",
  description: "Welcome to my personal portfolio showcasing my projects, publications, and professional journey.",
  keywords: ["portfolio", "developer", "projects", "publications", "personal website"],
  authors: [{ name: "Duc Le" }],
  openGraph: {
    title: "Duc Le | Personal Portfolio",
    description: "Welcome to my personal portfolio showcasing my projects, publications, and professional journey.",
    url: "https://your-domain.com",
    siteName: "Duc Le Portfolio",
    locale: "en_US",
    type: "website",
  },
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
        <GoogleAnalytics />
        <Analytics />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
