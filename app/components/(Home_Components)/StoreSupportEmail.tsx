"use client";

import { useEffect, useState } from "react";

export default function StoreSupportEmail() {
    const [email, setEmail] = useState("support@hyperreal.store");

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/store-settings", {
            signal: controller.signal,
            cache: "no-store",
        })
            .then((response) => {
                if (!response.ok) throw new Error("Settings unavailable");
                return response.json();
            })
            .then((data) => {
                if (typeof data.supportEmail === "string" && data.supportEmail) {
                    setEmail(data.supportEmail);
                }
            })
            .catch((error: unknown) => {
                if (error instanceof Error && error.name === "AbortError") return;
                console.error("Unable to load support email:", error);
            });

        return () => controller.abort();
    }, []);

    return (
        <a
            href={`mailto:${email}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
            {email}
        </a>
    );
}
