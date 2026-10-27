"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, MapPinned, UserRound, UserRoundCheck } from "lucide-react";

type Courier = {
    id: string;
    courierCode: string;
    zoneId: string | null;
    user: { id: string; name: string | null; email: string; phone: string | null };
    zone: { id: string; name: string; city: string; country: string; isActive: boolean } | null;
};

type Zone = { id: string; name: string; city: string; country: string; isActive: boolean };

type CourierAssignmentProps = {
    shipmentId: string;
    assignedCourier: Courier["user"] | null;
    assignedZoneId?: string | null;
    onAssigned: (courier: Courier["user"]) => void;
};

const inputClass = "min-w-0 w-full border border-zinc-700 bg-black px-3 py-2 text-xs text-white outline-none focus:border-second";

export default function CourierAssignment({
    shipmentId,
    assignedCourier,
    assignedZoneId,
    onAssigned,
}: CourierAssignmentProps) {
    const [couriers, setCouriers] = useState<Courier[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [zoneId, setZoneId] = useState(assignedZoneId ?? "");
    const [courierId, setCourierId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadOptions() {
            setLoading(true);
            try {
                const [courierResponse, directoryResponse] = await Promise.all([
                    fetch("/api/admin/fulfillment/assign", { cache: "no-store" }),
                    fetch("/api/admin/couriers", { cache: "no-store" }),
                ]);
                const [courierResult, directoryResult] = await Promise.all([
                    courierResponse.json(),
                    directoryResponse.json(),
                ]);
                if (!courierResponse.ok || !courierResult.success) {
                    throw new Error(courierResult.message || "Could not load couriers.");
                }
                if (!directoryResponse.ok || !directoryResult.success) {
                    throw new Error(directoryResult.message || "Could not load delivery zones.");
                }
                if (cancelled) return;

                const available = courierResult.data as Courier[];
                setCouriers(available);
                setZones((directoryResult.data.zones as Zone[]).filter((zone) => zone.isActive));
                const current = available.find((courier) => courier.user.id === assignedCourier?.id);
                setZoneId(assignedZoneId || current?.zoneId || "");
                setCourierId(current?.id || "");
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Could not load assignment options.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadOptions();
        return () => { cancelled = true; };
    }, [assignedCourier?.id, assignedZoneId]);

    const zoneCouriers = useMemo(
        () => couriers.filter((courier) => courier.zoneId === zoneId && courier.zone?.isActive),
        [couriers, zoneId],
    );

    async function assignCourier() {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const response = await fetch("/api/admin/fulfillment/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shipmentId, zoneId, courierProfileId: courierId }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Could not assign courier.");

            onAssigned(result.data.assignedCourier);
            setSuccess(result.message);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not assign courier.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="space-y-3 border border-zinc-800 bg-[#0d0d0d] p-4">
            <h3 className="flex items-center gap-2 text-[10px] font-black tracking-widest text-zinc-400">
                <UserRound size={14} /> DELIVERY ZONE & COURIER
            </h3>

            {assignedCourier && (
                <p className="flex items-center gap-2 text-xs text-lime-300">
                    <UserRoundCheck size={14} />
                    Currently assigned to {assignedCourier.name || assignedCourier.email}
                </p>
            )}

            {loading ? (
                <p className="flex items-center gap-2 text-xs text-zinc-500"><LoaderCircle size={14} className="animate-spin" />Loading eligible couriers...</p>
            ) : (
                <>
                    <label className="block space-y-1">
                        <span className="flex items-center gap-2 text-[10px] text-zinc-500"><MapPinned size={13} />DELIVERY ZONE</span>
                        <select value={zoneId} onChange={(event) => { setZoneId(event.target.value); setCourierId(""); }} className={inputClass}>
                            <option value="">Select delivery zone</option>
                            {zones.map((zone) => (
                                <option key={zone.id} value={zone.id}>{zone.name} · {zone.city}, {zone.country}</option>
                            ))}
                        </select>
                    </label>

                    <label className="block space-y-1">
                        <span className="text-[10px] text-zinc-500">ELIGIBLE COURIER</span>
                        <select value={courierId} onChange={(event) => setCourierId(event.target.value)} disabled={!zoneId || zoneCouriers.length === 0} className={inputClass}>
                            <option value="">Select registered courier</option>
                            {zoneCouriers.map((courier) => (
                                <option key={courier.id} value={courier.id}>
                                    {courier.user.name || courier.user.email} · {courier.courierCode}
                                </option>
                            ))}
                        </select>
                        {zoneId && zoneCouriers.length === 0 && <p className="text-[10px] text-amber-300">No active couriers are registered in this zone.</p>}
                    </label>

                    <button type="button" onClick={() => void assignCourier()} disabled={saving || !zoneId || !courierId} className="inline-flex items-center justify-center gap-2 bg-second px-3 py-2 text-xs font-black text-black disabled:opacity-50">
                        {saving && <LoaderCircle size={13} className="animate-spin" />}
                        {saving ? "Assigning..." : assignedCourier ? "Update assignment" : "Assign courier"}
                    </button>
                </>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}
            {success && <p className="text-xs text-lime-300">{success}</p>}
            <p className="text-[10px] text-zinc-500">Only active courier accounts registered for the selected zone can be assigned.</p>
        </section>
    );
}
