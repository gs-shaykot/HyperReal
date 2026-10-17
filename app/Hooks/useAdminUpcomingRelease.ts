
"use client";

import axios from "axios";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

export type UpcomingReleaseSettings = {
    id: string;
    isEnabled: boolean;
    nameLine1: string;
    nameLine2: string;
    version: string;
    description: string;
    countdownEnds: string | null;
    buttonLabel: string;
    updatedAt?: string;
};

export const DEFAULT_UPCOMING_RELEASE: UpcomingReleaseSettings = {
    id: "homepage",
    isEnabled: true,
    nameLine1: "Void",
    nameLine2: "Runner",
    version: "V3",
    description: "The next iteration of urban mobility.",
    countdownEnds: null,
    buttonLabel: "Set Reminder",
};

export const upcomingReleaseQueryKey = ["admin-upcoming-release"];

async function fetchUpcomingRelease(): Promise<UpcomingReleaseSettings> {
    const response = await axios.get(
        "/api/admin/settings/upcoming-release"
    );

    return response.data.data;
}

async function saveUpcomingRelease(
    settings: UpcomingReleaseSettings
): Promise<UpcomingReleaseSettings> {
    const response = await axios.put(
        "/api/admin/settings/upcoming-release",
        {
            isEnabled: settings.isEnabled,
            nameLine1: settings.nameLine1,
            nameLine2: settings.nameLine2,
            version: settings.version,
            description: settings.description,
            countdownEnds: settings.countdownEnds,
            buttonLabel: settings.buttonLabel,
        }
    );

    return response.data.data;
}

export function useAdminUpcomingRelease() {
    return useQuery({
        queryKey: upcomingReleaseQueryKey,
        queryFn: fetchUpcomingRelease,
        staleTime: 30_000,
        retry: 1,
    });
}

export function useSaveAdminUpcomingRelease() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveUpcomingRelease,

        onMutate: async (newSettings) => {
            await queryClient.cancelQueries({
                queryKey: upcomingReleaseQueryKey,
            });

            const previousSettings =
                queryClient.getQueryData<UpcomingReleaseSettings>(
                    upcomingReleaseQueryKey
                );

            queryClient.setQueryData<UpcomingReleaseSettings>(
                upcomingReleaseQueryKey,
                newSettings
            );

            return { previousSettings };
        },

        onSuccess: () => {
            toast.success("Upcoming release settings saved!");
        },

        onError: (error, _settings, context) => {
            if (context?.previousSettings) {
                queryClient.setQueryData(
                    upcomingReleaseQueryKey,
                    context.previousSettings
                );
            }

            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;

            toast.error(
                message || "Failed to save upcoming release settings."
            );
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: upcomingReleaseQueryKey,
            });
        },
    });
}
