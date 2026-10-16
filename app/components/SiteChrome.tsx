"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "@/app/components/navbar";
import Footer from "@/app/components/Footer";
import StorefrontMarquee from "@/app/components/StorefrontMarquee";

export default function SiteChrome({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();

    const isAdminRoute =
        pathname === "/admin" || pathname.startsWith("/admin/");

    if (isAdminRoute) {
        return children;
    }

    return (
        <>
            <StorefrontMarquee />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
