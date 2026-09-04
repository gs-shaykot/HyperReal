import { ActiveSession } from "@/app/(Routes)/account/settings/ActiveSessionsModal";
import { signoutAllSessions, signoutSession } from "@/lib/signoutSession";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type SignoutVariables =
    | {
        type: "single";
        sessionId: string;
    }
    | {
        type: "all";
    };

export const useSessionQuery = () => {
    const queryClient = useQueryClient();

    const signoutMutation = useMutation({
        mutationKey: ["sessions"],
        mutationFn: async (variables: SignoutVariables) => {
            if (variables.type === "single") {
                return signoutSession(variables.sessionId);
            }

            return signoutAllSessions();
        },

        onMutate: async (variables: SignoutVariables) => {
            await queryClient.cancelQueries({ queryKey: ["sessions"] });

            const previousSessions = queryClient.getQueryData(["sessions"]);

            // queryClient.setQueryData(
            //     ["sessions"],
            //     (old: ActiveSession[] = []) => {
            //         return old.filter(session => session.id !== sessionId);
            //     }
            // )

            queryClient.setQueryData<ActiveSession[]>(
                ["sessions"],
                (old = []) => {
                    if (variables.type === "single") {
                        return old.filter(
                            session => session.id !== variables.sessionId
                        );
                    }

                    return old.filter(
                        session => session.isCurrent
                    );
                }
            );

            return { previousSessions };
        },
        onError: (_error, _sessionId, context) => {
            queryClient.setQueryData(
                ["sessions"],
                context?.previousSessions
            );
        },
        onSuccess: (data) => {
            toast.success(
                data.message ?? "Session signed out successfully."
            );
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["sessions"],
            });
        },
    });
    return signoutMutation;
}

