
"use client";

import axios from "axios";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

export type MarqueeSettings = {
    id: string;
    messages: string[];
    isEnabled: boolean;
    scrollSpeed: number;
    updatedAt?: string;
};

const marqueeQueryKey = ["admin-marquee"];

const defaultSettings: MarqueeSettings = {
    id: "homepage",
    messages: [
        "FREE SHIPPING WORLDWIDE",
        "DROP 004 AVAILABLE NOW",
        "LIMITED STOCK",
    ],
    isEnabled: true,
    scrollSpeed: 45,
};

async function fetchMarquee(): Promise<MarqueeSettings> {
    const response = await axios.get("/api/admin/settings/marquee");
    return response.data.data;
}

async function saveMarquee(settings: MarqueeSettings): Promise<MarqueeSettings> {
    const response = await axios.put(
        "/api/admin/settings/marquee",
        {
            messages: settings.messages,
            isEnabled: settings.isEnabled,
            scrollSpeed: settings.scrollSpeed,
        }
    );

    return response.data.data;
}

export function useAdminMarquee() {
    return useQuery({
        queryKey: marqueeQueryKey,
        queryFn: fetchMarquee,
        staleTime: 30_000,
        retry: 1,
    });
}

export function useSaveAdminMarquee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveMarquee,

        onMutate: async (newSettings) => {
            await queryClient.cancelQueries({
                queryKey: marqueeQueryKey,
            });

            const previousSettings =
                queryClient.getQueryData<MarqueeSettings>(
                    marqueeQueryKey
                );

            queryClient.setQueryData<MarqueeSettings>(
                marqueeQueryKey,
                newSettings
            );

            return { previousSettings };
        },

        onSuccess: () => {
            toast.success("Marquee settings saved!");
        },

        onError: (error, _settings, context) => {
            if (context?.previousSettings) {
                queryClient.setQueryData(
                    marqueeQueryKey,
                    context.previousSettings
                );
            }

            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;

            toast.error(message || "Failed to save marquee settings.");
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: marqueeQueryKey,
            });
        },
    });
}
