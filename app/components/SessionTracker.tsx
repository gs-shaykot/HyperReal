import { useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

// okay implement the React Query
export default function SessionTracker() {
    const { status, update } = useSession();
    const queryClient = useQueryClient();

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

                    return;
                }

                queryClient.invalidateQueries({
                    queryKey: ["sessions"],
                });
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
    }, [status, update, queryClient]);

    return null;
}