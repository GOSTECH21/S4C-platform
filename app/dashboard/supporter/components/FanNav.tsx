"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import {
  FAN_LOGIN_PATH,
  SUPPORTER_CAMPAIGN_ALIASES,
  SUPPORTER_CAMPAIGN_PATH,
} from "@/app/lib/routes";

const LINKS = [
  { href: SUPPORTER_CAMPAIGN_PATH, label: "My S4P", aliases: SUPPORTER_CAMPAIGN_ALIASES },
  { href: "/dashboard/supporter/vote", label: "All Projects" },
];

export default function FanNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push(FAN_LOGIN_PATH);
  }

  return (
    <header className="mb-10 flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <Link href={SUPPORTER_CAMPAIGN_PATH} className="flex items-center gap-2">
        <span className="text-2xl font-black tracking-tight text-green-400">
          S4P
        </span>
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          Supporter
        </span>
      </Link>

      <nav className="flex items-center gap-2">
        {LINKS.map((link) => {
          const active = (link.aliases ?? [link.href]).includes(pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-green-500 text-slate-950"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-red-600 hover:text-white"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
