import { ProfileEdit } from "@/lib/profileApi";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast";

export const useProfile = () => {
    const queryClient = useQueryClient();

    const updateProfileMutation = useMutation({
        mutationFn: ProfileEdit,
        onMutate: async (newProfile) => {
            await queryClient.cancelQueries({ queryKey: ["profile"] });
            const previousProfile = queryClient.getQueryData(["profile"]);

            queryClient.setQueryData(
                ["profile"],
                (old: any) => ({
                    ...old,
                    ...newProfile,
                })
            )
            return { previousProfile };
        },
        onError: (_, __, context) => {
            queryClient.setQueryData(["profile"], context?.previousProfile);
            toast.error("Profile update failed. Please try again.");
        },
        onSuccess: () => {
            toast.success("Profile updated successfully.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
    });

    return updateProfileMutation;
}