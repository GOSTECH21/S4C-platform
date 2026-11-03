"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import {
  CLUB_ADMIN_PATH,
  CLUB_DASHBOARD_PATH,
  CLUB_LOGIN_PATH,
  CLUB_SELECT_PROJECTS_ALIASES,
  CLUB_SELECT_PROJECTS_PATH,
  CLUB_SPONSOR_LEADERBOARD_PATH,
  CLUB_SPONSORS_PATH,
} from "@/app/lib/routes";
import { storedFullName, welcomeBackMessage } from "@/app/lib/s4p-admin";
import { loadClubSession } from "@/app/services/club-match-day.service";
import { s4pTabClass } from "@/app/lib/s4p-tabs";

const LINKS = [
  {
    href: CLUB_DASHBOARD_PATH,
    label: "Select Match",
    match: "select-match" as const,
  },
  {
    href: CLUB_SELECT_PROJECTS_PATH,
    label: "Choose Projects",
    match: "projects" as const,
  },
  {
    href: CLUB_SPONSORS_PATH,
    label: "Sponsors",
    match: "sponsors" as const,
  },
  {
    href: CLUB_ADMIN_PATH,
    label: "My Admin",
    match: "admin" as const,
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
    <header className="sticky top-[4.75rem] z-30 mb-10 flex flex-col gap-4 border-b border-slate-800 bg-slate-950/95 px-1 py-4 backdrop-blur sm:top-[5.25rem] sm:flex-row sm:items-center sm:justify-between">
      <Link href={CLUB_DASHBOARD_PATH} className="flex flex-col">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          Club
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
            link.match === "select-match"
              ? pathname === CLUB_DASHBOARD_PATH
              : link.match === "projects"
                ? CLUB_SELECT_PROJECTS_ALIASES.includes(pathname ?? "")
                : link.match === "admin"
                  ? pathname === CLUB_ADMIN_PATH
                  : pathname === CLUB_SPONSORS_PATH ||
                    pathname === CLUB_SPONSOR_LEADERBOARD_PATH;
          const bigger = link.match === "select-match";

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 font-semibold transition ${
                bigger ? "px-5 py-2.5 text-base sm:text-lg" : "text-sm"
              } ${s4pTabClass(active)}`}
            >
              {link.label}
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="rounded-lg border border-s4p-mark bg-s4p-mark/15 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-red-600 hover:text-white"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
