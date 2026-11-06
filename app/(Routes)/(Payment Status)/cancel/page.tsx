"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Ban, Clock3 } from "lucide-react";

export default function CancelPage() {
  return (
    <main className="theme-aware-route min-h-[calc(100vh-4rem)] bg-[var(--route-page)] px-4 py-16 text-[var(--route-text)]">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center border border-zinc-700 bg-zinc-900/50 text-zinc-400">
          <Ban size={30} strokeWidth={1.7} />
        </div>

        <h1 className="text-center text-3xl font-black italic uppercase tracking-tight sm:text-4xl">
          Transfer <span className="text-zinc-400">Aborted</span>
        </h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500 sm:text-xs">
          Stripe // Session cancelled by user
        </p>

        <section className="mt-8 w-full border border-zinc-800 bg-[#0d0d0d] p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500">
                Status
              </p>
              <p className="mt-2 text-sm text-zinc-200">Cancelled</p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500">
                Reference
              </p>
              <p className="mt-2 break-all font-mono text-sm text-zinc-200">
                CHECKOUT_CANCELLED
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 border-t border-zinc-800 pt-4">
            <Clock3 className="mt-0.5 shrink-0 text-second" size={15} />
            <p className="text-xs leading-6 text-zinc-400">
              You exited the payment terminal before completing the transfer.{" "}
              <span className="font-semibold text-white">No charge was made.</span>{" "}
              Your cart is preserved—return whenever you are ready to checkout.
            </p>
          </div>
        </section>

        <div className="mt-5 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/checkout"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-second px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black transition hover:brightness-110"
          >
            Resume transfer <ArrowRight size={14} />
          </Link>
          <Link
            href="/cart"
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-zinc-600 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[var(--route-text)] transition hover:border-current"
          >
            <ArrowLeft size={14} />
            Review cart
          </Link>
        </div>

        <Link
          href="/products"
          className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 transition hover:text-second"
        >
          Browse inventory <ArrowRight size={12} />
        </Link>
      </div>
    </main>
  );
}
