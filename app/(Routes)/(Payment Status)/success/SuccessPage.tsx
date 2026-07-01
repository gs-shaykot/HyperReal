"use client"
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
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
import Link from "next/link";
import { useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";

export const SuccessPage = ({ order, user }: { order: any; user: any }) => {
  const formattedDate = new Date(order?.createdAt).toLocaleDateString("en-GB");

  const totalInUSD = order?.payments[0]?.totalProductPriceInUSD || 0;
  const discount = order?.payments[0]?.discount || 0;
  const totalInBDT = order?.payments[0]?.paidAmountInBDT || 0;
  const shippingCost = order?.payments[0]?.shippingCost || 0;

  const grandTotal = useMemo(() => {
    return totalInUSD + shippingCost - discount;
  }, [discount, shippingCost, totalInUSD]);

  const receiptRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = async () => {
    if (!receiptRef.current) return;

    const dataUrl = await toPng(receiptRef.current, {
      pixelRatio: 3,
      cacheBust: true,
    });

    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt-${order.orderCode}</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: white;
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }

          img {
              width: 210mm;       
              height: auto;
              display: block;
              margin: 0 auto;
          }

          @page {
            size: A4;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" />
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;

    const dataUrl = await toPng(receiptRef.current, {
      pixelRatio: 3,
      cacheBust: true,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    const img = new Image();
    img.src = dataUrl;

    await new Promise((resolve) => (img.onload = resolve));

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (img.height * pdfWidth) / img.width;

    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);

    pdf.save(`Receipt-${order.orderCode}.pdf`);
  };

  return (
    <section className="min-h-screen bg-main light:bg-white text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-162.5">
        {/* Top Success */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 border border-second flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8 text-second" strokeWidth={2.5} />
          </div>

          <h1 className="text-[58px] leading-none font-black uppercase italic tracking-[-3px]">
            <span className="text-white light:text-zinc-900">Transfer</span>{" "}
            <span className="text-second">Complete</span>
          </h1>

          <p className="mt-4 text-[10px] uppercase tracking-[5px] text-zinc-400 light:text-zinc-600">
            Authorized // {order.payments[0]?.method} // {order.payments[0]?.transactionId || "TXN-PREVIEW-MPDWWHHQ"}
          </p>
        </div>

        {/* Receipt Card */}

        <div ref={receiptRef} className="border border-zinc-800 light:bg-white bg-[#050505] shadow-xl px-8 py-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-dashed border-zinc-800 pb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[4px] text-zinc-500 light:text-zinc-800 mb-3">
                Cargo Receipt
              </p>

              <h2 className="text-3xl light:text-zinc-900 font-black uppercase italic tracking-tight">
                HYPER<span className="text-second">REAL</span>
              </h2>

              <p className="mt-1 text-[10px] uppercase tracking-[3px] text-zinc-500 light:text-zinc-800">
                // Techwear Division
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[4px] text-zinc-500 light:text-zinc-800 mb-3">
                Order ID
              </p>

              <h3 className="text-second font-bold uppercase tracking-wide">
                {order.orderCode}
              </h3>

              <div className="mt-2 flex items-center justify-end gap-2 text-zinc-400 light:text-zinc-600 text-xs">
                <CalendarDays className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-8 border-b border-dashed border-zinc-800 py-5">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-zinc-500 light:text-zinc-800">
                <ReceiptText className="w-3 h-3" />
                <p className="text-xs uppercase tracking-[4px]">Gateway</p>
              </div>

              <p className="font-medium light:text-zinc-700 uppercase">{order.payments[0]?.method}</p>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-zinc-500 light:text-zinc-800">
                <Shield className="w-3 h-3" />
                <p className="text-xs uppercase tracking-[4px]">Method</p>
              </div>

              <p className="font-medium light:text-zinc-700 uppercase">Standard</p>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-zinc-500 light:text-zinc-800">
                <Globe className="w-3 h-3" />
                <p className="text-xs uppercase tracking-[4px]">Region</p>
              </div>

              <p className="font-medium light:text-zinc-700 uppercase">{order.payments[0]?.country}</p>
            </div>
          </div>

          {/* Address */}
          <div className="border-b border-dashed border-zinc-800 py-5">
            <p className="text-[10px] uppercase tracking-[4px] text-zinc-500 light:text-zinc-800 mb-2">
              Drop Coordinates
            </p>

            <div className="space-y-1">
              <h4 className="font-black uppercase light:text-zinc-900">{user?.name}</h4>

              <p className="text-zinc-400 light:text-zinc-600">{user?.email}</p>

              <p className="text-zinc-400 light:text-zinc-600">{order?.address}</p>
            </div>
          </div>

          {/* Product */}
          <div className="border-b border-dashed border-zinc-800 py-5">
            <p className="text-xs uppercase tracking-[4px] text-zinc-500 light:text-zinc-800 mb-4">
              Manifest
            </p>

            {
              order.orderItems.map((item: any, index: number) => (
                <div key={index} className={`flex items-start justify-between gap-6 text-sm ${index === order.orderItems.length - 1 ? "mb-0" : "mb-3"}`}>
                  <div>
                    <h4 className="font-medium uppercase tracking-wide light:text-zinc-700">
                      {item.variant.product.name} [{item.variant.size}] × {item.quantity}
                    </h4>
                  </div>

                  <p className="font-medium text-second whitespace-nowrap">
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
                  <div className="flex items-center justify-between text-sm text-zinc-400 light:text-zinc-700">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white light:text-zinc-800">${totalInUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-zinc-400 light:text-zinc-700">
                    <span>Shipping</span>
                    <span className="font-semibold text-white light:text-zinc-800">${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-zinc-400 light:text-zinc-700">
                    <span>Discount</span>
                    <span className="font-semibold text-white light:text-zinc-800">-${discount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl light:text-zinc-900 font-black uppercase">
                    Total Paid
                  </span>

                  <div className="flex items-end gap-2 flex-col">
                    <span className="text-xl font-black text-second">
                      ${grandTotal.toFixed(2)}
                    </span>
                    {
                      order?.payments[0]?.country === 'BD' &&
                      <span className="text-sm font-black text-second">
                        ~ {totalInBDT.toFixed(2)} BDT
                      </span>
                    }

                  </div>
                </div>
              </div>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center">
              <div className="border border-zinc-700 p-3 bg-black light:bg-white">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=hyperreal-order"
                  alt="qr"
                  className="w-35 h-35"
                />
              </div>

              <p className="mt-4 text-[10px] uppercase tracking-[3px] text-zinc-500 light:text-zinc-700">
                Scan To Verify
              </p>
            </div>
          </div>

          {/* Barcode */}
          <div className="pt-5 flex flex-col items-center text-center">
            <p className="text-[10px] uppercase tracking-[4px] text-zinc-500 light:text-zinc-700 mb-4">
              {order?.payments[0]?.transactionId || "TXN-PREVIEW-MPDWWHHQ"}
            </p>

            <div className="flex items-end gap-0.5 h-14">
              {Array.from({ length: 58 }).map((_, i) => (
                <div
                  key={i}
                  className={`bg-white light:bg-zinc-900 ${i % 3 === 0
                    ? "w-0.75 h-full"
                    : i % 2 === 0
                      ? "w-0.5 h-10"
                      : "w-px h-12"
                    }`}
                />
              ))}
            </div>

            <p className="mt-3 text-[10px] uppercase tracking-[4px] text-zinc-500 light:text-zinc-700">
              Thank You For Entering The Grid
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button onClick={handleDownload} className="cursor-pointer h-14 border border-zinc-600 hover:border-zinc-300 hover:bg-black hover:text-white transition-all uppercase tracking-wide text-sm light:text-zinc-900 font-bold flex items-center justify-center gap-3">
            <Download className="w-4 h-4" />
            Download
          </button>

          <button onClick={handlePrint} className="cursor-pointer h-14 border border-zinc-600 hover:border-zinc-300 hover:bg-black hover:text-white transition-all uppercase tracking-wide text-sm light:text-zinc-900 font-bold flex items-center justify-center gap-3">
            <Printer className="w-4 h-4" />
            Print Slip
          </button>

          <button className="cursor-pointer h-14 bg-second text-black hover:bg-lime-300 transition-all uppercase tracking-wide text-sm light:text-zinc-900 font-black flex items-center justify-center gap-3">
            View Orders
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-8">
          <Link href="/products" className="uppercase tracking-[4px] text-xs text-zinc-500 light:text-zinc-700 hover:text-white light:hover:text-zinc-900 transition-all cursor-pointer">
            Continue Shopping →
          </Link>
        </div>
      </div>
    </section>
  )
}
