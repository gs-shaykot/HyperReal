import { Coupon } from "@/app/components/admin_component/coupons/AdminCoupons";
import { createCoupon, deleteCoupon } from "@/lib/admin_helpers/adminCouponAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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

            return { previousCoupons };
        },

        onSuccess: () => {
            toast.success("Coupon created successfully!");
            options.onCreated();
        },

        onError: (error, _payload, context) => {
            if (context?.previousCoupons !== undefined) {
                queryClient.setQueryData<Coupon[]>(couponQueryKey, context.previousCoupons
                );
            }

            const message =
                error instanceof Error ? error.message : "Failed to create coupon.";

            toast.error(message);
            options.onErrorMessage(message);
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

        onSuccess: () => {
            toast.success("Coupon deleted successfully!");
        },

        onError: (error, _id, context) => {
            if (context?.previousCoupons !== undefined) {
                queryClient.setQueryData<Coupon[]>(couponQueryKey, context.previousCoupons);
            }

            const message =
                error instanceof Error ? error.message : "Failed to delete coupon.";

            toast.error(message);
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