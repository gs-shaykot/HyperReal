"use client"

import {
  CheckCircle2,
  CalendarDays,
  Download,
  Printer,
  ArrowRight,
  ReceiptText,
  Globe,
  Shield,
} from "lucide-react";
import { useMemo } from "react";

export const SuccessPage = ({ order, user }: { order: any; user: any }) => {
  const formattedDate = new Date(order?.createdAt).toLocaleDateString("en-GB");
  const totalInUSD = order?.totalAmountInUSD || 0;
  const totalInBDT = order?.totalAmount || 0;
  const discount = order?.discount || 0;
 

  return (
    <section className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-162.5">
        {/* Top Success */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 border border-lime-400 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8 text-lime-400" strokeWidth={2.5} />
          </div>

          <h1 className="text-[58px] leading-none font-black uppercase italic tracking-[-3px]">
            <span className="text-white">Transfer</span>{" "}
            <span className="text-lime-400">Complete</span>
          </h1>

          <p className="mt-4 text-[10px] uppercase tracking-[5px] text-zinc-400">
            Authorized // {order.payments[0]?.method} // {order.payments[0]?.transactionId || "TXN-PREVIEW-MPDWWHHQ"}
          </p>
        </div>

        {/* Receipt Card */}
        <div className="border border-zinc-800 bg-[#050505] px-8 py-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-dashed border-zinc-800 pb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[4px] text-zinc-500 mb-3">
                Cargo Receipt
              </p>

              <h2 className="text-3xl font-black uppercase italic tracking-tight">
                HYPER<span className="text-second">REAL</span>
              </h2>

              <p className="mt-1 text-[10px] uppercase tracking-[3px] text-zinc-500">
                // Techwear Division
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[4px] text-zinc-500 mb-3">
                Order ID
              </p>

              <h3 className="text-lime-400 font-bold uppercase tracking-wide">
                {order.orderCode}
              </h3>

              <div className="mt-2 flex items-center justify-end gap-2 text-zinc-400 text-xs">
                <CalendarDays className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-8 border-b border-dashed border-zinc-800 py-5">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-zinc-500">
                <ReceiptText className="w-3 h-3" />
                <p className="text-xs uppercase tracking-[4px]">Gateway</p>
              </div>

              <p className="font-medium uppercase">{order.payments[0]?.method}</p>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-zinc-500">
                <Shield className="w-3 h-3" />
                <p className="text-xs uppercase tracking-[4px]">Method</p>
              </div>

              <p className="font-medium uppercase">Standard</p>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-zinc-500">
                <Globe className="w-3 h-3" />
                <p className="text-xs uppercase tracking-[4px]">Region</p>
              </div>

              <p className="font-medium uppercase">{order.payments[0]?.country}</p>
            </div>
          </div>

          {/* Address */}
          <div className="border-b border-dashed border-zinc-800 py-5">
            <p className="text-[10px] uppercase tracking-[4px] text-zinc-500 mb-2">
              Drop Coordinates
            </p>

            <div className="space-y-1">
              <h4 className="font-black uppercase">{user?.name}</h4>

              <p className="text-zinc-400">{user?.email}</p>

              <p className="text-zinc-400">{order?.address}</p>
            </div>
          </div>

          {/* Product */}
          <div className="border-b border-dashed border-zinc-800 py-5">
            <p className="text-xs uppercase tracking-[4px] text-zinc-500 mb-4">
              Manifest
            </p>

            {
              order.orderItems.map((item: any, index: number) => (
                <div key={index} className={`flex items-start justify-between gap-6 text-sm ${index === order.orderItems.length - 1 ? "mb-0" : "mb-3"}`}>
                  <div>
                    <h4 className="font-medium uppercase tracking-wide">
                      {item.variant.product.name} [{item.variant.size}] × {item.quantity}
                    </h4>
                  </div>

                  <p className="font-medium text-lime-400 whitespace-nowrap">
                    ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))
            }
          </div>

          {/* Totals + QR */}
          <div className="flex flex-col md:flex-row justify-between gap-10 py-8 border-b border-dashed border-zinc-800">
            {/* Totals */}
            <div className="flex-1 max-w-sm">
              <div >
                <div className=" border-b border-dashed border-zinc-800 pb-2 space-y-4">
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">${totalInUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Shipping</span>
                    <span className="font-semibold text-white">$10.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Discount</span>
                    <span className="font-semibold text-white">-${discount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl font-black uppercase">
                    Total Paid
                  </span>

                  <span className="text-2xl font-black text-lime-400">
                    $250.00
                  </span>
                </div>
              </div>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center">
              <div className="border border-zinc-700 p-3 bg-black">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=hyperreal-order"
                  alt="qr"
                  className="w-[140px] h-[140px]"
                />
              </div>

              <p className="mt-4 text-[10px] uppercase tracking-[3px] text-zinc-500">
                Scan To Verify
              </p>
            </div>
          </div>

          {/* Barcode */}
          <div className="pt-8 flex flex-col items-center text-center">
            <p className="text-[10px] uppercase tracking-[4px] text-zinc-500 mb-4">
              TXN-PREVIEW-MPDWWHHQ
            </p>

            <div className="flex items-end gap-[2px] h-14">
              {Array.from({ length: 58 }).map((_, i) => (
                <div
                  key={i}
                  className={`bg-white ${i % 3 === 0
                    ? "w-[3px] h-full"
                    : i % 2 === 0
                      ? "w-[2px] h-10"
                      : "w-[1px] h-12"
                    }`}
                />
              ))}
            </div>

            <p className="mt-5 text-[10px] uppercase tracking-[4px] text-zinc-500">
              Thank You For Entering The Grid
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button className="h-14 border border-zinc-600 hover:border-zinc-400 transition-all uppercase tracking-wide text-sm font-bold flex items-center justify-center gap-3">
            <Download className="w-4 h-4" />
            Download
          </button>

          <button className="h-14 border border-zinc-600 hover:border-zinc-400 transition-all uppercase tracking-wide text-sm font-bold flex items-center justify-center gap-3">
            <Printer className="w-4 h-4" />
            Print Slip
          </button>

          <button className="h-14 bg-lime-400 text-black hover:bg-lime-300 transition-all uppercase tracking-wide text-sm font-black flex items-center justify-center gap-3">
            View Orders
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-8">
          <button className="uppercase tracking-[4px] text-xs text-zinc-500 hover:text-white transition-all">
            Continue Shopping →
          </button>
        </div>
      </div>
    </section>
  )
}
