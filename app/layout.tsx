import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMS Change Request Tracker",
  description: "Role-based CMS change request tool for managed service providers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="sidebar-initial-width" strategy="beforeInteractive">
          {`(function(){try{var k='app.sidebar.expanded';var v=localStorage.getItem(k);var e=(v==='1'||v===null);var w=e?240:64;document.documentElement.style.setProperty('--sidebar-width-initial',w+'px');document.documentElement.dataset.sidebarExpanded=e?'1':'0';}catch(e){}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
