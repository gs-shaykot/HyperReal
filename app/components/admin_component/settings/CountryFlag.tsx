
"use client";

import { useState } from "react";

type CountryFlagProps = {
    code: string;
    size?: 16 | 24 | 32 | 48 | 64;
    className?: string;
};

export default function CountryFlag({
    code,
    size = 24,
    className = "",
}: CountryFlagProps) {
    const [imageFailed, setImageFailed] = useState(false);
    const normalizedCode = code.trim().toUpperCase();

    if (!/^[A-Z]{2}$/.test(normalizedCode) || imageFailed) {
        return (
            <span
                className={`inline-flex shrink-0 items-center justify-center font-mono text-[10px] font-bold ${className}`}
                style={{ width: size, height: Math.round(size * 0.7) }}
                aria-label={`Country code ${normalizedCode}`}
            >
                {normalizedCode}
            </span>
        );
    }

    return (
        <img
            src={`https://flagsapi.com/${normalizedCode}/flat/${size}.png`}
            alt={`${normalizedCode} flag`}
            width={size}
            height={Math.round(size * 0.7)}
            onError={() => setImageFailed(true)}
            className={`inline-block shrink-0 object-contain ${className}`}
            loading="lazy"
        />
    );
}
