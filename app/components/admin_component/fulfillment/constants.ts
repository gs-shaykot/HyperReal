import type { FulfillmentStats, FulfillmentTab } from "./types";
export const TABS: { label: string; value: FulfillmentTab }[] = [{ label: "ALL", value: "ALL" }, { label: "READY TO PACK", value: "READY_TO_PACK" }, { label: "PACKING", value: "PACKING" }, { label: "PACKED", value: "PACKED" }, { label: "SHIPPED / IN DELIVERY", value: "DISPATCHED" }];
export const EMPTY_STATS: FulfillmentStats = { readyToPack: 0, packing: 0, packed: 0, awaitingDispatch: 0, outForDelivery: 0, delivered: 0, failed: 0, ordersByStatus: [] };
export const BUTTON = "inline-flex items-center justify-center gap-2 border border-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-wide transition hover:border-second hover:text-second disabled:cursor-not-allowed disabled:opacity-40";
export const LIME_BUTTON = "inline-flex items-center justify-center gap-2 border border-second bg-second px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-[#d9ff33] disabled:cursor-not-allowed disabled:opacity-40";
export const INPUT = "h-9 w-full border border-zinc-800 bg-[#0d0d0d] px-3 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-second";
