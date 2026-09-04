import { ActiveSession } from "@/app/(Routes)/account/settings/ActiveSessionsModal";
import { signoutSession } from "@/lib/signoutSession";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useSessionQuery = () => {
    const queryClient = useQueryClient();

    const signoutMutation = useMutation({
        mutationKey: ["signoutSession"],
        mutationFn: signoutSession,
        onMutate: async (sessionId) => {
            await queryClient.cancelQueries({ queryKey: ["sessions"] });

            const previousSessions = queryClient.getQueryData(["sessions"]);

            queryClient.setQueryData(
                ["sessions"],
                (old: ActiveSession[] = []) => {
                    return old.filter(session => session.id !== sessionId);
                }
            )
            return { previousSessions };
        },
        onError: (_, __, context) => {
            queryClient.setQueryData(
                ["sessions"],
                context?.previousSessions
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sessions"] });
            toast.success("Session signed out successfully.");
        }
    });
    return signoutMutation;
}

