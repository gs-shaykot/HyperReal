import { ClearWishlist } from "@/lib/wishlistAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useClearWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ClearWishlist,

        onMutate: async () => {
            await queryClient.cancelQueries({
                queryKey: ["wishlist"],
            });

            const previousWishlist =
                queryClient.getQueryData(["wishlist"]);

            queryClient.setQueryData(["wishlist"], []);

            return { previousWishlist };
        },

        onError: (_, __, context) => {
            queryClient.setQueryData(
                ["wishlist"],
                context?.previousWishlist
            );

            toast.error("Failed to clear wishlist.");
        },

        onSuccess: () => {
            toast.success("Wishlist cleared successfully.");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["wishlist"],
            });
        },
    });
};