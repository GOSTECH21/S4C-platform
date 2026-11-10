"use client";

import Link from "next/link";
import {
  SUPPORTER_CAMPAIGN_PATH,
  SUPPORTER_CIFT_PATH,
  SUPPORTER_CLIMATE_SPONSORS_PATH,
  SUPPORTER_MATCHRAV_PATH,
  SUPPORTER_PREDICT_PATH,
  SUPPORTER_PROJECTS_PATH,
  SUPPORTER_TEAMS_PATH,
  isMyS4PPath,
} from "@/app/lib/routes";
import { s4pTabClass } from "@/app/lib/s4p-tabs";

export const FAN_TAB_LINKS = [
  { href: SUPPORTER_CAMPAIGN_PATH, label: "My S4P", match: "campaign" as const },
  {
    href: SUPPORTER_MATCHRAV_PATH,
    label: "Matchrav",
    match: "matchrav" as const,
  },
  {
    href: SUPPORTER_PREDICT_PATH,
    label: "P4P",
    match: "predict" as const,
  },
  { href: SUPPORTER_CIFT_PATH, label: "CIFT", match: "cift" as const },
];

function isActive(match: (typeof FAN_TAB_LINKS)[number]["match"], pathname: string) {
  if (match === "campaign") {
    return (
      isMyS4PPath(pathname) ||
      pathname === SUPPORTER_TEAMS_PATH ||
      pathname === SUPPORTER_PROJECTS_PATH ||
      pathname === "/supporter/dashboard/vote" ||
      pathname === SUPPORTER_CLIMATE_SPONSORS_PATH ||
      pathname === "/dashboard/supporter/climate-sponsors"
    );
  }
  if (match === "matchrav") {
    return (
      pathname === SUPPORTER_MATCHRAV_PATH ||
      pathname === "/dashboard/supporter/matchrav"
    );
  }
  if (match === "predict") {
    return (
      pathname === SUPPORTER_PREDICT_PATH ||
      pathname === "/dashboard/supporter/predict"
    );
  }
  return pathname === SUPPORTER_CIFT_PATH;
}

export function FanTabBar({
  pathname,
  onLogout,
}: {
  pathname: string;
  onLogout: () => void;
}) {
  return (
    <nav
      aria-label="Supporter"
      data-fan-tabs="5"
      data-fan-tabs-style="club-buttons"
      className="flex flex-wrap items-center gap-2"
    >
      {FAN_TAB_LINKS.map((link) => {
        const active = isActive(link.match, pathname);
        const bigger = link.match === "campaign";

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
        type="button"
        onClick={onLogout}
        className="rounded-lg border border-s4p-mark bg-s4p-mark/15 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-red-600 hover:text-white"
      >
        Logout
      </button>
    </nav>
  );
}
