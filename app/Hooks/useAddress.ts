import { AddressType } from "@/app/types/AddressType";
import { addAddress, makePrimaryAddress } from "@/lib/addressApi";
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

export const useMakePrimary = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: makePrimaryAddress,
        onMutate: async (selectedId: string) => {
            await queryClient.cancelQueries({ queryKey: ["address"] });
            const previousAddresses = queryClient.getQueryData<AddressType[]>(["address"])

            queryClient.setQueryData<AddressType[]>(
                ["address"],
                (old: AddressType[] = []) => {
                    return old.map(address => ({
                        ...address,
                        isDefault: address.id === selectedId
                    }));
                }
            )
            return { previousAddresses };
        },
        onError: (_, __, context) => {

            queryClient.setQueryData(
                ["address"],
                context?.previousAddresses
            );

            toast.error("Failed to update address.");
        },

        onSuccess: () => {
            toast.success("Primary address updated.");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["address"]
            });
        }
    });
};