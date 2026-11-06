"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, House, ShoppingBag } from "lucide-react";

export default function NotFound() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <main className="theme-aware-route signal-404 relative min-h-[calc(100svh-4rem)] overflow-hidden bg-[var(--route-page)] text-[var(--route-text)]">
            <div aria-hidden="true" className="signal-404__grid" />
            <div aria-hidden="true" className="signal-404__radial" />
            <div aria-hidden="true" className="signal-404__scanner">
                <span />
            </div>

            <section className="signal-404__content relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-5xl flex-col items-center justify-center px-5 py-20 text-center">
                <p className="mb-5 font-mono text-xs tracking-[0.45em] text-second sm:text-sm">
                    // ERR_SIGNAL_LOST
                </p>

                <div className="signal-404__number relative select-none font-sans text-[clamp(8rem,25vw,18rem)] font-black leading-[0.8] tracking-[-0.09em]">
                    <span>404</span>
                    <span aria-hidden="true" className="signal-404__number-ghost">404</span>
                </div>

                <div className="signal-404__terminal mt-12 w-full max-w-md text-left">
                    <div className="signal-404__corner signal-404__corner--tl" />
                    <div className="signal-404__corner signal-404__corner--br" />
                    <p className="font-mono text-xs text-[var(--route-muted)]">
                        <span className="mr-2 text-second">&gt;</span>requested_path:
                    </p>
                    <p className="mt-2 break-all font-mono text-sm font-semibold">{pathname || "/unknown"}</p>
                    <p className="mt-4 font-mono text-xs text-[var(--route-muted)]">
                        <span className="mr-2 text-second">&gt;</span>status:
                        <span className="ml-2 text-red-500">NOT_FOUND</span>
                    </p>
        </div>

                <p className="mt-7 max-w-sm font-mono text-sm leading-6 text-[var(--route-muted)]">
                    This sector of the grid has gone dark. The page you&apos;re hunting doesn&apos;t exist — or was never coded.
                </p>

                <div className="signal-404__actions mt-10 flex flex-wrap items-center justify-center gap-3">
                    <Link href="/" className="signal-404__button signal-404__button--primary">
                        <House size={16} /> RETURN HOME
                    </Link>
                    <Link href="/products" className="signal-404__button signal-404__button--outline">
                        <ShoppingBag size={16} /> SHOP PRODUCTS
                    </Link>
                    <button type="button" onClick={() => router.back()} className="signal-404__button signal-404__button--ghost">
                        <ArrowLeft size={16} /> GO BACK
                    </button>
                </div>

                <Link href="/products" className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-[var(--route-muted)] transition-colors hover:text-second">
                    BROWSE INVENTORY <ArrowRight size={12} />
                </Link>
            </section>
        </main>
    );
}
