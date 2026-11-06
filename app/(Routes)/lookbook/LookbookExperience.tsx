"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Plus, X } from "lucide-react";

type Product = { id: string; name: string; price: number | string; category: { name: string; slug: string }; productImages: { imageUrl: string }[] };
type Hotspot = { number: number; name: string; image: string; match: string; x: number; y: number };
type Look = { number: string; title: string; subtitle: string; description: string; image: string; hotspots: Hotspot[] };

const productImage = (name: string) => `https://res.cloudinary.com/dloasaxt1/image/upload/${name}`;
const looks: Look[] = [
 {number:"01",title:"NEON CYBER-INFILTRATION",subtitle:"HARDCORE TECHWEAR / HEAVY ARTICULATION",description:"A high-voltage urban uniform built around sharp silhouettes, utility layers, and electric-lime accents.",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793892373/look-01-neon-cyber-infiltration_bzrryw.jpg",hotspots:[
  {number:1,name:"TACTICAL SHADES",image:productImage("v1771323361/tactical-shades_cndopx.jpg"),match:"tactical-shades_cndopx",x:50,y:17},
  {number:2,name:"TECH POLO",image:productImage("v1771323367/tech-polo_ifo8xt.jpg"),match:"tech-polo_ifo8xt",x:50,y:30},
  {number:3,name:"TACTICAL VEST LIME",image:productImage("v1771323395/tactical-vest-lime_lnuwpf.png"),match:"tactical-vest-lime_lnuwpf",x:50,y:39},
  {number:4,name:"TECH GLOVES LIME",image:productImage("v1771323394/tech-gloves-lime_pi8ny6.png"),match:"tech-gloves-lime_pi8ny6",x:35,y:53},
  {number:5,name:"CARGO PANT LIME",image:productImage("v1771322050/cargo-pant-lime_ocdnah.png"),match:"cargo-pant-lime_ocdnah",x:50,y:67},
  {number:6,name:"COMBAT BOOT MK-II",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793957084/products/blvxkhzakpazpfnkqn8s.jpg",match:"v1793957084/products/blvxkhzakpazpfnkqn8s.jpg",x:50,y:90}
 ]},
 {number:"02",title:"NIGHT-SHIFT STEALTH",subtitle:"CYBER-ATHLETIC / VELOCITY STREETWEAR",description:"Low-profile black layers, streamlined cuts, and a restrained flash of neon for after-dark movement.",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793892373/look-02-night-shift-stealth_vyw5ko.jpg",hotspots:[
  {number:1,name:"STEALTH BOMBER LIME",image:productImage("v1771323380/stealth-bomber-lime_xdsxit.png"),match:"stealth-bomber-lime_xdsxit",x:50,y:31},
  {number:2,name:"STEALTH SLING LIME",image:productImage("v1771323390/stealth-sling-lime_q5ozoa.png"),match:"stealth-sling-lime_q5ozoa",x:43,y:43},
  {number:3,name:"CYBER WATCH",image:productImage("v1771322260/cyber-watch_jprgyn.jpg"),match:"cyber-watch_jprgyn",x:63,y:54},
  {number:4,name:"STEALTH JOGGER LIME",image:productImage("v1771323380/stealth-jogger-lime_q4iox7.png"),match:"stealth-jogger-lime_q4iox7",x:50,y:68},
  {number:5,name:"STEALTH SLIP LIME",image:productImage("v1771323374/stealth-slip-lime_qswb2t.png"),match:"stealth-slip-lime_qswb2t",x:50,y:90},
  {number:6,name:"TECH POLO LIME",image:productImage("v1771323383/tech-polo-lime_bxg42j.png"),match:"tech-polo-lime_bxg42j",x:55,y:36}
 ]},
 {number:"03",title:"SUB-ZERO INDUSTRIAL",subtitle:"OVERSIZED WEATHERPROOF / INDUSTRIAL UTILITY",description:"Oversized outerwear and rugged utility details meet a cold, industrial visual language.",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793892374/look-03-sub-zero-industrial_yei8cd.jpg",hotspots:[
  {number:1,name:"RIBBED BEANIE LIME",image:productImage("v1771323389/ribbed-beanie-lime_fq8hsj.png"),match:"ribbed-beanie-lime_fq8hsj",x:50,y:12},
  {number:2,name:"PUFFER LINER LIME",image:productImage("v1771323353/puffer-liner-lime_jd61rn.png"),match:"puffer-liner-lime_jd61rn",x:48,y:36},
  {number:3,name:"MODULAR BACKPACK LIME",image:productImage("v1771322483/modular-backpack-lime_vimqir.png"),match:"modular-backpack-lime_vimqir",x:72,y:39},
  {number:4,name:"WIDE TROUSER GREEN",image:productImage("v1771323807/wide-trouser-green_iv2ici.png"),match:"wide-trouser-green_iv2ici",x:50,y:67},
  {number:5,name:"TRAIL RUNNER",image:productImage("v1771323373/trail-runner_if8jhy.jpg"),match:"trail-runner_if8jhy",x:50,y:90}
 ]},
 {number:"04",title:"MATRIX KINETIC",subtitle:"LAYERED HIGH-PERFORMANCE / COMBAT ATHLETICISM",description:"A kinetic mix of technical layers and high-contrast details designed for a bold, graphic silhouette.",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793892374/look-04-matrix-kinetic_dsm6eu.png",hotspots:[
  {number:1,name:"TECH MASK LIME",image:productImage("v1771323392/tech-mask-lime_h9jf0g.png"),match:"tech-mask-lime_h9jf0g",x:50,y:15},
  {number:2,name:"BASE LAYER TOP BLACK",image:productImage("v1771322050/base-layer-top-black_scs4mv.png"),match:"base-layer-top-black_scs4mv",x:62,y:34},
  {number:3,name:"MESH TANK LIME",image:productImage("v1771322484/mesh-tank-lime_be5rbr.png"),match:"mesh-tank-lime_be5rbr",x:40,y:35},
  {number:4,name:"UTILITY SHORTS",image:productImage("v1771323784/utility-shorts-variant_gos7qt.jpg"),match:"utility-shorts-variant_gos7qt",x:50,y:60},
  {number:5,name:"VOID RUNNER V2",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1791471678/products/bfgyxwrsjmwuiginvg7i.jpg",match:"v1791471678/products/bfgyxwrsjmwuiginvg7i.jpg",x:50,y:90}
 ]},
 {number:"05",title:"TOKYO DARKWAVE",subtitle:"QUILTED ARCHITECTURAL / MINIMAL VECTOR",description:"Dark city uniform with modular utility, graphic geometry, and precise neon detailing.",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793892374/look-05-tokyo-darkwave_mksf6s.png",hotspots:[
  {number:1,name:"DATA-STREAM CAP",image:"https://res.cloudinary.com/dloasaxt1/image/upload/v1793957487/products/rdidzckv3gljfewxevpw.jpg",match:"v1793957487/products/rdidzckv3gljfewxevpw.jpg",x:50,y:12},
  {number:2,name:"GEO LONGSLEEVE",image:productImage("v1771322507/geo-longsleeve_qdmr7a.jpg"),match:"geo-longsleeve_qdmr7a",x:50,y:34},
  {number:3,name:"INSULATED GILET LIME",image:productImage("v1771322474/insulated-gilet-lime_zh7c5i.png"),match:"insulated-gilet-lime_zh7c5i",x:50,y:39},
  {number:4,name:"UTILITY BELT VARIANT",image:productImage("v1771323384/utility-belt-variant_yi1pu7.jpg"),match:"utility-belt-variant_yi1pu7",x:50,y:55},
  {number:5,name:"ARTICULATED PANT LIME",image:productImage("v1771322051/articulated-pant-lime_a87yhc.png"),match:"articulated-pant-lime_a87yhc",x:50,y:70},
  {number:6,name:"PLATFORM HIGH",image:productImage("v1771322470/platform-high_qf1uqv.jpg"),match:"platform-high_qf1uqv",x:50,y:91}
 ]}
];
const money=(n:number|string)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(Number(n));

export default function LookbookExperience({
  products,
}: {
  products: Product[];
}) {
  const [activeLook, setActiveLook] = useState<number | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<{
    look: number;
    point: number;
  } | null>(null);

  const matchedProduct = (hotspot: Hotspot) =>
    products.find((product) =>
      product.productImages.some(
        (image) =>
          image.imageUrl === hotspot.image ||
          image.imageUrl.includes(hotspot.match),
      ),
    );

  const selected = activeHotspot
    ? looks[activeHotspot.look].hotspots[activeHotspot.point]
    : null;
  const selectedProduct = selected ? matchedProduct(selected) : null;

  return (
    <div className="theme-aware-route bg-[#080808] text-white">
      {/* Editorial hero */}
      <section className="relative isolate min-h-[58vh] overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_70%_30%,rgba(204,255,0,.12),transparent_45%),linear-gradient(120deg,#050505,#10121a_55%,#050505)]" />
        <div
          className="absolute inset-0 -z-10 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right,#333 1px,transparent 1px),linear-gradient(to bottom,#333 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="mx-auto flex min-h-[58vh] max-w-7xl flex-col justify-end px-5 pb-12 pt-28 md:px-10 md:pb-20">
          <p className="mb-4 font-mono text-xs tracking-[.45em] text-second">
            CURATED EDITORIAL // VOL. 01
          </p>
          <h1 className="font-inter text-6xl font-black uppercase leading-[.82] tracking-tight md:text-8xl lg:text-[10rem]">
            LOOK
            <br />
            <span className="italic text-second">BOOK</span>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-6 text-zinc-400">
            Explore our curated editorial looks.
            <br />
            Click on any image to discover the pieces.
          </p>
          <a
            href="#looks"
            className="mt-8 inline-flex w-fit items-center gap-3 text-xs tracking-widest text-second transition-all hover:gap-5"
          >
            SCROLL TO EXPLORE <ArrowDown size={15} />
          </a>
        </div>
      </section>

      {/* Look collection */}
      <section id="looks" className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
        <div className="mb-10 flex items-end justify-between border-b border-zinc-800 pb-4">
          <div>
            <p className="font-mono text-[10px] tracking-[.35em] text-second">
              THE EDIT
            </p>
            <h2 className="mt-2 text-2xl font-bold md:text-4xl">
              FIVE CURATED LOOKS
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-500">05 / 05</span>
        </div>

        <div className="space-y-16 md:space-y-28">
          {looks.map((look, index) => {
            const active = activeLook === index;

            return (
              <article
                key={look.number}
                className={`grid items-center gap-7 md:grid-cols-2 md:gap-12 ${
                  index % 2 ? "md:[&>div:first-child]:order-2" : ""
                }`}
              >
                {/* Look image and interactive product hotspots */}
                <div className="group relative aspect-[4/5] overflow-hidden bg-[#050505]">
                  <Image
                    src={look.image}
                    alt={look.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/35" />
                  <span className="absolute left-4 top-4 border border-white/20 bg-black/60 px-2 py-1 font-mono text-[9px] tracking-widest">
                    HR / {look.number}
                  </span>

                  {!active && (
                    <button
                      onClick={() => {
                        setActiveLook(index);
                        setActiveHotspot(null);
                      }}
                      className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Explore ${look.title}`}
                    >
                      <span className="inline-flex items-center gap-2 bg-second px-5 py-3 font-mono text-xs font-bold text-black shadow-[0_0_35px_rgba(204,255,0,.25)]">
                        <Plus size={15} /> EXPLORE LOOK
                      </span>
                    </button>
                  )}

                  {active &&
                    look.hotspots.map((point, pointIndex) => (
                      <button
                        key={point.number}
                        style={{
                          left: `${point.x}%`,
                          top: `${point.y}%`,
                        }}
                        onClick={() =>
                          setActiveHotspot({ look: index, point: pointIndex })
                        }
                        className={`absolute z-10 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-second bg-black/85 text-second shadow-[0_0_0_7px_rgba(204,255,0,.13)] transition-transform hover:scale-125 ${
                          activeHotspot?.look === index &&
                          activeHotspot.point === pointIndex
                            ? "scale-125"
                            : "animate-pulse"
                        }`}
                        aria-label={`${point.name}`}
                        title={point.name}
                      >
                        <Plus size={17} />
                      </button>
                    ))}

                  {active && (
                    <button
                      onClick={() => {
                        setActiveLook(null);
                        setActiveHotspot(null);
                      }}
                      className="absolute bottom-4 left-4 inline-flex items-center gap-2 border border-white/30 bg-black/70 px-3 py-2 font-mono text-[10px] text-white"
                    >
                      <X size={13} /> CLOSE HOTSPOTS
                    </button>
                  )}
                </div>

                {/* Look information and product list */}
                <div className="relative py-3 md:px-3">
                  <span className="pointer-events-none absolute -top-10 left-0 font-inter text-8xl font-black text-white/[.035] md:-top-16 md:text-[10rem]">
                    {look.number}
                  </span>
                  <p className="relative font-mono text-[10px] tracking-[.3em] text-second">
                    LOOK / {look.number}
                  </p>
                  <h3 className="relative mt-3 max-w-xl font-inter text-3xl font-black uppercase leading-tight md:text-5xl">
                    {look.title}
                  </h3>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                    {look.subtitle}
                  </p>
                  <p className="mt-5 max-w-md text-sm leading-6 text-zinc-500">
                    {look.description}
                  </p>

                  <div className="mt-7 max-w-md divide-y divide-zinc-800 border-y border-zinc-800">
                    {look.hotspots.map((hotspot) => {
                      const product = matchedProduct(hotspot);

                      return (
                        <button
                          key={hotspot.number}
                          onClick={() => {
                            setActiveLook(index);
                            setActiveHotspot({
                              look: index,
                              point: hotspot.number - 1,
                            });
                          }}
                          className="flex w-full items-center justify-between gap-4 py-3 text-left text-xs hover:text-second"
                        >
                          <span className="truncate">
                            <span className="mr-3 font-mono text-second">
                              {String(hotspot.number).padStart(2, "0")}
                            </span>
                            {product?.name ?? hotspot.name}
                          </span>
                          <span className="shrink-0 text-zinc-500">
                            {product ? money(product.price) : "—"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setActiveLook(active ? null : index);
                      setActiveHotspot(null);
                    }}
                    className="mt-6 inline-flex items-center gap-2 font-mono text-xs tracking-wider text-second transition-all hover:gap-4"
                  >
                    {active ? "HIDE LOOK DETAILS" : "VIEW FULL LOOK"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Closing editorial section */}
      <section className="border-y border-zinc-800 bg-[radial-gradient(ellipse_at_50%_100%,rgba(204,255,0,.06),transparent_55%)] px-5 py-20 text-center md:py-28">
        <p className="font-mono text-[10px] tracking-[.4em] text-second">
          STYLE IS A SYSTEM
        </p>
        <h2 className="mt-4 font-inter text-4xl font-black uppercase md:text-7xl">
          BEYOND <span className="italic text-second">CONVENTION</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-500">
          Experimental silhouettes. Technical layers. Unapologetic identity.
          Explore the pieces and build your own uniform.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-2 bg-second px-5 py-3 font-mono text-xs font-bold text-black hover:brightness-110"
        >
          SHOP COLLECTION <ArrowRight size={14} />
        </Link>
      </section>

      {/* Product hotspot detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveHotspot(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md border border-zinc-800 bg-[#0b0b0b] p-5 shadow-2xl"
          >
            <button
              onClick={() => setActiveHotspot(null)}
              className="absolute right-3 top-3 z-10 p-2 text-zinc-400 hover:text-second"
              aria-label="Close product details"
            >
              <X size={18} />
            </button>
            <div className="relative mb-5 aspect-square bg-black">
              <Image
                src={selected.image}
                alt={selected.name}
                fill
                sizes="400px"
                className="object-contain p-4"
              />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-second">
              LOOK {looks[activeHotspot!.look].number} / PRODUCT DETAILS
            </p>
            <h3 className="mt-2 text-xl font-bold">
              {selectedProduct?.name ?? selected.name}
            </h3>
            <p className="mt-3 text-lg text-second">
              {selectedProduct
                ? money(selectedProduct.price)
                : "Product record not matched"}
            </p>

            {selectedProduct ? (
              <Link
                href={`/products/${selectedProduct.id}`}
                className="mt-5 flex items-center justify-center gap-2 bg-second py-3 font-mono text-xs font-bold text-black"
              >
                VIEW PRODUCT <ArrowRight size={14} />
              </Link>
            ) : (
              <p className="mt-4 text-xs text-zinc-500">
                This exact image is not currently matched to a product image in
                the catalog.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
