"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function SessionTracker() {
    const { status } = useSession();

    const hasTracked = useRef(false);

    useEffect(() => {
        if (
            status !== "authenticated" ||
            hasTracked.current
        ) {
            return;
        }

        hasTracked.current = true;

        fetch("/api/account/sessions", {
            method: "POST",
            credentials: "include",
        }).catch((error) => {
            console.error(
                "Failed to save session information:",
                error
            );
        });
    }, [status]);

    return null;
}