'use client';

import ReduxProvider from "@/app/redux/provider";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <ReduxProvider>
        {children}
      </ReduxProvider>
    </SessionProvider>
  );
}
