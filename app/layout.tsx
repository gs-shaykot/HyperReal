import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/app/components/navbar";
import Providers from "@/app/providers/Providers";
import ThemeBackground from "@/app/components/ThemeBackground";
import ThemeConnector from "@/app/components/ThemeConnector";
import CyberpunkLoader from "@/app/components/CyberpunkLoader"; 
import Footer from "@/app/components/Footer";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "HYPERREAL",
  description: "Your Trusted platform for hyperrealistic products",
};

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})
const inter = Inter({
  weight: ['400', '800'],
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceMono.variable} ${inter.variable}`}>
        <Providers>
          {/* <CyberpunkLoader />  */}
          <ThemeConnector />
          <ThemeBackground />
          <Navbar />
          <main className="relative">
            {children}
            <Toaster position="top-center" />
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}