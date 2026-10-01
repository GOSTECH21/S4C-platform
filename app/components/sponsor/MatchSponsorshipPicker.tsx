"use client";

import { fixturesForClub } from "@/app/lib/club-fixtures";
import { LOCAL_SPONSOR_MIN_GBP } from "@/app/lib/local-sponsor";
import { formatMoney } from "@/app/lib/sponsorship-auction";

export function MatchSponsorshipPicker({
  clubName,
  selected,
  amounts,
  onToggle,
  onAmount,
}: {
  clubName: string;
  selected: string[];
  amounts: Record<string, string>;
  onToggle: (fixtureName: string) => void;
  onAmount: (fixtureName: string, amount: string) => void;
}) {
  const fixtures = fixturesForClub(clubName);
  if (!clubName.trim()) {
    return (
      <p className="text-sm text-slate-500">
        Choose the club first, then select the Match or Matches you wish to
        sponsor.
      </p>
    );
  }
  if (fixtures.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No upcoming fixtures are listed for {clubName} yet.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {fixtures.map((fixture) => {
        const on = selected.includes(fixture.fixtureName);
        return (
          <label
            key={fixture.id}
            className={`flex flex-col gap-2 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              on
                ? "border-green-500 bg-slate-800"
                : "border-slate-700 bg-slate-950"
            }`}
          >
            <span className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={on}
                onChange={() => onToggle(fixture.fixtureName)}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block font-semibold text-white">
                  {fixture.fixtureName}
                </span>
                <span className="text-xs text-slate-400">
                  {fixture.competition}
                </span>
              </span>
            </span>
            {on && (
              <label className="text-sm text-slate-400">
                Sponsorship amount
                <input
                  type="number"
                  min={LOCAL_SPONSOR_MIN_GBP}
                  step={50}
                  value={amounts[fixture.fixtureName] ?? String(LOCAL_SPONSOR_MIN_GBP)}
                  onChange={(event) =>
                    onAmount(fixture.fixtureName, event.target.value)
                  }
                  className="mt-1 w-full rounded-lg bg-slate-800 p-2 text-white sm:w-36"
                />
              </label>
            )}
          </label>
        );
      })}
      <p className="text-xs text-slate-500">
        From {formatMoney(LOCAL_SPONSOR_MIN_GBP)} per selected Match. SUBMIT
        sends these amounts to the {clubName} Sustainability Director.
      </p>
    </div>
  );
}
