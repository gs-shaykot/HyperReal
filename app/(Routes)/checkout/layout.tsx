import { requireSession } from "@/lib/auth/requireSession";

export default async function CheckoutLayout({ children }: { children: React.ReactNode; }) {
    await requireSession("/checkout");

    return <>{children}</>;
}