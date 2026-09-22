import type { Metadata } from "next";
import { Inter, Space_Mono, Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers/Providers";
import ThemeBackground from "@/app/components/ThemeBackground";
import ThemeConnector from "@/app/components/ThemeConnector";
import CyberpunkLoader from "@/app/components/CyberpunkLoader";
import SiteChrome from "@/app/components/SiteChrome";
import { Toaster } from 'react-hot-toast';
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

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
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${spaceMono.variable} ${inter.variable}`}>
        <Providers>
          {/* <CyberpunkLoader />  */}
          <ThemeConnector />
          <ThemeBackground />
          <SiteChrome>
            <main className="relative">
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  className: "bg-zinc-900! text-second! light:bg-white! light:text-zinc-900! light:shadow",
                }}
              />
            </main>
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}