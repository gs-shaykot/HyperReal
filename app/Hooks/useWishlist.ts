import { Postwishlist } from "@/lib/wishlistAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useWishlist = () => {
    const queryClient = useQueryClient();

    const addToWishlistMutation = useMutation({
        mutationKey: ["wishlist"],
        mutationFn: Postwishlist,
        onMutate: async (newWishlistItem) => {
            console.log("Came for adding to wishlist: ", newWishlistItem);

            await queryClient.cancelQueries({ queryKey: ['wishlist'] });

            const previousWishlist = queryClient.getQueryData(['wishlist']);

            queryClient.setQueryData(
                ['wishlist'],
                (old: { productId: string }[] = []) => {
                    return [...old, newWishlistItem];
                }
            );

            return { previousWishlist };
        },
        onError: (error, _, context) => {
            console.error("Failed to add wishlist item:", error);
            queryClient.setQueryData(
                ['wishlist'],
                context?.previousWishlist
            );
        },
        onSuccess: () => {
            toast.success("Item added to wishlist successfully.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        }
    });

    return addToWishlistMutation;
}