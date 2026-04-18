"use client";
import { useEffect, useState } from "react";

type NetworkInformationLike = {
  downlink?: number;
  effectiveType?: string;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getEstimatedMbps = async (): Promise<number> => {
  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;

  if (typeof connection?.downlink === "number" && connection.downlink > 0) {
    return connection.downlink;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const start = performance.now();
    const response = await fetch(`/favicon.ico?cacheBust=${Date.now()}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    const blob = await response.blob();
    const elapsedSeconds = (performance.now() - start) / 1000;

    if (elapsedSeconds > 0 && blob.size > 0) {
      const mbps = (blob.size * 8) / elapsedSeconds / 1_000_000;
      return clamp(mbps, 0.2, 100);
    }
  } catch {
    // Ignore and use heuristic fallback below.
  } finally {
    clearTimeout(timeoutId);
  }

  if (connection?.effectiveType === "4g") return 15;
  if (connection?.effectiveType === "3g") return 3;
  if (connection?.effectiveType === "2g") return 0.7;
  if (connection?.effectiveType === "slow-2g") return 0.3;

  return navigator.onLine ? 5 : 0.4;
};

export default function CyberpunkLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("LOADING ASSETS...");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    const runDynamicLoader = async () => {
      const mbps = await getEstimatedMbps();
      if (isCancelled) return;

      // Higher bandwidth means faster progression toward completion.
      const progressStep = clamp(0.3 + mbps * 0.22, 0.35, 3.2);
      const tickMs = clamp(Math.round(85 - mbps * 4), 25, 90);

      interval = setInterval(() => {
        setProgress((prev) => {
          const next = clamp(prev + progressStep, 0, 100);

          if (next > 70) {
            setStatus("SYSTEM INITIALIZING...");
          } else if (next > 35) {
            setStatus("SYNCING DATA STREAM...");
          }

          if (next >= 100) {
            if (interval) clearInterval(interval);
            hideTimeout = setTimeout(() => setLoading(false), 350);
            return 100;
          }

          return next;
        });
      }, tickMs);
    };

    runDynamicLoader();

    return () => {
      isCancelled = true;
      if (interval) clearInterval(interval);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
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
          {Math.trunc(progress)}%
        </p>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-0.75 bg-second opacity-80 shadow-[0_0_25px_#ccff00] animate-[scan]"></div>
      </div>

    </div>
  );
}