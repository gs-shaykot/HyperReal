"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Globe2, RefreshCw, Search, Save, Truck, PackageCheck, Clock3, ShieldAlert } from "lucide-react";

type ShipmentRow = {
    id: string; trackingCode: string; status: string; fulfillmentStatus: string; shippingType: string;
    carrierName: string | null; carrierTrackingNumber: string | null; estimatedDeliveryAt: string | null;
    customsStatus: string; internationalNotes: string | null; dispatchedAt: string | null; updatedAt: string;
    order: { id: string; orderCode: string; status: string; createdAt: string; user: { name: string; email: string };
        orderHistory: { fullName: string; street: string; house: string | null; city: string; zipCode: string; country: string; phone: string } | null;
        payments: { status: string; method: string; paidAmountInUSD: number }[] };
};
type Payload = { shipments: ShipmentRow[]; countries: string[] };
type EditState = { carrierName: string; carrierTrackingNumber: string; estimatedDeliveryAt: string; customsStatus: string; internationalNotes: string };

const CUSTOMS = [
    ["NOT_REQUIRED", "Not required"], ["DOCUMENTS_PENDING", "Documents pending"], ["DOCUMENTS_READY", "Documents ready"],
    ["UNDER_REVIEW", "Under review"], ["CLEARED", "Cleared"], ["ON_HOLD", "On hold"],
];

const inputClass = "w-full border border-zinc-700 bg-black px-3 py-2 text-xs text-white outline-none focus:border-lime-400 light:bg-white light:text-zinc-900 light:border-zinc-300";
const labelClass = "mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400";

function localDateInput(value: string | null) {
    if (!value) return "";
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function InternationalShippingDashboard() {
    const [payload, setPayload] = useState<Payload>({ shipments: [], countries: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [country, setCountry] = useState("ALL");
    const [status, setStatus] = useState("ALL");
    const [edits, setEdits] = useState<Record<string, EditState>>({});
    const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/international-shipments", { cache: "no-store" });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Could not load shipments.");
            setPayload(json.data);
            setEdits(Object.fromEntries(json.data.shipments.map((s: ShipmentRow) => [s.id, {
                carrierName: s.carrierName ?? "", carrierTrackingNumber: s.carrierTrackingNumber ?? "",
                estimatedDeliveryAt: localDateInput(s.estimatedDeliveryAt), customsStatus: s.customsStatus ?? "NOT_REQUIRED",
                internationalNotes: s.internationalNotes ?? "",
            }])));
            setNotice(null);
        } catch (error) {
            setNotice({ ok: false, text: error instanceof Error ? error.message : "Could not load shipments." });
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const filtered = useMemo(() => payload.shipments.filter((s) => {
        const q = search.trim().toLowerCase();
        const destination = s.order.orderHistory;
        return (!q || [s.order.orderCode, s.trackingCode, s.carrierTrackingNumber, destination?.fullName, destination?.country, s.order.user.email]
            .some((v) => v?.toLowerCase().includes(q)))
            && (country === "ALL" || destination?.country === country)
            && (status === "ALL" || s.status === status);
    }), [payload.shipments, search, country, status]);

    const updateEdit = (id: string, key: keyof EditState, value: string) => setEdits((old) => ({ ...old, [id]: { ...old[id], [key]: value } }));

    async function save(row: ShipmentRow) {
        const edit = edits[row.id];
        if (!edit) return;
        setSaving(row.id); setNotice(null);
        try {
            const res = await fetch("/api/admin/international-shipments", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shipmentId: row.id, ...edit, estimatedDeliveryAt: edit.estimatedDeliveryAt ? new Date(edit.estimatedDeliveryAt).toISOString() : null }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Could not save shipment.");
            setNotice({ ok: true, text: `Shipping details saved for ${row.order.orderCode}.` });
            await load();
        } catch (error) {
            setNotice({ ok: false, text: error instanceof Error ? error.message : "Could not save shipment." });
        } finally { setSaving(null); }
    }

    const count = payload.shipments.length;
    const inTransit = payload.shipments.filter((s) => ["OUT_FOR_DELIVERY"].includes(s.status) || s.fulfillmentStatus === "DISPATCHED").length;
    const customsHold = payload.shipments.filter((s) => s.customsStatus === "ON_HOLD" || s.customsStatus === "UNDER_REVIEW").length;

    return <section className="mx-auto max-w-[1500px] space-y-5 text-white light:text-zinc-900">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-5 light:border-zinc-200">
            <div className="flex items-start gap-3"><div className="border border-lime-400/40 bg-lime-400/10 p-3 text-lime-300"><Globe2 size={22}/></div><div>
                <p className="text-[10px] font-bold tracking-[0.24em] text-lime-300">GLOBAL LOGISTICS / 01</p>
                <h1 className="mt-1 text-2xl font-black uppercase tracking-tight">International Shipping</h1>
                <p className="mt-1 max-w-2xl text-xs text-zinc-400">Manage cross-border carrier details, customs readiness, tracking references, and delivery estimates.</p>
            </div></div>
            <button onClick={() => void load()} className="inline-flex items-center gap-2 border border-zinc-700 px-3 py-2 text-xs font-bold hover:border-lime-400"><RefreshCw size={14}/> Refresh</button>
        </header>

        {notice && <div role="status" className={`border px-3 py-2 text-xs ${notice.ok ? "border-lime-400/40 text-lime-300" : "border-red-400/40 text-red-300"}`}>{notice.text}</div>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
                { label: "International shipments", value: count, icon: Globe2 },
                { label: "Dispatched / in transit", value: inTransit, icon: Truck },
                { label: "Customs attention", value: customsHold, icon: ShieldAlert },
            ].map((card) => <div key={card.label} className="border border-zinc-800 bg-zinc-950 p-4 light:border-zinc-200 light:bg-zinc-50">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">{card.label}<card.icon size={15}/></div>
                <p className="mt-3 text-3xl font-black tabular-nums">{card.value}</p>
            </div>)}
        </div>

        <div className="flex flex-wrap gap-2 border border-zinc-800 bg-zinc-950 p-3 light:border-zinc-200 light:bg-zinc-50">
            <div className="relative min-w-[220px] flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order, tracking, recipient..." className={`${inputClass} pl-9`}/></div>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}><option value="ALL">All destination countries</option>{payload.countries.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}><option value="ALL">All delivery statuses</option>{["PENDING","OUT_FOR_DELIVERY","DELIVERED","FAILED"].map((s) => <option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select>
        </div>

        {loading ? <div className="border border-zinc-800 p-12 text-center text-xs text-zinc-400"><RefreshCw className="mx-auto mb-3 animate-spin" size={20}/>Loading international shipments...</div>
        : filtered.length === 0 ? <div className="border border-dashed border-zinc-700 p-12 text-center"><Globe2 className="mx-auto mb-3 text-zinc-500" size={28}/><p className="text-sm font-bold">No international shipments found</p><p className="mt-1 text-xs text-zinc-500">Shipments with a destination outside Bangladesh appear here once their order has a shipment record.</p></div>
        : <div className="space-y-4">{filtered.map((row) => {
            const address = row.order.orderHistory;
            const edit = edits[row.id];
            if (!edit) return null;
            return <article key={row.id} className="border border-zinc-800 bg-zinc-950 light:border-zinc-200 light:bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 px-4 py-3 light:border-zinc-200">
                    <div><p className="text-xs font-black text-lime-300">{row.order.orderCode}</p><p className="mt-1 text-[10px] text-zinc-500">Tracking reference: {row.trackingCode}</p><p className="mt-1 text-xs font-bold">{address?.country ?? "Destination unavailable"} <span className="font-normal text-zinc-400">· {address?.city}</span></p></div>
                    <div className="flex flex-wrap gap-2"><span className="border border-zinc-700 px-2 py-1 text-[9px] font-bold">{row.status.replaceAll("_"," ")}</span><span className={`border px-2 py-1 text-[9px] font-bold ${edit.customsStatus === "ON_HOLD" ? "border-red-400/50 text-red-300" : edit.customsStatus === "CLEARED" ? "border-lime-400/50 text-lime-300" : "border-zinc-700 text-zinc-300"}`}>{edit.customsStatus.replaceAll("_"," ")}</span></div>
                </div>
                <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr]">
                    <div className="space-y-3">
                        <div><p className={labelClass}>Recipient</p><p className="text-xs font-bold">{address?.fullName ?? row.order.user.name}</p><p className="mt-1 text-xs text-zinc-400">{row.order.user.email}</p><p className="mt-1 text-xs text-zinc-400">{address?.street} {address?.house}, {address?.city}, {address?.zipCode}</p><p className="text-xs text-zinc-400">{address?.phone}</p></div>
                        <div className="grid grid-cols-2 gap-3"><div><p className={labelClass}>Order date</p><p className="text-xs">{new Date(row.order.createdAt).toLocaleDateString()}</p></div><div><p className={labelClass}>Payment</p><p className="text-xs">{row.order.payments[0]?.status ?? "Unknown"} · {row.order.payments[0]?.method ?? "—"}</p></div></div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500"><Clock3 size={13}/> Last updated {new Date(row.updatedAt).toLocaleString()}</div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label><span className={labelClass}>International carrier</span><input value={edit.carrierName} onChange={(e) => updateEdit(row.id,"carrierName",e.target.value)} placeholder="DHL, FedEx, UPS..." className={inputClass}/></label>
                        <label><span className={labelClass}>Carrier tracking number</span><input value={edit.carrierTrackingNumber} onChange={(e) => updateEdit(row.id,"carrierTrackingNumber",e.target.value)} placeholder="Enter carrier reference" className={inputClass}/></label>
                        <label><span className={labelClass}>Estimated delivery</span><input type="datetime-local" value={edit.estimatedDeliveryAt} onChange={(e) => updateEdit(row.id,"estimatedDeliveryAt",e.target.value)} className={inputClass}/></label>
                        <label><span className={labelClass}>Customs status</span><select value={edit.customsStatus} onChange={(e) => updateEdit(row.id,"customsStatus",e.target.value)} className={inputClass}>{CUSTOMS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                        <label className="sm:col-span-2"><span className={labelClass}>Shipping / customs notes</span><textarea rows={2} value={edit.internationalNotes} onChange={(e) => updateEdit(row.id,"internationalNotes",e.target.value)} placeholder="Invoice prepared, customs hold reason, carrier updates..." className={inputClass}/></label>
                        <div className="sm:col-span-2 flex justify-end"><button disabled={saving === row.id} onClick={() => void save(row)} className="inline-flex items-center gap-2 bg-lime-300 px-4 py-2 text-xs font-black uppercase tracking-wider text-black disabled:opacity-50"><Save size={14}/>{saving === row.id ? "Saving..." : "Save shipping details"}</button></div>
                    </div>
                </div>
            </article>;
        })}</div>}
    </section>;
}
