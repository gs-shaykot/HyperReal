import { AddressType } from "@/app/types/AddressType";
import { addAddress } from "@/lib/addressApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useAddress = () => {
    const queryClient = useQueryClient();

    const addressMutation = useMutation({
        mutationKey: ["address"],
        mutationFn: addAddress,
        onMutate: async (newAddress) => {
            console.log("Adding new address: ", newAddress);
            await queryClient.cancelQueries({ queryKey: ['address'] });

            const previousAddress = queryClient.getQueryData(['address']);

            queryClient.setQueryData(
                ['address'],
                (old: AddressType[] = []) => {
                    return [...old, newAddress];
                }
            )
            return { previousAddress };
        },
        onError: (error, __, context) => {
            console.log("Error occurred while adding address: ", error);
            queryClient.setQueryData(
                ['address'],
                context?.previousAddress
            );
        },
        onSuccess: () => {
            toast.success("Address added successfully.");
        }
    });
    return addressMutation;
}