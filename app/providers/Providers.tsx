'use client';
import ReduxProvider from "@/app/redux/provider";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
    >
      <SessionProvider>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}