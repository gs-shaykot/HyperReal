'use client';

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function ThemeConnector() {
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return null;
}
