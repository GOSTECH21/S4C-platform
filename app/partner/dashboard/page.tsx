"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { HOME_PATH, PARTNER_LOGIN_PATH } from "@/app/lib/routes";

export default function PartnerDashboardPage() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push(PARTNER_LOGIN_PATH);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          S4P Climate Partner
        </p>
        <h1 className="mt-3 text-4xl font-black">Partner dashboard</h1>
        <p className="mt-4 text-slate-300">
          You are signed in. Your climate programme workspace will appear here.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={logout}
            className="rounded-lg bg-slate-800 px-4 py-2 font-semibold hover:bg-red-600"
          >
            Logout
          </button>
          <Link
            href={HOME_PATH}
            className="rounded-lg bg-slate-800 px-4 py-2 font-semibold hover:bg-slate-700"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
