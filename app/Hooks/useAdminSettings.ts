
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export type StoreSettings = {
    id: string;
    storeName: string;
    supportEmail: string;
    showMarquee: boolean;
    marqueeMessages: string[];
    marqueeScrollSpeed: number;
    showUpcomingRelease: boolean;
    releaseNameLine1: string;
    releaseNameLine2: string;
    releaseVersion: string;
    releaseDescription: string;
    releaseCountdownEnds: string | null;
    releaseButtonLabel: string;
};

export type OperationalCountry = {
    id: string;
    name: string;
    code: string;
    currencyCode: string;
    currencySymbol: string;
    shippingFeeUSD: number;
    freeShippingThresholdUSD: number;
    isActive: boolean;
};

const settingsKey = ["adminSettings"];
const countriesKey = ["adminOperationalCountries"];

async function readError(error: unknown) {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? "Request failed.";
    }
    return "Something went wrong.";
}

export function useAdminSettings() {
    return useQuery({
        queryKey: settingsKey,
        queryFn: async () => {
            const { data } = await axios.get("/api/admin/settings");
            return data.data as StoreSettings;
        },
    });
}

export function useSaveAdminSettings() {
    const client = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Partial<StoreSettings>) => {
            const { data } = await axios.put("/api/admin/settings", payload);
            return data.data as StoreSettings;
        },
        onSuccess: (settings) => {
            client.setQueryData(settingsKey, settings);
            toast.success("Settings saved successfully.");
        },
        onError: async (error) => {
            toast.error(await readError(error));
        },
        onSettled: () => {
            client.invalidateQueries({ queryKey: settingsKey });
        },
    });
}

export function useOperationalCountries() {
    return useQuery({
        queryKey: countriesKey,
        queryFn: async () => {
            const { data } = await axios.get("/api/admin/settings/countries");
            return data.data as OperationalCountry[];
        },
    });
}

export function useExchangeRates() {
    return useQuery({
        queryKey: ["exchangeRates"],
        queryFn: async () => {
            const { data } = await axios.get(
                "https://open.er-api.com/v6/latest/USD"
            );

            if (data.result !== "success" || !data.rates) {
                throw new Error("Exchange-rate service is unavailable.");
            }

            return data.rates as Record<string, number>;
        },
        staleTime: 1000 * 60 * 60,
        refetchInterval: 1000 * 60 * 60 * 24,
    });
}

export function useSaveCountry() {
    const client = useQueryClient();

    return useMutation({
        mutationFn: async (
            payload: Partial<OperationalCountry> & { id?: string }
        ) => {
            const { data } = payload.id
                ? await axios.put("/api/admin/settings/countries", payload)
                : await axios.post("/api/admin/settings/countries", payload);

            return data.data as OperationalCountry;
        },
        onSuccess: (_country, variables) => {
            toast.success(variables.id ? "Country updated." : "Country added.");
        },
        onError: async (error) => {
            toast.error(await readError(error));
        },
        onSettled: () => {
            client.invalidateQueries({ queryKey: countriesKey });
        },
    });
}

export function useDeleteCountry() {
    const client = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await axios.delete("/api/admin/settings/countries", {
                data: { id },
            });
        },
        onSuccess: () => toast.success("Country deleted."),
        onError: async (error) => toast.error(await readError(error)),
        onSettled: () => {
            client.invalidateQueries({ queryKey: countriesKey });
        },
    });
}
