"use client";

import { useEffect, useState } from "react";
import { matchDetailsLines } from "@/app/lib/club-fixtures";

export function SeeMatchDetails({
  date,
  venue,
  kickoff,
  defaultOpen = false,
}: {
  date?: string | null;
  venue?: string | null;
  kickoff?: string | null;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const details = matchDetailsLines({ date, venue, kickoff });

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen, date, venue, kickoff]);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Hide Match details" : "See Match details"}
        onClick={() => setOpen((current) => !current)}
        className="mt-4 rounded-xl bg-s4p-mark px-4 py-2 text-sm font-bold text-slate-950"
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
