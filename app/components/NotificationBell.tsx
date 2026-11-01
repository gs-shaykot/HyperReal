"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";

type Notice = { id:string; type:string; title:string; message:string; href:string|null; readAt:string|null; createdAt:string };
type Payload = { success:boolean; data:Notice[]; unreadCount:number };

export default function NotificationBell() {
  const queryClient=useQueryClient();
  const {data,isLoading}=useQuery<Payload>({
    queryKey:["accountNotifications"],
    queryFn:async()=>{const r=await fetch("/api/account/notifications",{cache:"no-store"});if(!r.ok)throw new Error("Could not load notifications");return r.json();},
    refetchInterval:30000,
  });
  const markRead=useMutation({
    mutationFn:async(notificationId:string)=>{const r=await fetch("/api/account/notifications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({notificationId})});if(!r.ok)throw new Error("Could not update notification");},
    onSuccess:()=>queryClient.invalidateQueries({queryKey:["accountNotifications"]}),
  });
  const markAll=useMutation({
    mutationFn:async()=>{const r=await fetch("/api/account/notifications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({markAll:true})});if(!r.ok)throw new Error("Could not update notifications");},
    onSuccess:()=>queryClient.invalidateQueries({queryKey:["accountNotifications"]}),
  });
  const unread=data?.unreadCount||0;
  return <div className="dropdown dropdown-end">
    <button type="button" tabIndex={0} aria-label={`Notifications, ${unread} unread`} className="btn btn-ghost btn-circle relative text-white light:text-zinc-900">
      <Bell size={19} strokeWidth={1.5}/>
      {unread>0&&<span className="badge badge-xs absolute right-0 top-0 border border-main bg-second px-1 text-[9px] text-black">{unread>99?"99+":unread}</span>}
    </button>
    <div tabIndex={0} className="dropdown-content z-[60] mt-3 w-[min(92vw,380px)] overflow-hidden rounded-box border border-zinc-700 bg-main text-white shadow-xl light:border-gray-300 light:bg-white light:text-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-700 p-3 light:border-gray-200"><div><p className="text-sm font-bold">Notifications</p><p className="text-[11px] text-zinc-400 light:text-zinc-500">{unread} unread</p></div><button type="button" disabled={!unread||markAll.isPending} onClick={()=>markAll.mutate()} className="flex items-center gap-1 text-[11px] font-semibold text-second disabled:opacity-40"><CheckCheck size={14}/> Mark all read</button></div>
      <div className="max-h-[380px] overflow-y-auto">{isLoading?<p className="p-6 text-center text-xs text-zinc-400">Loading notifications…</p>:!data?.data.length?<p className="p-6 text-center text-xs text-zinc-400">You're all caught up.</p>:data.data.map(n=><div key={n.id} className={`border-b border-zinc-800 p-3 last:border-0 light:border-gray-100 ${n.readAt?"opacity-70":"bg-second/5"}`}>
        <div className="flex items-start gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt?"bg-zinc-500":"bg-second"}`}/><div className="min-w-0 flex-1"><p className="text-xs font-bold">{n.title}</p><p className="mt-1 text-xs leading-relaxed text-zinc-400 light:text-zinc-600">{n.message}</p><p className="mt-1 text-[10px] text-zinc-500">{new Date(n.createdAt).toLocaleString()}</p><div className="mt-2 flex items-center gap-3">{n.href&&<Link href={n.href} onClick={()=>{if(!n.readAt)markRead.mutate(n.id)}} className="text-[11px] font-bold text-second">View details</Link>}{!n.readAt&&<button type="button" onClick={()=>markRead.mutate(n.id)} className="text-[11px] text-zinc-400 hover:text-second">Mark read</button>}</div></div></div>
      </div>)}</div>
    </div>
  </div>;
}
