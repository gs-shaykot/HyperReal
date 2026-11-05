"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Plus, X } from "lucide-react";

type Product = { id: string; name: string; price: number; category: { name: string; slug: string }; productImages: { imageUrl: string }[] };
type Look = { number: string; title: string; subtitle: string; description: string; image: string; positions: { x: number; y: number }[] };

const looks: Look[] = [
 {number:"01",title:"NEON CYBER-INFILTRATION",subtitle:"HARDCORE TECHWEAR / HEAVY ARTICULATION",description:"A high-voltage urban uniform built around sharp silhouettes, utility layers, and electric-lime accents.",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793892373/look-01-neon-cyber-infiltration_bzrryw.jpg",positions:[{x:53,y:34},{x:49,y:66},{x:52,y:91}]},
 {number:"02",title:"NIGHT-SHIFT STEALTH",subtitle:"CYBER-ATHLETIC / VELOCITY STREETWEAR",description:"Low-profile black layers, streamlined cuts, and a restrained flash of neon for after-dark movement.",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793892373/look-02-night-shift-stealth_vyw5ko.jpg",positions:[{x:51,y:28},{x:50,y:62},{x:52,y:88}]},
 {number:"03",title:"MATRIX KINETIC",subtitle:"LAYERED HIGH-PERFORMANCE / COMBAT ATHLETICISM",description:"A kinetic mix of technical layers and high-contrast details designed for a bold, graphic silhouette.",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793892374/look-04-matrix-kinetic_dsm6eu.png",positions:[{x:50,y:25},{x:51,y:58},{x:52,y:87}]},
 {number:"04",title:"SUB-ZERO INDUSTRIAL",subtitle:"OVERSIZED WEATHERPROOF / INDUSTRIAL UTILITY",description:"Oversized outerwear and rugged utility details meet a cold, industrial visual language.",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793892374/look-03-sub-zero-industrial_yei8cd.jpg",positions:[{x:49,y:24},{x:50,y:60},{x:52,y:89}]},
 {number:"05",title:"TOKYO DARKWAVE",subtitle:"QUILTED ARCHITECTURAL / MINIMAL VECTOR",description:"Dark city uniform with modular utility, graphic geometry, and precise neon detailing.",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793892374/look-05-tokyo-darkwave_mksf6s.png",positions:[{x:50,y:26},{x:50,y:61},{x:52,y:88}]}
];
const money=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);

export default function LookbookExperience({products}:{products:Product[]}) {
 const [activeLook,setActiveLook]=useState<number|null>(null);
 const [activeProduct,setActiveProduct]=useState<Product|null>(null);
 const productFor=(look:number,point:number)=>products.length?products[(look*3+point)%products.length]:null;
 return <div className="theme-aware-route bg-[#080808] text-white">
  <section className="relative isolate min-h-[58vh] overflow-hidden border-b border-zinc-800">
   <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_70%_30%,rgba(204,255,0,.12),transparent_45%),linear-gradient(120deg,#050505,#10121a_55%,#050505)]"/>
   <div className="absolute inset-0 -z-10 opacity-20" style={{backgroundImage:"linear-gradient(to right,#333 1px,transparent 1px),linear-gradient(to bottom,#333 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
   <div className="mx-auto flex min-h-[58vh] max-w-7xl flex-col justify-end px-5 pb-12 pt-28 md:px-10 md:pb-20">
    <p className="mb-4 font-mono text-xs tracking-[.45em] text-second">CURATED EDITORIAL // VOL. 01</p>
    <h1 className="font-inter text-6xl font-black uppercase leading-[.82] tracking-tight md:text-8xl lg:text-[10rem]">LOOK<br/><span className="italic text-second">BOOK</span></h1>
    <p className="mt-7 max-w-md text-sm leading-6 text-zinc-400">Explore our curated editorial looks.<br/>Click on any image to discover the pieces.</p>
    <a href="#looks" className="mt-8 inline-flex w-fit items-center gap-3 text-xs tracking-widest text-second hover:gap-5 transition-all">SCROLL TO EXPLORE <ArrowDown size={15}/></a>
   </div>
  </section>
  <section id="looks" className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
   <div className="mb-10 flex items-end justify-between border-b border-zinc-800 pb-4"><div><p className="font-mono text-[10px] tracking-[.35em] text-second">THE EDIT</p><h2 className="mt-2 text-2xl font-bold md:text-4xl">FIVE CURATED LOOKS</h2></div><span className="font-mono text-xs text-zinc-500">05 / 05</span></div>
   <div className="space-y-16 md:space-y-28">{looks.map((look,index)=>{
    const active=activeLook===index; const associated=[0,1,2].map(p=>productFor(index,p)).filter((p):p is Product=>Boolean(p));
    return <article key={look.number} className={`grid items-center gap-7 md:grid-cols-2 md:gap-12 ${index%2?"md:[&>div:first-child]:order-2":""}`}>
     <div className="group relative aspect-[4/5] overflow-hidden bg-[#050505]">
      <Image src={look.image} alt={look.title} fill priority={index===0} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"/>
      <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/35"/>
      <span className="absolute left-4 top-4 border border-white/20 bg-black/60 px-2 py-1 font-mono text-[9px] tracking-widest">HR / {look.number}</span>
      {!active&&<button onClick={()=>setActiveLook(index)} className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus:opacity-100" aria-label={`Explore ${look.title}`}><span className="inline-flex items-center gap-2 bg-second px-5 py-3 font-mono text-xs font-bold text-black shadow-[0_0_35px_rgba(204,255,0,.25)]"><Plus size={15}/> EXPLORE LOOK</span></button>}
      {active&&look.positions.map((pos,point)=>{const product=productFor(index,point);return <button key={point} style={{left:`${pos.x}%`,top:`${pos.y}%`}} onClick={()=>product&&setActiveProduct(product)} className="absolute z-10 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-second bg-black/80 text-second shadow-[0_0_0_7px_rgba(204,255,0,.12)] transition-transform hover:scale-125 animate-pulse" aria-label={product?`View ${product.name}`:"Product hotspot"}><Plus size={17}/></button>})}
      {active&&<button onClick={()=>setActiveLook(null)} className="absolute bottom-4 left-4 inline-flex items-center gap-2 border border-white/30 bg-black/70 px-3 py-2 font-mono text-[10px] text-white"><X size={13}/> CLOSE HOTSPOTS</button>}
     </div>
     <div className="relative py-3 md:px-3"><span className="pointer-events-none absolute -top-10 left-0 font-inter text-8xl font-black text-white/[.035] md:-top-16 md:text-[10rem]">{look.number}</span>
      <p className="relative font-mono text-[10px] tracking-[.3em] text-second">LOOK / {look.number}</p><h3 className="relative mt-3 max-w-xl font-inter text-3xl font-black uppercase leading-tight md:text-5xl">{look.title}</h3>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-400">{look.subtitle}</p><p className="mt-5 max-w-md text-sm leading-6 text-zinc-500">{look.description}</p>
      <div className="mt-7 max-w-md divide-y divide-zinc-800 border-y border-zinc-800">{associated.map(p=><button key={p.id} onClick={()=>{setActiveLook(index);setActiveProduct(p)}} className="flex w-full items-center justify-between gap-4 py-3 text-left text-xs hover:text-second"><span className="truncate">{p.name}</span><span className="shrink-0 text-zinc-500">{money(p.price)}</span></button>)}</div>
      <button onClick={()=>setActiveLook(active?null:index)} className="mt-6 inline-flex items-center gap-2 font-mono text-xs tracking-wider text-second hover:gap-4 transition-all">{active?"HIDE LOOK DETAILS":"VIEW FULL LOOK"} <ArrowRight size={14}/></button>
     </div>
    </article>
   })}</div>
  </section>
  <section className="border-y border-zinc-800 bg-[radial-gradient(ellipse_at_50%_100%,rgba(204,255,0,.06),transparent_55%)] px-5 py-20 text-center md:py-28"><p className="font-mono text-[10px] tracking-[.4em] text-second">STYLE IS A SYSTEM</p><h2 className="mt-4 font-inter text-4xl font-black uppercase md:text-7xl">BEYOND <span className="italic text-second">CONVENTION</span></h2><p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-500">Experimental silhouettes. Technical layers. Unapologetic identity. Explore the pieces and build your own uniform.</p><Link href="/products" className="mt-8 inline-flex items-center gap-2 bg-second px-5 py-3 font-mono text-xs font-bold text-black hover:brightness-110">SHOP COLLECTION <ArrowRight size={14}/></Link></section>
  {activeProduct&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={()=>setActiveProduct(null)}><div role="dialog" aria-modal="true" aria-label={activeProduct.name} onClick={e=>e.stopPropagation()} className="relative w-full max-w-md border border-zinc-800 bg-[#0b0b0b] p-5 shadow-2xl"><button onClick={()=>setActiveProduct(null)} className="absolute right-3 top-3 z-10 p-2 text-zinc-400 hover:text-second" aria-label="Close product details"><X size={18}/></button><div className="relative mb-5 aspect-square bg-black">{activeProduct.productImages[0]?.imageUrl&&<Image src={activeProduct.productImages[0].imageUrl} alt={activeProduct.name} fill sizes="400px" className="object-contain p-4"/>}</div><p className="font-mono text-[10px] uppercase tracking-widest text-second">{activeProduct.category.name}</p><h3 className="mt-2 text-xl font-bold">{activeProduct.name}</h3><p className="mt-3 text-lg text-second">{money(activeProduct.price)}</p><Link href={`/products/${activeProduct.id}`} className="mt-5 flex items-center justify-center gap-2 bg-second py-3 font-mono text-xs font-bold text-black">VIEW PRODUCT <ArrowRight size={14}/></Link></div></div>}
 </div>;
}