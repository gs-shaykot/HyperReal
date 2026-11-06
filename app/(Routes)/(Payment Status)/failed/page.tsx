"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CircleX,
  RefreshCw,
} from "lucide-react";

export default function FailedPage() {
  const possibleCauses = [
    "Insufficient funds or payment limit reached",
    "Card declined by the issuing bank",
    "Payment gateway temporarily unavailable",
    "Card details or verification mismatch",
    "3D Secure verification was not completed",
  ];

  return (
    <main className="theme-aware-route min-h-[calc(100vh-4rem)] bg-[var(--route-page)] px-4 py-16 text-[var(--route-text)] transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center border border-red-500/50 bg-red-500/5 text-red-500 shadow-[0_0_28px_rgba(239,68,68,0.10)]">
          <CircleX size={30} strokeWidth={1.8} />
        </div>

        <h1 className="text-center text-3xl font-black italic uppercase tracking-tight sm:text-5xl">
          Transfer <span className="text-red-500">Rejected</span>
        </h1>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--route-muted)] sm:text-xs">
          Stripe // Returned error
        </p>

        <section className="mt-9 w-full border border-red-500/30 bg-red-500/[0.035] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-red-500" size={18} />
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--route-muted)]">
                Error detail
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--route-text)]">
                Your payment could not be completed. The payment provider returned an error.
              </p>
              <p className="mt-3 break-words font-mono text-[10px] leading-5 text-[var(--route-muted)]">
                CODE: <span className="text-red-500">PAYMENT_FAILED</span>
                <span className="ml-4">REF: CHECKOUT_ATTEMPT</span>
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 w-full border border-[var(--route-border)] bg-[var(--route-panel)] p-5 sm:p-6">
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-second">
            <span className="mr-2">◉</span>Possible causes
          </h2>
          <ul className="mt-4 space-y-2.5 font-mono text-xs leading-5 text-[var(--route-muted)]">
            {possibleCauses.map((cause) => (
              <li key={cause} className="flex gap-2">
                <span className="text-second">›</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-dashed border-[var(--route-border)] pt-4 font-mono text-[9px] uppercase leading-5 tracking-[0.16em] text-[var(--route-muted)]">
            No payment confirmation was received. Check your bank statement before retrying.
          </div>
        </section>

        <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/checkout"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-second px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(204,255,0,0.12)] transition hover:brightness-110"
          >
            <RefreshCw size={14} />
            Retry transfer
          </Link>
          <Link
            href="/cart"
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-[var(--route-border)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[var(--route-text)] transition hover:border-second hover:text-second"
          >
            <ArrowLeft size={14} />
            Back to cart
          </Link>
        </div>

        <Link
          href="/products"
          className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--route-muted)] transition hover:text-second"
        >
          Continue shopping <ArrowRight size={12} />
        </Link>
      </div>
    </main>
  );
}
