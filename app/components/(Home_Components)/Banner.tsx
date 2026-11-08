'use client';

import { ArrowDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export const Banner = () => {
  return (
    <section className="light:bg-white light:border-zinc-400 bg-main/80 border-zinc-800 relative overflow-hidden border-b">
      <div
        className="absolute inset-0 light:opacity-10 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center space-y-3 px-4 py-8 md:py-14 lg:py-16">
        <p className="light:text-zinc-900 light:border-second text-second border-zinc-800 border p-2 font-mono text-sm tracking-wider">
          • SYSTEM ONLINE // V.4.0
        </p>
        <div className="flex flex-col items-center justify-center space-y-3">
          <h1 className="text-center font-extrabold">
            <span className="light:text-zinc-900 text-white block text-6xl italic md:text-8xl">
              DEFY THE
            </span>
            <span className="text-second stroke-text block text-6xl italic md:text-8xl">
              ORDINARY
            </span>
          </h1>
          <p className="light:text-zinc-900 text-white w-10/12 text-center text-sm md:w-8/12 md:text-base lg:w-6/12">
            The new collection features technical fabrics, oversized silhouettes, and experimental dyes designed for the urban nomad.
          </p>
        </div>
        <div className="mt-3 flex flex-col items-center justify-center gap-3 md:flex-row">
          <Link href="/products">
            <button className="light:text-white text-black group relative flex btn rounded-none border-0 bg-second font-bold shadow-none transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(163,230,53,0.8)]">
              <span className="flex items-center gap-2">
                SHOP THE DROP
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </Link>
          <Link
            href="/lookbook"
            className="btn rounded-none border-2 border-white bg-transparent font-bold shadow-none transition-all duration-500 hover:scale-105 hover:bg-white hover:text-zinc-900 light:border-zinc-900 light:hover:bg-black light:hover:text-white"
          >
            VIEW LOOKBOOK <ArrowRight />
          </Link>
        </div>
      </div>
      <motion.p
        initial={{ y: -10 }}
        animate={{ y: 10 }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="light:text-zinc-900 flex items-center text-zinc-400 absolute bottom-5 left-5 font-mono text-[10px] tracking-wider md:bottom-7 md:left-8"
      >
        SCROLL <ArrowDown /> DOWN
      </motion.p>
    </section>
  );
};