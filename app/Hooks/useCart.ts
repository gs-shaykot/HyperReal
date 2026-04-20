import { CartItemType } from "@/app/types/cartType";
import { addToCartApi } from "@/lib/cartAPIs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCart = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: addToCartApi,
        onMutate: async (newItem) => { 

            await queryClient.cancelQueries({ queryKey: ["cart"] });
            
            const previousCartItem = queryClient.getQueryData<CartItemType[]>(["cart"]) ?? [];

            queryClient.setQueryData(["cart"], (old: CartItemType[] = []) => {
                const safeOld = Array.isArray(old) ? old : [];
                const existingItem = safeOld.find((item) => item.variantId === newItem.variantId);

                if (existingItem) {
                    return safeOld.map((item) => item.variantId === newItem.variantId ? { ...item, quantity: item.quantity + newItem.quantity } : item);
                }
                return [...safeOld, newItem];
            });

            return { previousCartItem };
        },

        onError: (err, newItem, context) => {
            if (context?.previousCartItem) {
                queryClient.setQueryData(["cart"], context.previousCartItem);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        }
    });

    return mutation;
}
