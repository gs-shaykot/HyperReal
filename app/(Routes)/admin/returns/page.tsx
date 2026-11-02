"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { RefreshCw, RotateCcw, Search, CheckCircle2, XCircle, PackageCheck, ClipboardCheck, Wallet, ChevronDown } from "lucide-react";

type ReturnRow = {
  id: string; returnCode: string; status: string; reason: string; customerNote?: string | null;
  adminNote?: string | null; createdAt: string;
  user: { name: string; email: string; phone?: string | null };
  order: { orderCode: string; payments: Array<{ method: string; status: string }> };
  items: Array<{ id: string; requestedQuantity: number; approvedQuantity: number; receivedQuantity: number; restockQuantity: number; condition: string; refundAmount: string | number; orderItem: { priceAtPurchase: number; variant: { product: { name: string }; size: string; color: string } } }>;
  events: Array<{ id: string; title: string; description?: string | null; createdAt: string; actor?: { name: string; email: string } | null }>;
  refund?: { status: string; amount: string | number; currency: string; method: string } | null;
};

const statuses = ["ALL","REQUESTED","APPROVED","IN_TRANSIT","RECEIVED","INSPECTING","REFUND_APPROVED","REFUND_PROCESSING","REFUNDED","REJECTED","CLOSED"];
const money = (v: number | string) => Number(v).toFixed(2);

export default function AdminReturnsPage() {
  const [rows,setRows] = useState<ReturnRow[]>([]);
  const [status,setStatus] = useState("ALL");
  const [search,setSearch] = useState("");
  const [selected,setSelected] = useState<ReturnRow | null>(null);
  const [busy,setBusy] = useState(false);
  const [note,setNote] = useState("");
  const [error,setError] = useState("");
  const load = useCallback(async () => {
    setBusy(true); setError("");
    try { const r=await fetch("/api/admin/returns",{cache:"no-store"}); const j=await r.json(); if(!r.ok) throw new Error(j.message||"Could not load returns"); setRows(j.data||[]); }
    catch(e){setError(e instanceof Error?e.message:"Could not load returns");} finally{setBusy(false);}
  },[]);
  useEffect(()=>{void load()},[load]);
  const processStripeRefund = async () => {
    if(!selected) return;
    setBusy(true); setError("");
    try {
      const r=await fetch("/api/admin/returns/refund",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({returnId:selected.id})});
      const j=await r.json(); if(!r.ok) throw new Error(j.message||"Could not process Stripe refund");
      setSelected(null); await load();
    } catch(e){setError(e instanceof Error?e.message:"Could not process Stripe refund");} finally{setBusy(false);}
  };
  const act = async (action:string, items?:unknown[]) => {
    if(!selected) return;
    setBusy(true); setError("");
    try {
      const r=await fetch("/api/admin/returns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({returnId:selected.id,action,note,items})});
      const j=await r.json(); if(!r.ok) throw new Error(j.message||"Action failed");
      setSelected(null); setNote(""); await load();
    } catch(e){setError(e instanceof Error?e.message:"Action failed");} finally{setBusy(false);}
  };
  const filtered=rows.filter(x=>(status==="ALL"||x.status===status)&&[x.returnCode,x.order.orderCode,x.user.name,x.user.email].join(" ").toLowerCase().includes(search.toLowerCase()));
  const counts=rows.reduce<Record<string,number>>((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{});
  const actionButton=(label:string,action:string,icon:ReactNode)=> <button disabled={busy} onClick={()=>void act(action)} className="inline-flex items-center gap-2 border border-zinc-300 px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-second hover:text-zinc-900 disabled:opacity-40">{icon}{label}</button>;
  return <div className="min-h-screen bg-main p-4 text-white light:bg-white light:text-zinc-900 md:p-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.25em] text-lime-700">HYPERREAL / OPERATIONS</p><h1 className="mt-2 text-3xl font-black tracking-tight">Returns & Refunds</h1><p className="mt-1 text-sm text-zinc-400 light:text-zinc-500">Review requests, inspect returned items and reconcile refunds.</p></div><button onClick={()=>void load()} disabled={busy} className="flex items-center gap-2 border border-zinc-700 bg-dark px-4 py-2 text-sm font-semibold text-white hover:border-second light:border-gray-300 light:bg-white light:text-zinc-900"><RefreshCw size={15} className={busy?"animate-spin":""}/> Refresh</button></header>
      {error&&<div role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><div className="border border-zinc-700 bg-dark p-4 light:border-gray-300 light:bg-white"><p className="text-xs text-zinc-400 light:text-zinc-500">Total requests</p><p className="mt-1 text-2xl font-black">{rows.length}</p></div>{["REQUESTED","INSPECTING","REFUND_PROCESSING"].map(k=><div key={k} className="border border-zinc-700 bg-dark p-4 light:border-gray-300 light:bg-white"><p className="text-xs text-zinc-400 light:text-zinc-500">{k.replaceAll("_"," ")}</p><p className="mt-1 text-2xl font-black">{counts[k]||0}</p></div>)}</div>
      <div className="flex flex-col gap-3 border border-zinc-700 bg-dark p-3 light:border-gray-300 light:bg-white md:flex-row"><div className="flex items-center gap-2 border px-3"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search return, order or customer" className="min-w-0 py-2 text-sm outline-none"/></div><select value={status} onChange={e=>setStatus(e.target.value)} className="border border-zinc-700 bg-main px-3 py-2 text-sm text-white [color-scheme:dark] light:border-gray-300 light:bg-white light:text-zinc-900 light:[color-scheme:light]">{statuses.map(s=><option key={s} value={s} className="bg-dark text-white light:bg-white light:text-zinc-900">{s}</option>)}</select></div>
      <div className="overflow-x-auto border border-zinc-700 bg-dark light:border-gray-300 light:bg-white"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-zinc-900 text-[10px] uppercase tracking-widest text-zinc-400 light:bg-zinc-100 light:text-zinc-500"><tr>{["Return / Order","Customer","Items","Status","Requested",""].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{filtered.map(x=><tr key={x.id} className="border-t border-zinc-800 hover:bg-zinc-900/60 light:border-zinc-200 light:hover:bg-zinc-50"><td className="px-4 py-3"><p className="font-bold">{x.returnCode}</p><p className="text-xs text-zinc-400 light:text-zinc-500">{x.order.orderCode}</p></td><td className="px-4 py-3"><p>{x.user.name}</p><p className="text-xs text-zinc-400 light:text-zinc-500">{x.user.email}</p></td><td className="px-4 py-3">{x.items.length} line(s)</td><td className="px-4 py-3"><span className="border px-2 py-1 text-[10px] font-bold">{x.status.replaceAll("_"," ")}</span></td><td className="px-4 py-3 text-xs text-zinc-400 light:text-zinc-500">{new Date(x.createdAt).toLocaleDateString()}</td><td className="px-4 py-3"><button onClick={()=>{setSelected(x);setNote(x.adminNote||"")}} className="border border-zinc-700 px-3 py-2 text-xs font-bold hover:border-second light:border-gray-300">REVIEW</button></td></tr>)}</tbody></table>{filtered.length===0&&<p className="p-10 text-center text-sm text-zinc-500">No return requests found.</p>}</div>
      {selected&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-5" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-zinc-700 bg-dark p-5 text-white shadow-2xl light:border-gray-300 light:bg-white light:text-zinc-900 md:p-7">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold tracking-widest text-second">{selected.returnCode}</p><h2 className="mt-1 text-xl font-black">{selected.order.orderCode}</h2><p className="text-sm text-zinc-500">{selected.user.name} · {selected.user.email}</p></div><button onClick={()=>setSelected(null)} className="border px-3 py-1 text-sm">Close</button></div>
        <div className="mt-5 space-y-3">{selected.items.map(i=><div key={i.id} className="border p-3"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-bold">{i.orderItem.variant.product.name}</p><p className="text-xs text-zinc-400 light:text-zinc-500">{i.orderItem.variant.size} / {i.orderItem.variant.color}</p></div><p className="text-xs">Requested: {i.requestedQuantity} · Approved: {i.approvedQuantity}</p></div><p className="mt-2 text-xs text-zinc-400 light:text-zinc-600">Received: {i.receivedQuantity} · Restock: {i.restockQuantity} · Condition: {i.condition} · Refund: {money(i.refundAmount)}</p></div>)}</div>
        <div className="mt-4 border p-3"><p className="text-xs font-bold uppercase tracking-widest">Reason: {selected.reason.replaceAll("_"," ")}</p><p className="mt-1 text-sm text-zinc-400 light:text-zinc-600">{selected.customerNote||"No customer note."}</p></div>
        {selected.events.length>0&&<div className="mt-4 border border-zinc-700 light:border-zinc-200"><button type="button" onClick={()=>setActivityExpanded(v=>!v)} className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-main light:hover:bg-zinc-50"><span><span className="block text-xs font-bold uppercase tracking-widest">Activity</span><span className="block text-xs text-zinc-500">{selected.events[selected.events.length-1].title} · {new Date(selected.events[selected.events.length-1].createdAt).toLocaleString()} · {selected.events.length} events</span></span><ChevronDown size={16} className={activityExpanded?"rotate-180 transition-transform":"transition-transform"}/></button>{activityExpanded&&<div className="space-y-2 border-t border-zinc-700 p-3 light:border-zinc-200">{selected.events.map(e=><div key={e.id} className="border-l-2 border-second pl-3"><p className="text-sm font-semibold">{e.title}</p><p className="text-xs text-zinc-400 light:text-zinc-500">{e.description} · {new Date(e.createdAt).toLocaleString()}</p><p className="text-[10px] text-zinc-500">Actor: {e.actor?.name || "System"}{e.actor?.email ? ` · ${e.actor.email}` : ""}</p></div>)}</div>}</div>}
        {selected.refund&&<div className="mt-4 border border-second/40 bg-second/10 p-3 text-sm"><p className="font-bold">Refund {selected.refund.status}</p><p>{selected.refund.currency} {money(selected.refund.amount)} · {selected.refund.method}</p></div>}
        <label className="mt-5 block text-xs font-bold uppercase tracking-widest">Internal note / rejection reason<textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} className="mt-2 w-full border border-zinc-700 bg-main p-3 text-sm text-white outline-none focus:border-second light:border-gray-300 light:bg-white light:text-zinc-900" placeholder="Add an operational note..."/></label>
        <div className="mt-4 flex flex-wrap gap-2">
          {selected.status==="REQUESTED"&&<>{actionButton("Approve","APPROVE",<CheckCircle2 size={14}/>)}{actionButton("Reject","REJECT",<XCircle size={14}/>)}</>}
          {selected.status==="APPROVED"&&actionButton("Mark in transit","MARK_IN_TRANSIT",<PackageCheck size={14}/>)}
          {(selected.status==="APPROVED"||selected.status==="IN_TRANSIT")&&actionButton("Mark received","MARK_RECEIVED",<PackageCheck size={14}/>)} 
          {selected.status==="REFUND_PROCESSING"&&selected.refund?.method!=="STRIPE"&&selected.refund?.status==="REQUIRES_MANUAL_ACTION"&&actionButton("Confirm verified manual refund","CONFIRM_MANUAL_REFUND",<Wallet size={14}/>)}
          {selected.status==="RECEIVED"&&actionButton("Start inspection","START_INSPECTION",<ClipboardCheck size={14}/>)}
          {selected.status==="REFUND_APPROVED"&&actionButton("Create refund","CREATE_REFUND",<Wallet size={14}/>)}
          {selected.status==="REFUND_PROCESSING"&&selected.refund?.method==="STRIPE"&&selected.refund.status!=="SUCCEEDED"&&<button disabled={busy} onClick={()=>void processStripeRefund()} className="inline-flex items-center gap-2 bg-zinc-900 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-40"><Wallet size={14}/>{selected.refund.status==="PROCESSING"?"RECONCILE STRIPE REFUND":"PROCESS STRIPE REFUND"}</button>}
        </div>
        {selected.status==="INSPECTING"&&<InspectionForm items={selected.items} busy={busy} onSubmit={items=>void act("INSPECT",items)}/>}
      </section></div>}
    </div>
  </div>;
}

function InspectionForm({items,busy,onSubmit}:{items:ReturnRow["items"];busy:boolean;onSubmit:(items:unknown[])=>void}) {
 const [values,setValues]=useState(()=>items.map(i=>({returnItemId:i.id,condition:"GOOD",receivedQuantity:0,restockQuantity:0,inspectionNote:""})));
 const change=(idx:number,key:string,value:string|number)=>setValues(v=>v.map((x,i)=>i===idx?{...x,[key]:value}:x));
 return <form className="mt-5 border-t pt-4" onSubmit={e=>{e.preventDefault();onSubmit(values)}}><h3 className="text-xs font-bold uppercase tracking-widest">Warehouse inspection</h3>{values.map((v,i)=><div key={v.returnItemId} className="mt-3 grid grid-cols-1 gap-2 border border-zinc-700 bg-main p-3 light:border-gray-300 light:bg-zinc-50 sm:grid-cols-3"><p className="text-xs font-bold sm:col-span-3">{items[i].orderItem.variant.product.name} · Requested {items[i].requestedQuantity}</p><label className="text-xs">Condition<select value={v.condition} onChange={e=>change(i,"condition",e.target.value)} className="mt-1 w-full border border-zinc-700 bg-main p-2 text-xs text-white [color-scheme:dark] light:border-gray-300 light:bg-white light:text-zinc-900 light:[color-scheme:light]">{["SEALED","GOOD","DAMAGED","DEFECTIVE","MISSING_PARTS"].map(x=><option key={x} value={x} className="bg-dark text-white light:bg-white light:text-zinc-900">{x}</option>)}</select></label><label className="text-xs">Received<input type="number" min="0" max={items[i].requestedQuantity} value={v.receivedQuantity} onChange={e=>change(i,"receivedQuantity",Math.max(0,Math.min(items[i].requestedQuantity,Number(e.target.value)||0)))} className="mt-1 w-full border p-2"/></label><label className="text-xs">Restock<input type="number" min="0" max={v.receivedQuantity} value={v.restockQuantity} onChange={e=>change(i,"restockQuantity",Math.max(0,Math.min(v.receivedQuantity,Number(e.target.value)||0)))} className="mt-1 w-full border p-2"/></label><label className="text-xs sm:col-span-3">Inspection note<input value={v.inspectionNote} onChange={e=>change(i,"inspectionNote",e.target.value)} placeholder="Inspection note" className="mt-1 w-full border p-2 text-xs"/></label></div>)}<button disabled={busy} className="mt-3 bg-zinc-900 px-4 py-3 text-xs font-bold tracking-widest text-white disabled:opacity-50">SAVE INSPECTION & CALCULATE REFUND</button></form>;
}
