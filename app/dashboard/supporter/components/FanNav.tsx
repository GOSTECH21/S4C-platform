"use client";

import { useEffect, useState } from "react";
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
import { fanWelcomeMessage, welcomeBackMessage } from "@/app/lib/s4p-admin";
import {
  destinationForSignedInKind,
  isFanFacingKind,
} from "@/app/lib/signed-in-role";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";
import { getOrCreateSupporter } from "@/app/services/votes.service";

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
  const [welcome, setWelcome] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const kind = await identifySignedInKind();
      if (!cancelled && kind && !isFanFacingKind(kind)) {
        const dest = destinationForSignedInKind(kind);
        if (dest) {
          router.replace(dest);
          return;
        }
      }
      const metadataName =
        (user?.user_metadata?.full_name as string | undefined) ||
        `${user?.user_metadata?.first_name ?? ""} ${user?.user_metadata?.last_name ?? ""}`.trim();
      if (!cancelled) {
        const fromMeta = welcomeBackMessage(metadataName);
        if (fromMeta) setWelcome(fromMeta);
      }
      try {
        const current = await getOrCreateSupporter();
        if (cancelled) return;
        setWelcome(
          fanWelcomeMessage(current?.full_name, current?.email, metadataName)
        );
      } catch {
        if (!cancelled) {
          setWelcome(welcomeBackMessage(metadataName));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push(FAN_LOGIN_PATH);
  }

  return (
    <header className="sticky top-0 z-30 mb-10 flex flex-col gap-4 border-b border-slate-800 bg-slate-950/95 px-1 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <Link href={SUPPORTER_CAMPAIGN_PATH} className="flex flex-col">
        <span className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-green-400">
            S4P
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Supporter
          </span>
        </span>
        {welcome && (
          <span className="mt-1 text-sm font-medium text-slate-300">
            {welcome}
          </span>
        )}
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
