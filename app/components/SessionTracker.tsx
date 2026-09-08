"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export default function SessionTracker() {
    const { status } = useSession();

    const hasTracked = useRef(false);

    // Save this browser/device session once after authentication
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