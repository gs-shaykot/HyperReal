"use client";

import { useState } from "react";
import { LoaderCircle, UserRound, UserRoundCheck } from "lucide-react";

type Courier = { id: string; name: string | null; email: string; phone: string | null };

type CourierAssignmentProps = {
    shipmentId: string;
    assignedCourier: Courier | null;
    onAssigned: (courier: Courier) => void;
};

const inputClass = "min-w-0 flex-1 border border-zinc-700 bg-black px-3 py-2 text-xs text-white outline-none focus:border-second";

export default function CourierAssignment({
    shipmentId,
    assignedCourier,
    onAssigned,
}: CourierAssignmentProps) {
    const [email, setEmail] = useState(assignedCourier?.email ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function assignCourier() {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/admin/fulfillment/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shipmentId, email }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message ?? "Could not assign courier.");
            }

            onAssigned(result.data.assignedCourier as Courier);
            setEmail(result.data.assignedCourier.email);
            setSuccess(result.message);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not assign courier.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="border border-zinc-800 bg-[#0d0d0d] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black tracking-widest text-zinc-400">
                <UserRound size={14} /> COURIER ASSIGNMENT
            </h3>
            {assignedCourier && (
                <p className="mb-3 flex items-center gap-2 text-xs text-lime-300">
                    <UserRoundCheck size={14} />
                    Assigned to {assignedCourier.name || assignedCourier.email}
                </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Courier account email"
                    className={inputClass}
                />
                <button
                    type="button"
                    onClick={() => void assignCourier()}
                    disabled={loading || !email.trim()}
                    className="inline-flex items-center justify-center gap-2 bg-second px-3 py-2 text-xs font-black text-black disabled:opacity-50"
                >
                    {loading && <LoaderCircle size={13} className="animate-spin" />}
                    {loading ? "Assigning..." : assignedCourier ? "Reassign" : "Assign courier"}
                </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            {success && <p className="mt-2 text-xs text-lime-300">{success}</p>}
            <p className="mt-2 text-[10px] text-zinc-500">Use the email of an active HyperReal account. The courier must sign in with that account to see this delivery.</p>
        </section>
    );
}
