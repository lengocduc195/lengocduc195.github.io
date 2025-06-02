import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import VisitorTrackerWrapper from "@/components/analytics/VisitorTrackerWrapper";

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
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Hide any Firebase configuration check messages
            (function() {
              // Text to hide
              const textToHide = 'Kiểm tra cấu hình Firebase';

              // Function to hide Firebase messages
              function hideFirebaseMessages() {
                // Add a class to the body
                if (document.body) {
                  document.body.classList.add('firebase-messages-hidden');
                }

                // Simple approach: hide any element containing the text
                const allElements = document.querySelectorAll('*');
                allElements.forEach(function(el) {
                  if (el.textContent && el.textContent.includes(textToHide)) {
                    el.style.display = 'none';
                  }
                });

                // Also hide elements with data attribute
                const dataElements = document.querySelectorAll('[data-firebase-config-check]');
                dataElements.forEach(function(el) {
                  el.style.display = 'none';
                });
              }

              // Run immediately if possible
              if (document.readyState !== 'loading') {
                hideFirebaseMessages();
              } else {
                document.addEventListener('DOMContentLoaded', hideFirebaseMessages);
              }

              // Also run on load
              window.addEventListener('load', hideFirebaseMessages);

              // Set up interval to keep checking
              setInterval(hideFirebaseMessages, 1000);

              // Set up MutationObserver for dynamic content
              if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver(hideFirebaseMessages);

                // Start observing when body is available
                function setupObserver() {
                  if (document.body) {
                    observer.observe(document.body, {
                      childList: true,
                      subtree: true,
                      characterData: true
                    });
                  } else {
                    setTimeout(setupObserver, 100);
                  }
                }

                setupObserver();
              }
            })();
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#0a0a0a', color: '#ededed', visibility: 'visible', display: 'block' }}
      >
        <AuthProvider>
          <AdminProvider>
            <VisitorTrackerWrapper>
              <div id="app-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: '1 1 auto' }}>
                  {children}
                </main>
                <Footer />
              </div>
            </VisitorTrackerWrapper>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
