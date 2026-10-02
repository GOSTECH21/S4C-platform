"use client";

import { useState } from "react";
import { matchDetailsLines } from "@/app/lib/club-fixtures";

export function SeeMatchDetails({
  date,
  venue,
  kickoff,
}: {
  date?: string | null;
  venue?: string | null;
  kickoff?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const details = matchDetailsLines({ date, venue, kickoff });
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-2 text-sm font-semibold text-green-300 hover:underline"
      >
        {open ? "Hide Match details" : "See Match details"}
      </button>
      {open && (
        <dl className="mt-3 space-y-1 text-sm text-slate-300">
          <div>
            <span className="text-slate-500">Date: </span>
            {details.date}
          </div>
          <div>
            <span className="text-slate-500">Venue: </span>
            {details.venue}
          </div>
          <div>
            <span className="text-slate-500">Kick-off: </span>
            {details.kickoff}
          </div>
        </dl>
      )}
    </div>
  );
}
