"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import {
  CLUB_DASHBOARD_PATH,
  CLUB_LOGIN_PATH,
  CLUB_SELECT_PROJECTS_ALIASES,
  CLUB_SELECT_PROJECTS_PATH,
  CLUB_SPONSOR_LEADERBOARD_PATH,
} from "@/app/lib/routes";
import { storedFullName, welcomeBackMessage } from "@/app/lib/s4p-admin";
import { loadClubSession } from "@/app/services/club-match-day.service";

const LINKS = [
  {
    href: CLUB_DASHBOARD_PATH,
    label: "Dashboard",
    match: "dashboard" as const,
  },
  {
    href: CLUB_SELECT_PROJECTS_PATH,
    label: "Climate Projects",
    match: "projects" as const,
  },
  {
    href: CLUB_SPONSOR_LEADERBOARD_PATH,
    label: "Sponsor",
    match: "sponsor" as const,
  },
];

export default function ClubNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [welcome, setWelcome] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await loadClubSession();
      if (cancelled || !session) return;
      setClubName(session.club.name);
      const name = storedFullName(
        session.account.first_name ?? "",
        session.account.last_name ?? ""
      );
      setWelcome(welcomeBackMessage(name));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push(CLUB_LOGIN_PATH);
  }

  return (
    <header className="sticky top-0 z-30 mb-10 flex flex-col gap-4 border-b border-slate-800 bg-slate-950/95 px-1 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <Link href={CLUB_DASHBOARD_PATH} className="flex flex-col">
        <span className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-green-400">
            S4P
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Club
          </span>
        </span>
        {(welcome || clubName) && (
          <span className="mt-1 text-sm font-medium text-slate-300">
            {welcome ?? clubName}
            {welcome && clubName ? ` · ${clubName}` : ""}
          </span>
        )}
      </Link>

      <nav className="flex flex-wrap items-center gap-2">
        {LINKS.map((link) => {
          const active =
            link.match === "dashboard"
              ? pathname === CLUB_DASHBOARD_PATH
              : link.match === "projects"
                ? CLUB_SELECT_PROJECTS_ALIASES.includes(pathname ?? "")
                : pathname === CLUB_SPONSOR_LEADERBOARD_PATH;

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
