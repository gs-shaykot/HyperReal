'use client';

import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function ThemeConnector() {
    const theme = useSelector((state: any) => state.themeToggle.mode);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return null;
}
