"use client";

import Link from "next/link";
import {
  SUPPORTER_CAMPAIGN_PATH,
  SUPPORTER_CIFT_PATH,
  SUPPORTER_CLIMATE_SPONSORS_PATH,
  SUPPORTER_PREDICT_PATH,
  SUPPORTER_PROJECTS_PATH,
  SUPPORTER_TEAMS_PATH,
  isMyS4PPath,
} from "@/app/lib/routes";

export const FAN_TAB_LINKS = [
  { href: SUPPORTER_CAMPAIGN_PATH, label: "My S4P", match: "campaign" as const },
  {
    href: SUPPORTER_PREDICT_PATH,
    label: "P4P",
    match: "predict" as const,
  },
  {
    href: SUPPORTER_PROJECTS_PATH,
    label: "Climate Projects",
    match: "projects" as const,
  },
  { href: SUPPORTER_CIFT_PATH, label: "CIFT", match: "cift" as const },
];

const TAB_CLASS =
  "min-w-0 w-full overflow-hidden whitespace-normal rounded-lg px-1 py-2 text-center text-[11px] font-semibold leading-tight sm:px-4 sm:text-sm";

function isActive(match: (typeof FAN_TAB_LINKS)[number]["match"], pathname: string) {
  if (match === "campaign") {
    return isMyS4PPath(pathname) || pathname === SUPPORTER_TEAMS_PATH;
  }
  if (match === "predict") {
    return (
      pathname === SUPPORTER_PREDICT_PATH ||
      pathname === "/dashboard/supporter/predict"
    );
  }
  if (match === "cift") {
    return pathname === SUPPORTER_CIFT_PATH;
  }
  return (
    pathname === SUPPORTER_PROJECTS_PATH ||
    pathname === "/supporter/dashboard/vote" ||
    pathname === SUPPORTER_CLIMATE_SPONSORS_PATH ||
    pathname === "/dashboard/supporter/climate-sponsors"
  );
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
      className="grid w-full grid-cols-5 gap-1 overflow-x-hidden sm:flex sm:w-auto sm:items-center sm:gap-2"
    >
      {FAN_TAB_LINKS.map((link) => {
        const active = isActive(link.match, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${TAB_CLASS} transition ${
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
        type="button"
        onClick={onLogout}
        className={`${TAB_CLASS} bg-slate-800 text-slate-200 hover:bg-red-600 hover:text-white`}
      >
        Logout
      </button>
    </nav>
  );
}
