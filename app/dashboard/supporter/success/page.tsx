"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "1";

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="rounded-2xl bg-slate-900 p-10 text-center">
        <h1 className="text-5xl text-green-400">✅</h1>

        <h2 className="mt-5 text-3xl font-bold">Credit Allocated</h2>

        <p className="mt-4 text-slate-300">
          Thank you for supporting climate action.
        </p>

        <p className="mt-2 text-2xl font-bold text-green-400">
          £{amount} successfully allocated.
        </p>

        <Link
          href={`/dashboard/supporter/climate-impact-table?amount=${amount}`}
          className="mt-8 inline-block rounded-lg bg-green-400 px-6 py-3 font-bold text-slate-950"
        >
          View Climate Impact Table
        </Link>
      </div>
    </main>
  );
}