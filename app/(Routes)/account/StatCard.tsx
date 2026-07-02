import type { ReactNode } from "react";

interface Props {
    title: string;
    value: number;
    icon?: ReactNode;
}

export default function StatCard({
    title,
    value,
    icon,
}: Props) {
    return (
        <div className="border border-neutral-700 p-3 bg-[#0f0f0f]">

            {icon ? <div className="mb-2 text-lime-400">{icon}</div> : null}

            <h2 className="text-4xl font-bold">
                {value}
            </h2>

            <p className="text-neutral-500 uppercase mt-3">
                {title}
            </p>

        </div>
    );
}