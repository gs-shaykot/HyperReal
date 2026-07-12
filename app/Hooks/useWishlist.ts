import { wishlist } from "@/app/types/Product";
import { DeleteWishlist, Postwishlist } from "@/lib/wishlistAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useWishlist = () => {
    const queryClient = useQueryClient();

    const toggleWishlistMutation = useMutation({
        mutationKey: ["wishlist"],
        mutationFn: ({ productId, isWishlisted, variantId }: { productId: string; isWishlisted: boolean; variantId: string }) => {
            if (isWishlisted) {
                return DeleteWishlist({ productId });
            }
            return Postwishlist({ productId, variantId });
        },

        onMutate: async ({ productId, isWishlisted, variantId }) => {
            await queryClient.cancelQueries({ queryKey: ['wishlist'] });

            const previousWishlist = queryClient.getQueryData<wishlist[]>(['wishlist']);

            queryClient.setQueryData(
                ['wishlist'],
                (old: wishlist[] = []) => {
                    if (isWishlisted) {
                        return old.filter(item => item.productId !== productId);
                    }
                    return [...old, { productId, productVariantId: variantId }];
                }
            );

            return { previousWishlist };
        },
        onError: (error, __, context) => {
            console.log("Error occurred while toggling wishlist: ", error);

            queryClient.setQueryData(
                ['wishlist'],
                context?.previousWishlist
            );
        },

        onSuccess: (_, variables) => {
            if (variables.isWishlisted) {
                toast.success("Item removed from wishlist successfully.");
            }
            toast.success("Item added to wishlist successfully.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        }
    });

    return toggleWishlistMutation;
}
