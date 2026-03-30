'use client';
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function ThemeConnector() {
    const { theme } = useTheme();

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme ?? "dark");
    }, [theme]);

    return null;
}
