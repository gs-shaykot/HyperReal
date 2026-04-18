"use client";

import { useEffect, useState } from "react";
 
export default function CyberpunkLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("LOADING ASSETS...");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 400);
          return 100;
        } 
        if (prev > 40) {
          setStatus("SYSTEM INITIALIZING...");
        }

        return prev + 1;
      });
    }, 25);

    return () => clearInterval(interval);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-9999 light:bg-white bg-main flex flex-col items-center justify-center font-mono text-second overflow-hidden">
 
      <h1 className="relative text-5xl md:text-7xl font-bold tracking-widest glitch light:text-black text-white">
        HYPER<span className="text-second">REAL</span>
      </h1>
 
      <p className="mt-6 text-xs tracking-[0.4em] opacity-80 light:text-black text-white">
        {status}
      </p> 
      <div className="mt-6 w-72">
        <div className="h-0.5 bg-zinc-300 relative overflow-hidden">
          <div
            className="h-full bg-second transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
 
        <p className="mt-2 text-[10px] tracking-widest opacity-70 text-right light:text-black text-white">
          {progress}%
        </p>
      </div>
 
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-0.75 bg-second opacity-80 shadow-[0_0_25px_#ccff00] animate-[scan]"></div>
      </div>

    </div>
  );
}