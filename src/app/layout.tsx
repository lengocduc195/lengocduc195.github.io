import "./globals.css";
import type { ReactNode } from "react";
import Navbar from "./components/Navbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <Navbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
