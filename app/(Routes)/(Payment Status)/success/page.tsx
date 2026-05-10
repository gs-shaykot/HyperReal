"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 shadow-lg border border-green-200 text-center max-w-md">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful ✅
        </h1>

        <p className="text-gray-600 mb-6">
          Your order has been placed successfully.
          <br />
          We are now processing your order.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/" className="btn bg-green-600 text-white">
            Go to Home
          </Link>

          <Link href="/orders" className="btn border border-green-600 text-green-600">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}