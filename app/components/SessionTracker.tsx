"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";

export default function SessionTracker() {
    const { status, update } = useSession();

    const hasTracked = useRef(false);

    // Save session information once
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
        })
            .catch((error) => {
                console.error(
                    "Failed to save session information:",
                    error
                );
            });
    }, [status]);

    // Check whether the current session is still valid
    useEffect(() => {
        if (status !== "authenticated") {
            return;
        }

        const checkSession = async () => {
            try {
                const result = await update();

                if (result?.sessionRevoked) {
                    await signOut({
                        callbackUrl: "/login",
                    });
                }
            } catch (error) {
                console.error(
                    "Failed to validate session:",
                    error
                );
            }
        };

        const interval = setInterval(
            checkSession,
            10 * 1000
        );

        return () => clearInterval(interval);
    }, [status, update]);

    return null;
}