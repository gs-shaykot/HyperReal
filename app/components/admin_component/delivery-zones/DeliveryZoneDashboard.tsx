"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPinned, Plus, RefreshCw, Save, Pencil, Power, X, Globe2 } from "lucide-react";

type Zone = { id: string; name: string; city: string; country: string; isActive: boolean; _count?: { couriers: number; shipments: number } };
type ZoneForm = { name: string; city: string; country: string };
const blank: ZoneForm = { name: "", city: "", country: "Bangladesh" };
const input = "w-full border border-zinc-700 bg-black px-3 py-2.5 text-xs text-white outline-none focus:border-lime-400 light:bg-white light:text-zinc-900 light:border-zinc-300";
const label = "mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-zinc-400";

export default function DeliveryZoneDashboard() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [form, setForm] = useState<ZoneForm>(blank);
    const [editing, setEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<ZoneForm>(blank);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/admin/delivery-zones", { cache: "no-store" });
            const json = await response.json();
            if (!response.ok || !json.success) throw new Error(json.message || "Could not load zones.");
            setZones(json.data);
        } catch (error) {
            setNotice({ ok: false, text: error instanceof Error ? error.message : "Could not load zones." });
        } finally { setLoading(false); }
    }, []);
    useEffect(() => { void load(); }, [load]);

    async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault(); setSaving(true); setNotice(null);
        try {
            const response = await fetch("/api/admin/delivery-zones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const json = await response.json();
            if (!response.ok || !json.success) throw new Error(json.message || "Could not create zone.");
            setForm(blank); setNotice({ ok: true, text: json.message }); await load();
        } catch (error) { setNotice({ ok: false, text: error instanceof Error ? error.message : "Could not create zone." }); }
        finally { setSaving(false); }
    }

    async function patchZone(id: string, data: Partial<ZoneForm> & { isActive?: boolean }) {
        setSaving(true); setNotice(null);
        try {
            const response = await fetch("/api/admin/delivery-zones", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) });
            const json = await response.json();
            if (!response.ok || !json.success) throw new Error(json.message || "Could not update zone.");
            setEditing(null); setNotice({ ok: true, text: json.message }); await load();
        } catch (error) { setNotice({ ok: false, text: error instanceof Error ? error.message : "Could not update zone." }); }
        finally { setSaving(false); }
    }

    const courierCount = zones.reduce((n, z) => n + (z._count?.couriers ?? 0), 0);
    const shipmentCount = zones.reduce((n, z) => n + (z._count?.shipments ?? 0), 0);

    return <section className="mx-auto max-w-[1400px] space-y-5 text-white light:text-zinc-900">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-5 light:border-zinc-200">
            <div className="flex items-start gap-3"><div className="border border-lime-400/40 bg-lime-400/10 p-3 text-lime-300"><MapPinned size={22}/></div><div>
                <p className="text-[10px] font-bold tracking-[0.24em] text-lime-300">DELIVERY NETWORK / 01</p>
                <h1 className="mt-1 text-2xl font-black uppercase tracking-tight">Delivery Zones</h1>
                <p className="mt-1 max-w-2xl text-xs text-zinc-400">Configure local delivery territories and international destination zones. Deactivate zones instead of deleting them to preserve shipment history.</p>
            </div></div>
            <button onClick={() => void load()} className="inline-flex items-center gap-2 border border-zinc-700 px-3 py-2 text-xs font-bold hover:border-lime-400"><RefreshCw size={14}/> Refresh</button>
        </header>

        {notice && <div role="status" className={`border px-3 py-2 text-xs ${notice.ok ? "border-lime-400/40 text-lime-300" : "border-red-400/40 text-red-300"}`}>{notice.text}</div>}

        <div className="grid gap-3 sm:grid-cols-3">
            {[{ label: "Configured zones", value: zones.length }, { label: "Courier profiles", value: courierCount }, { label: "Linked shipments", value: shipmentCount }].map((item) => <div key={item.label} className="border border-zinc-800 bg-zinc-950 p-4 light:border-zinc-200 light:bg-zinc-50"><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{item.label}</p><p className="mt-2 text-3xl font-black">{item.value}</p></div>)}
        </div>

        <form onSubmit={submitCreate} className="border border-zinc-800 bg-zinc-950 p-4 light:border-zinc-200 light:bg-zinc-50">
            <div className="mb-4 flex items-center gap-2"><Plus size={16} className="text-lime-300"/><h2 className="text-xs font-black uppercase tracking-widest">Create delivery zone</h2></div>
            <div className="grid gap-3 sm:grid-cols-3">
                <label><span className={label}>Zone name</span><input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dhaka North" className={input}/></label>
                <label><span className={label}>City / region</span><input required maxLength={80} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Dhaka" className={input}/></label>
                <label><span className={label}>Country</span><input required maxLength={80} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Bangladesh" className={input}/></label>
            </div>
            <div className="mt-3 flex justify-end"><button disabled={saving} className="inline-flex items-center gap-2 bg-lime-300 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black disabled:opacity-50"><Plus size={14}/> {saving ? "Saving..." : "Add zone"}</button></div>
        </form>

        <div className="overflow-hidden border border-zinc-800 light:border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 light:border-zinc-200 light:bg-zinc-50"><h2 className="text-xs font-black uppercase tracking-widest">Zone directory</h2><span className="text-[10px] text-zinc-500">{zones.length} zones</span></div>
            {loading ? <div className="p-10 text-center text-xs text-zinc-400"><RefreshCw size={18} className="mx-auto mb-2 animate-spin"/>Loading zones...</div> : zones.length === 0 ? <div className="p-10 text-center text-xs text-zinc-500">No zones configured yet.</div> :
                <div className="divide-y divide-zinc-800 light:divide-zinc-200">{zones.map((zone) => <div key={zone.id} className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    {editing === zone.id ? <div className="grid gap-2 sm:grid-cols-3">
                        <label><span className={label}>Zone name</span><input className={input} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}/></label>
                        <label><span className={label}>City / region</span><input className={input} value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}/></label>
                        <label><span className={label}>Country</span><input className={input} value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}/></label>
                    </div> : <div className="flex items-start gap-3"><div className="mt-0.5 text-lime-300"><Globe2 size={17}/></div><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{zone.name}</p><span className={`border px-2 py-0.5 text-[9px] font-bold ${zone.isActive ? "border-lime-400/40 text-lime-300" : "border-zinc-700 text-zinc-500"}`}>{zone.isActive ? "ACTIVE" : "INACTIVE"}</span></div><p className="mt-1 text-xs text-zinc-400">{zone.city}, {zone.country}</p><p className="mt-1 text-[10px] text-zinc-500">{zone._count?.couriers ?? 0} courier profiles · {zone._count?.shipments ?? 0} shipments</p></div></div>}
                    <div className="flex flex-wrap gap-2">
                        {editing === zone.id ? <><button disabled={saving} onClick={() => void patchZone(zone.id, editForm)} className="inline-flex items-center gap-1.5 bg-lime-300 px-3 py-2 text-[10px] font-black text-black"><Save size={13}/> Save</button><button onClick={() => setEditing(null)} className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-2 text-[10px] font-bold"><X size={13}/> Cancel</button></> :
                        <><button onClick={() => { setEditing(zone.id); setEditForm({ name: zone.name, city: zone.city, country: zone.country }); }} className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-2 text-[10px] font-bold hover:border-lime-400"><Pencil size={13}/> Edit</button><button disabled={saving} onClick={() => void patchZone(zone.id, { isActive: !zone.isActive })} className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-2 text-[10px] font-bold hover:border-lime-400"><Power size={13}/> {zone.isActive ? "Deactivate" : "Activate"}</button></>}
                    </div>
                </div>)}</div>}
        </div>
    </section>;
}
