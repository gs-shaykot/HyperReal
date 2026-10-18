
"use client";

import axios from "axios";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

export type OperationalCountry = {
    id: string;
    name: string;
    code: string;
    phoneCode: string;
    currencyCode: string;
    currencySymbol: string;
    shippingFeeUSD: number;
    freeShippingThresholdUSD: number;
    currentExchangeRate: number | null;
    previousExchangeRate: number | null;
    exchangeRateDate: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CountryInput = Omit<
    OperationalCountry,
    | "id"
    | "currentExchangeRate"
    | "previousExchangeRate"
    | "exchangeRateDate"
    | "createdAt"
    | "updatedAt"
> & { id?: string };

export const countriesQueryKey = ["admin-countries"];

async function fetchCountries(): Promise<OperationalCountry[]> {
    const response = await axios.get("/api/admin/settings/countries");
    return response.data.data;
}

export function useAdminCountries() {
    return useQuery({
        queryKey: countriesQueryKey,
        queryFn: fetchCountries,
        staleTime: 30_000,
        retry: 1,
    });
}

export function useSaveCountry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (country: CountryInput) => {
            const response = country.id
                ? await axios.put("/api/admin/settings/countries", country)
                : await axios.post("/api/admin/settings/countries", country);

            return response.data.data as OperationalCountry;
        },

        onMutate: async (country) => {
            await queryClient.cancelQueries({
                queryKey: countriesQueryKey,
            });

            const previousCountries =
                queryClient.getQueryData<OperationalCountry[]>(
                    countriesQueryKey
                ) ?? [];

            if (country.id) {
                queryClient.setQueryData<OperationalCountry[]>(
                    countriesQueryKey,
                    previousCountries.map((item) =>
                        item.id === country.id
                            ? { ...item, ...country }
                            : item
                    )
                );
            } else {
                const temporaryCountry: OperationalCountry = {
                    ...country,
                    id: `temporary-${Date.now()}`,
                    currentExchangeRate: null,
                    previousExchangeRate: null,
                    exchangeRateDate: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                queryClient.setQueryData<OperationalCountry[]>(
                    countriesQueryKey,
                    [...previousCountries, temporaryCountry].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    )
                );
            }

            return { previousCountries };
        },

        onSuccess: (_country, variables) => {
            toast.success(
                variables.id ? "Country updated." : "Country added."
            );
        },

        onError: (error, _variables, context) => {
            if (context) {
                queryClient.setQueryData(
                    countriesQueryKey,
                    context.previousCountries
                );
            }

            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;

            toast.error(message || "Could not save country.");
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: countriesQueryKey,
            });
        },
    });
}

export function useToggleCountry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (country: OperationalCountry) => {
            const response = await axios.put(
                "/api/admin/settings/countries",
                country
            );

            return response.data.data as OperationalCountry;
        },

        onMutate: async (country) => {
            await queryClient.cancelQueries({
                queryKey: countriesQueryKey,
            });

            const previousCountries =
                queryClient.getQueryData<OperationalCountry[]>(
                    countriesQueryKey
                );

            queryClient.setQueryData<OperationalCountry[]>(
                countriesQueryKey,
                (current = []) =>
                    current.map((item) =>
                        item.id === country.id
                            ? { ...item, isActive: country.isActive }
                            : item
                    )
            );

            return { previousCountries };
        },

        onSuccess: () => {
            toast.success("Country status updated.");
        },

        onError: (error, _country, context) => {
            if (context?.previousCountries) {
                queryClient.setQueryData(
                    countriesQueryKey,
                    context.previousCountries
                );
            }

            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;

            toast.error(message || "Could not update country status.");
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: countriesQueryKey,
            });
        },
    });
}

export function useDeleteCountry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.delete(
                "/api/admin/settings/countries",
                { data: { id } }
            );

            return response.data;
        },

        onMutate: async (id) => {
            await queryClient.cancelQueries({
                queryKey: countriesQueryKey,
            });

            const previousCountries =
                queryClient.getQueryData<OperationalCountry[]>(
                    countriesQueryKey
                ) ?? [];

            queryClient.setQueryData<OperationalCountry[]>(
                countriesQueryKey,
                previousCountries.filter((country) => country.id !== id)
            );

            return { previousCountries };
        },

        onSuccess: () => {
            toast.success("Country deleted.");
        },

        onError: (error, _id, context) => {
            if (context) {
                queryClient.setQueryData(
                    countriesQueryKey,
                    context.previousCountries
                );
            }

            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;

            toast.error(message || "Could not delete country.");
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: countriesQueryKey,
            });
        },
    });
}
