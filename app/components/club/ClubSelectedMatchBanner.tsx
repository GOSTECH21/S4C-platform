"use client";

import { useEffect, useState } from "react";
import {
  CLUB_SELECTED_MATCH_EVENT,
  clubMatchDayLabel,
  clubSelectedMatchDetail,
  resolveClubSelectedMatch,
  type ClubSelectedMatch,
} from "@/app/lib/club-selected-match";
import { CLUB_DASHBOARD_PATH } from "@/app/lib/routes";
import Link from "next/link";

export default function ClubSelectedMatchBanner({
  clubId,
  clubName,
}: {
  clubId?: string | null;
  clubName: string;
}) {
  const [match, setMatch] = useState<ClubSelectedMatch | null>(null);

  useEffect(() => {
    function read() {
      setMatch(resolveClubSelectedMatch(clubId, clubName));
    }
    read();
    window.addEventListener(CLUB_SELECTED_MATCH_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(CLUB_SELECTED_MATCH_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, [clubId, clubName]);

  if (!match) {
    return (
      <div className="mb-8 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
          Selected Match Day
        </p>
        <p className="mt-2 text-lg font-semibold text-amber-100">
          No Match is registered yet. Open Select Match and tap the fixture this
          Club wants sponsored.
        </p>
        <Link
          href={CLUB_DASHBOARD_PATH}
          className="mt-4 inline-flex rounded-full bg-s4p-mark px-5 py-2 text-sm font-black uppercase tracking-[0.12em] text-black"
        >
          Select the Match
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">
        Selected Match Day
      </p>
      <p className="mt-2 text-2xl font-black">{clubMatchDayLabel(match, clubName)}</p>
      {clubSelectedMatchDetail(match) ? (
        <p className="mt-1 text-sm font-semibold text-emerald-100">
          {clubSelectedMatchDetail(match)}
        </p>
      ) : null}
    </div>
  );
}