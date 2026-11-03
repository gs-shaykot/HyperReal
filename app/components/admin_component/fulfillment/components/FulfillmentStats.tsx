"use client";
import { Activity, Package, PackageCheck, Truck } from "lucide-react";
import type { FulfillmentStats } from "../types";

const cards = [
  {
    title: "READY TO PACK",
    description: "Paid & queued",
    icon: Package,
    getValue: (stats: FulfillmentStats) => stats.readyToPack,
  },
  {
    title: "CURRENTLY PACKING",
    description: "On the bench",
    icon: Activity,
    getValue: (stats: FulfillmentStats) => stats.packing,
  },
  {
    title: "PACKED",
    description: "Boxed & labelled",
    icon: PackageCheck,
    getValue: (stats: FulfillmentStats) => stats.packed,
  },
  {
    title: "AWAITING DISPATCH",
    description: "Label printed, ready for courier",
    icon: Truck,
    getValue: (stats: FulfillmentStats) => stats.awaitingDispatch,
  },
];

export default function FulfillmentStatsCards({
  stats,
}: {
  stats: FulfillmentStats;
}) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, description, icon: Icon, getValue }) => (
        <div key={title} className="border border-zinc-800 bg-[#0d0d0d] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold tracking-[0.16em] text-zinc-400">
              {title}
            </p>
            <Icon size={15} className="text-second" />
          </div>
          <p className="mt-3 text-2xl font-black">{getValue(stats)}</p>
          <p className="mt-1 text-[10px] text-zinc-500">{description}</p>
        </div>
      ))}
    </section>
  );
}
