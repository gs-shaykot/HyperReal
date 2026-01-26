"use client";

import { useSelector } from "react-redux";

export default function ThemeBackground() {

    const themeMode = useSelector((state: any) => state.themeToggle.mode);

    return (
        <div
            className={`fixed inset-0 -z-10 transition-colors duration-300 ${themeMode === "light" ? "bg-main" : "bg-white"}`}
        />
    );
}
