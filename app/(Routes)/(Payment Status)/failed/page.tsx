"use client";

import Link from "next/link";

export default function FailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 shadow-lg border border-red-200 text-center max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Payment Failed ❌
        </h1>

        <p className="text-gray-600 mb-6">
          Something went wrong with your payment.
          <br />
          Please try again.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/checkout" className="btn bg-red-600 text-white">
            Retry Payment
          </Link>

          <Link href="/" className="btn border border-red-600 text-red-600">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}