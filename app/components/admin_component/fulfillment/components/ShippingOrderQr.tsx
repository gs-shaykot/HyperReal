"use client";

import { useEffect, useState } from "react";

type ShippingOrderQrProps = {
    orderCode: string;
};

export default function ShippingOrderQr({ orderCode }: ShippingOrderQrProps) {
    const [orderUrl, setOrderUrl] = useState("");

    useEffect(() => {
        setOrderUrl(`${window.location.origin}/account/orders?order=${encodeURIComponent(orderCode)}`);
    }, [orderCode]);

    if (!orderUrl) {
        return <div className="h-[88px] w-[88px] bg-white" aria-label="Preparing order QR code" />;
    }

    const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
    qrUrl.searchParams.set("size", "160x160");
    qrUrl.searchParams.set("margin", "2");
    qrUrl.searchParams.set("data", orderUrl);

    return (
        <img
            src={qrUrl.toString()}
            alt={`QR code to view order ${orderCode}`}
            width={88}
            height={88}
            className="border border-white bg-white p-1"
        />
    );
}
