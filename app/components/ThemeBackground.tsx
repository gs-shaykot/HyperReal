"use client"; 
import { useTheme } from "next-themes"; 
export default function ThemeBackground() {

    const { theme, setTheme } = useTheme();


    return (
        <div
            className={`fixed inset-0 -z-10 transition-colors duration-300 ${theme === "dark" ? "bg-main" : "bg-white"}`}
        />
    );
}
