"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, MapPin, Plus, RefreshCw, Truck, UserRound, UserRoundCheck } from "lucide-react";

type Zone = { id: string; name: string; city: string; country: string; isActive: boolean; _count?: { couriers: number; shipments: number } };
type Courier = {
    id: string;
    courierCode: string;
    vehicleType: string | null;
    isActive: boolean;
    activeDeliveries: number;
    user: { id: string; name: string | null; email: string; phone: string | null; isBlocked: boolean };
    zone: Zone | null;
};

const inputClass = "w-full border border-zinc-800 bg-[#080808] px-3 py-2.5 text-sm text-white outline-none focus:border-lime-400";
const buttonClass = "inline-flex items-center justify-center gap-2 bg-lime-400 px-4 py-2.5 text-xs font-black text-black transition hover:bg-lime-300 disabled:opacity-50";

export default function CourierManagement() {
    const [couriers, setCouriers] = useState<Courier[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [email, setEmail] = useState("");
    const [zoneId, setZoneId] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [zoneName, setZoneName] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("Bangladesh");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/admin/couriers", { cache: "no-store" });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Could not load courier management.");
            setCouriers(result.data.couriers);
            setZones(result.data.zones);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not load courier management.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void loadData(); }, [loadData]);

    async function submit(path: string, method: string, body: unknown) {
        setSaving(true);
        setError("");
        setNotice("");
        try {
            const response = await fetch(path, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Request failed.");
            setNotice(result.message || "Saved.");
            await loadData();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Request failed.");
            return false;
        } finally {
            setSaving(false);
        }
    }

    async function addCourier(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const success = await submit("/api/admin/couriers", "POST", { email, zoneId: zoneId || null, vehicleType });
        if (success) { setEmail(""); setVehicleType(""); }
    }

    async function addZone(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const success = await submit("/api/admin/delivery-zones", "POST", { name: zoneName, city, country });
        if (success) { setZoneName(""); setCity(""); }
    }

    return (
        <main className="min-h-screen bg-[#080808] px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
                    <div>
                        <p className="mb-2 text-[10px] font-black tracking-[0.25em] text-lime-400">HYPERREAL / LOGISTICS</p>
                        <h1 className="text-2xl font-black sm:text-3xl">Courier <span className="text-lime-400">Management</span></h1>
                        <p className="mt-2 text-sm text-zinc-500">Register trusted courier accounts and organize delivery zones.</p>
                    </div>
                    <button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex items-center gap-2 border border-zinc-700 px-3 py-2 text-xs font-bold"><RefreshCw size={14} className={loading ? "animate-spin" : ""}/>Refresh</button>
                </header>

                {(error || notice) && <div className={`mb-5 border px-4 py-3 text-sm ${error ? "border-red-900 text-red-300" : "border-lime-900 text-lime-300"}`}>{error || notice}</div>}

                <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <form onSubmit={addCourier} className="space-y-3 border border-zinc-800 bg-[#0d0d0d] p-4">
                        <h2 className="flex items-center gap-2 text-xs font-black tracking-widest"><UserRound size={15} className="text-lime-400"/>REGISTER COURIER</h2>
                        <p className="text-xs leading-5 text-zinc-500">Promote an existing active customer account into a courier account. The account must already exist and must not be an admin or manager.</p>
                        <label className="block space-y-1"><span className="text-[10px] text-zinc-500">EXISTING ACCOUNT EMAIL</span><input required type="email" value={email} onChange={(event)=>setEmail(event.target.value)} placeholder="rider@example.com" className={inputClass}/></label>
                        <label className="block space-y-1"><span className="text-[10px] text-zinc-500">DEFAULT DELIVERY ZONE</span><select value={zoneId} onChange={(event)=>setZoneId(event.target.value)} className={inputClass}><option value="">No zone assigned</option>{zones.filter((zone)=>zone.isActive).map((zone)=><option key={zone.id} value={zone.id}>{zone.name} · {zone.city}, {zone.country}</option>)}</select></label>
                        <label className="block space-y-1"><span className="text-[10px] text-zinc-500">VEHICLE TYPE (OPTIONAL)</span><input value={vehicleType} onChange={(event)=>setVehicleType(event.target.value)} placeholder="Motorcycle, bicycle, van..." maxLength={60} className={inputClass}/></label>
                        <button disabled={saving} className={buttonClass}><Plus size={14}/>{saving ? "Saving..." : "Register courier"}</button>
                    </form>

                    <form onSubmit={addZone} className="space-y-3 border border-zinc-800 bg-[#0d0d0d] p-4">
                        <h2 className="flex items-center gap-2 text-xs font-black tracking-widest"><MapPin size={15} className="text-lime-400"/>CREATE DELIVERY ZONE</h2>
                        <p className="text-xs leading-5 text-zinc-500">Create service areas that couriers can be assigned to. Use consistent zone names so dispatchers can select the correct rider.</p>
                        <label className="block space-y-1"><span className="text-[10px] text-zinc-500">ZONE NAME</span><input required value={zoneName} onChange={(event)=>setZoneName(event.target.value)} placeholder="Dhaka North" maxLength={80} className={inputClass}/></label>
                        <label className="block space-y-1"><span className="text-[10px] text-zinc-500">CITY</span><input required value={city} onChange={(event)=>setCity(event.target.value)} placeholder="Dhaka" maxLength={80} className={inputClass}/></label>
                        <label className="block space-y-1"><span className="text-[10px] text-zinc-500">COUNTRY</span><input required value={country} onChange={(event)=>setCountry(event.target.value)} maxLength={80} className={inputClass}/></label>
                        <button disabled={saving} className={buttonClass}><Plus size={14}/>{saving ? "Saving..." : "Create zone"}</button>
                    </form>
                </div>

                <section className="mb-6 border border-zinc-800 bg-[#0d0d0d]">
                    <div className="flex items-center justify-between border-b border-zinc-800 p-4"><h2 className="flex items-center gap-2 text-xs font-black tracking-widest"><Truck size={15} className="text-lime-400"/>COURIER DIRECTORY</h2><span className="text-xs text-zinc-500">{couriers.length} registered</span></div>
                    {loading ? <div className="py-12 text-center text-sm text-zinc-500"><LoaderCircle className="mx-auto mb-2 animate-spin"/>Loading courier directory...</div> : couriers.length === 0 ? <p className="p-8 text-center text-sm text-zinc-500">No couriers registered yet.</p> : (
                        <div className="divide-y divide-zinc-800">
                            {couriers.map((courier)=>(
                                <article key={courier.id} className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_220px_180px] md:items-center">
                                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">{courier.user.name || courier.user.email}</span><span className="border border-zinc-700 px-2 py-0.5 text-[9px] text-lime-300">{courier.courierCode}</span><span className={`border px-2 py-0.5 text-[9px] ${courier.isActive && !courier.user.isBlocked ? "border-lime-900 text-lime-300" : "border-red-900 text-red-300"}`}>{courier.isActive && !courier.user.isBlocked ? "ACTIVE" : "INACTIVE"}</span></div><p className="mt-1 truncate text-xs text-zinc-500">{courier.user.email}{courier.user.phone ? ` · ${courier.user.phone}` : ""}</p><p className="mt-2 text-xs text-zinc-400">{courier.zone ? `${courier.zone.name} · ${courier.zone.city}, ${courier.zone.country}` : "No default zone"}</p><p className="mt-1 text-[10px] text-zinc-500">{courier.vehicleType || "Vehicle not specified"} · {courier.activeDeliveries} active deliveries</p></div>
                                    <select aria-label={`Zone for ${courier.courierCode}`} value={courier.zone?.id || ""} onChange={(event)=>void submit("/api/admin/couriers","PATCH",{profileId:courier.id,zoneId:event.target.value || null})} className={inputClass}><option value="">No zone</option>{zones.filter((zone)=>zone.isActive).map((zone)=><option key={zone.id} value={zone.id}>{zone.name} · {zone.city}</option>)}</select>
                                    <button type="button" disabled={saving || courier.user.isBlocked} onClick={()=>void submit("/api/admin/couriers","PATCH",{profileId:courier.id,isActive:!courier.isActive})} className="border border-zinc-700 px-3 py-2 text-xs font-bold hover:border-lime-400 disabled:opacity-40">{courier.isActive ? "Deactivate courier" : "Activate courier"}</button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="border border-zinc-800 bg-[#0d0d0d]">
                    <div className="border-b border-zinc-800 p-4"><h2 className="flex items-center gap-2 text-xs font-black tracking-widest"><MapPin size={15} className="text-lime-400"/>DELIVERY ZONES</h2></div>
                    {zones.length === 0 ? <p className="p-6 text-sm text-zinc-500">Create your first zone above.</p> : <div className="divide-y divide-zinc-800">{zones.map((zone)=><div key={zone.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-bold">{zone.name}</p><p className="mt-1 text-xs text-zinc-500">{zone.city}, {zone.country}</p></div><div className="flex items-center gap-3"><span className={`text-[10px] font-bold ${zone.isActive ? "text-lime-300" : "text-zinc-500"}`}>{zone.isActive ? "ACTIVE" : "INACTIVE"}</span><button type="button" disabled={saving} onClick={()=>void submit("/api/admin/delivery-zones","PATCH",{id:zone.id,isActive:!zone.isActive})} className="border border-zinc-700 px-3 py-2 text-xs font-bold hover:border-lime-400">{zone.isActive ? "Deactivate" : "Activate"}</button></div></div>)}</div>}
                </section>
            </div>
        </main>
    );
}
