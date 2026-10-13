import { Coupon } from "@/app/components/admin_component/coupons/AdminCoupons";
import { createCoupon, deleteCoupon } from "@/lib/admin_helpers/adminCouponAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";


const couponQueryKey = ["admin-coupons"];
const publicCouponQueryKey = ["coupons"];

export const useCreateCoupon = (options: {
    onCreated: () => void;
    onErrorMessage: (message: string) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCoupon,

        onMutate: async (newCoupon) => {
            await queryClient.cancelQueries({ queryKey: couponQueryKey });

            const previousCoupons = queryClient.getQueryData<Coupon[]>(couponQueryKey);

            const optimisticCoupon: Coupon = {
                id: `temp-${Date.now()}`,
                code: newCoupon.code.trim().toUpperCase(),
                type: newCoupon.type,
                value: Number(newCoupon.value),
                minSpend: Number(newCoupon.minSpend),
                maxDiscount: newCoupon.type === "percent" && newCoupon.maxDiscount !== "" ? Number(newCoupon.maxDiscount) : null,
                newUserOnly: newCoupon.newUserOnly,
                limit: newCoupon.limit === "" ? null : Number(newCoupon.limit),
                usedCount: 0,
                expiryDate: newCoupon.expiryDate || null,
            };

            queryClient.setQueryData<Coupon[]>(couponQueryKey, (oldCoupons = []) => [optimisticCoupon, ...oldCoupons]);

            options.onCreated();

            return { previousCoupons };
        },

        onError: (error, _payload, context) => {
            if (context?.previousCoupons !== undefined) {
                queryClient.setQueryData<Coupon[]>(couponQueryKey, context.previousCoupons);

                options.onErrorMessage(error instanceof Error ? error.message : "An error occurred while creating the coupon.");
            }
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: couponQueryKey,
            });

            await queryClient.invalidateQueries({
                queryKey: publicCouponQueryKey,
            });
        }

    })
}

export function useDeleteCoupon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCoupon,

        onMutate: async (id) => {
            await queryClient.cancelQueries({
                queryKey: couponQueryKey,
            });

            const previousCoupons =
                queryClient.getQueryData<Coupon[]>(couponQueryKey);

            queryClient.setQueryData<Coupon[]>(
                couponQueryKey,
                (old = []) => old.filter((coupon) => coupon.id !== id)
            );

            return { previousCoupons };
        },

        onError: (error, _id, context) => {
            if (context?.previousCoupons !== undefined) {
                queryClient.setQueryData(
                    couponQueryKey,
                    context.previousCoupons
                );
            }
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: couponQueryKey,
            });

            await queryClient.invalidateQueries({
                queryKey: publicCouponQueryKey,
            });
        },
    });
}