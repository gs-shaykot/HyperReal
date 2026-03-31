"use client";

import { useEffect, useState } from "react";

export default function CyberpunkLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => setLoading(false), 800);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-black flex flex-col items-center justify-center text-second font-mono">

      {/* Logo */}
      <h1 className="text-4xl md:text-6xl font-bold tracking-widest animate-pulse">
        HYPER<span className="text-white">REAL</span>
      </h1>

      {/* Status text */}
      <p className="mt-4 text-xs tracking-[0.3em] opacity-70">
        SYSTEM INITIALIZING...
      </p>

      {/* Loading bar */}
      <div className="mt-6 w-64 h-0.5 bg-zinc-800 overflow-hidden">
        <div className="h-full bg-second animate-[loadingBar]"></div>
      </div>

      {/* Scan line */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="w-full h-0.5 bg-second opacity-20 animate-[scan]"></div>
      </div>

    </div>
  );
}