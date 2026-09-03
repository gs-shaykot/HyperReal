import { requireSession } from "@/lib/auth/requireSession";

export default async function CartLayout({ children }: { children: React.ReactNode; }) {
    await requireSession("/cart");

    return <>{children}</>;
}