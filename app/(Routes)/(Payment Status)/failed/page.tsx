"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, CircleX, RefreshCw } from "lucide-react";

export default function FailedPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#080808] px-4 py-16 text-white">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
        {/* Status mark */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center border border-red-500/60 bg-red-500/[0.06] text-red-500">
          <CircleX size={30} strokeWidth={1.8} />
        </div>

        {/* Heading */}
        <h1 className="text-center text-3xl font-black italic uppercase tracking-tight sm:text-4xl">
          Transfer <span className="text-red-500">Rejected</span>
        </h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500 sm:text-xs">
          Stripe // Returned error
        </p>

        {/* Error detail */}
        <section className="mt-8 w-full border border-red-500/30 bg-red-950/10 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-red-500" size={17} />
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                Error detail
              </p>
              <p className="mt-2 text-sm text-zinc-200">
                Your payment could not be completed. The payment provider returned an error.
              </p>
              <p className="mt-3 break-words font-mono text-[10px] leading-5 text-zinc-500">
                CODE: <span className="text-red-400">PAYMENT_FAILED</span>
                <span className="ml-4">REF: CHECKOUT_ATTEMPT</span>
              </p>
            </div>
          </div>
        </section>

        {/* Possible causes */}
        <section className="mt-4 w-full border border-zinc-800 bg-[#0d0d0d] p-5 sm:p-6">
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-second">
            ◉ Possible causes
          </h2>
          <ul className="mt-4 space-y-2.5 font-mono text-xs leading-5 text-zinc-400">
            {[
              "Insufficient funds or payment limit reached",
              "Card declined by the issuing bank",
              "Payment gateway temporarily unavailable",
              "Card details or verification mismatch",
              "3D Secure verification was not completed",
            ].map((cause) => (
              <li key={cause} className="flex gap-2">
                <span className="text-second">›</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-dashed border-zinc-800 pt-4 font-mono text-[9px] uppercase leading-5 tracking-[0.16em] text-zinc-500">
            No payment confirmation was received. Check your bank statement before retrying.
          </div>
        </section>

        {/* Actions */}
        <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/checkout"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-second px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black transition hover:brightness-110"
          >
            <RefreshCw size={14} />
            Retry transfer
          </Link>
          <Link
            href="/cart"
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-zinc-600 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:border-white"
          >
            <ArrowLeft size={14} />
            Back to cart
          </Link>
        </div>

        <Link
          href="/products"
          className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 transition hover:text-second"
        >
          Continue shopping <ArrowRight size={12} />
        </Link>
      </div>
    </main>
  );
}
