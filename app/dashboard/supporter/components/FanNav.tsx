"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import {
  FAN_LOGIN_PATH,
  SUPPORTER_CAMPAIGN_PATH,
  SUPPORTER_PROJECTS_PATH,
  SUPPORTER_TEAMS_PATH,
  isMyS4PPath,
} from "@/app/lib/routes";

const LINKS = [
  { href: SUPPORTER_CAMPAIGN_PATH, label: "My S4P", match: "campaign" as const },
  {
    href: SUPPORTER_PROJECTS_PATH,
    label: "Climate Projects",
    match: "projects" as const,
  },
  { href: SUPPORTER_TEAMS_PATH, label: "My Teams", match: "teams" as const },
];

export default function FanNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push(FAN_LOGIN_PATH);
  }

  return (
    <header className="sticky top-0 z-30 mb-10 flex flex-col gap-4 border-b border-slate-800 bg-slate-950/95 px-1 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
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
          const active =
            link.match === "campaign"
              ? isMyS4PPath(pathname)
              : link.match === "teams"
                ? pathname === SUPPORTER_TEAMS_PATH
                : pathname === SUPPORTER_PROJECTS_PATH ||
                  pathname === "/supporter/dashboard/vote";

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
