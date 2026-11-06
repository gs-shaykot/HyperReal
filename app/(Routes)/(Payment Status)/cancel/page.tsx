"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Clock3,
} from "lucide-react";

export default function CancelPage() {
  return (
    <main className="theme-aware-route min-h-[calc(100vh-4rem)] bg-[var(--route-page)] px-4 py-16 text-[var(--route-text)] transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center border border-[var(--route-border)] bg-[var(--route-panel)] text-[var(--route-muted)]">
          <Ban size={30} strokeWidth={1.7} />
        </div>

        <h1 className="text-center text-3xl font-black italic uppercase tracking-tight sm:text-5xl">
          Transfer <span className="text-[var(--route-muted)]">Aborted</span>
        </h1>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--route-muted)] sm:text-xs">
          Stripe // Session cancelled by user
        </p>

        <section className="mt-9 w-full border border-[var(--route-border)] bg-[var(--route-panel)] p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--route-muted)]">
                Status
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--route-text)]">
                Cancelled
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--route-muted)]">
                Reference
              </p>
              <p className="mt-2 break-all font-mono text-sm text-[var(--route-text)]">
                CHECKOUT_CANCELLED
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 border-t border-[var(--route-border)] pt-4">
            <Clock3 className="mt-0.5 shrink-0 text-second" size={16} />
            <p className="text-xs leading-6 text-[var(--route-muted)]">
              You exited the payment terminal before completing the transfer.{" "}
              <span className="font-semibold text-[var(--route-text)]">
                No charge was made.
              </span>{" "}
              Your cart is preserved—return whenever you are ready to checkout.
            </p>
          </div>
        </section>

        <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/checkout"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-second px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(204,255,0,0.12)] transition hover:brightness-110"
          >
            Resume transfer <ArrowRight size={14} />
          </Link>
          <Link
            href="/cart"
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-[var(--route-border)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[var(--route-text)] transition hover:border-second hover:text-second"
          >
            <ArrowLeft size={14} />
            Review cart
          </Link>
        </div>

        <Link
          href="/products"
          className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--route-muted)] transition hover:text-second"
        >
          Browse inventory <ArrowRight size={12} />
        </Link>
      </div>
    </main>
  );
}
