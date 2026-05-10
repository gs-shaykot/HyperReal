"use client";

import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50">
      <div className="bg-white p-8 shadow-lg border border-yellow-200 text-center max-w-md">
        <h1 className="text-3xl font-bold text-yellow-600 mb-4">
          Payment Cancelled ⚠️
        </h1>

        <p className="text-gray-600 mb-6">
          You cancelled the payment.
          <br />
          Your order has not been completed.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/checkout" className="btn bg-yellow-500 text-white">
            Try Again
          </Link>

          <Link href="/" className="btn border border-yellow-500 text-yellow-600">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}