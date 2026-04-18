'use client';
import ReduxProvider from "@/app/redux/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {

  const [queryClient] = useState(() => new QueryClient());
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      enableColorScheme={false}
    >
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}