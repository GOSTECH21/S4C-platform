"use client";

import {
  formatKickoff,
  formatMatchDate,
} from "@/app/lib/upcoming-matches";
import type { ClubFixture } from "@/app/lib/club-fixtures";
import { DEMO_CLUB_NAMES } from "@/app/lib/current-season";
import { demoFixturesForClub } from "@/app/lib/demo-club-fixtures";
import { LOCAL_SPONSOR_MIN_GBP } from "@/app/lib/local-sponsor";
import { formatMoney } from "@/app/lib/sponsorship-auction";

function FixtureRows({
  fixtures,
  selectable,
  selected,
  amounts,
  onToggle,
  onAmount,
}: {
  fixtures: ClubFixture[];
  selectable: boolean;
  selected: string[];
  amounts: Record<string, string>;
  onToggle: (fixtureName: string) => void;
  onAmount: (fixtureName: string, amount: string) => void;
}) {
  return (
    <div className="space-y-3">
      {fixtures.map((fixture) => {
        const on = selected.includes(fixture.fixtureName);
        return (
          <label
            key={fixture.id}
            className={`flex flex-col gap-2 rounded-2xl border-2 p-4 sm:flex-row sm:items-center sm:justify-between ${
              on
                ? "border-green-400 bg-emerald-950"
                : "border-green-700 bg-black/40"
            }`}
          >
            <span className="flex items-start gap-3">
              {selectable ? (
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onToggle(fixture.fixtureName)}
                  className="mt-1 h-4 w-4"
                />
              ) : null}
              <span>
                <span className="block font-semibold text-white">
                  {fixture.fixtureName}
                </span>
                <span className="text-xs text-green-200">
                  {formatMatchDate(fixture.date)} · {formatKickoff(fixture.kickoff)}
                  {fixture.venue ? ` · ${fixture.venue}` : ""}
                </span>
              </span>
            </span>
            {selectable && on ? (
              <label className="text-sm text-green-100">
                Sponsorship amount
                <input
                  type="number"
                  min={LOCAL_SPONSOR_MIN_GBP}
                  step={50}
                  value={amounts[fixture.fixtureName] ?? String(LOCAL_SPONSOR_MIN_GBP)}
                  onChange={(event) =>
                    onAmount(fixture.fixtureName, event.target.value)
                  }
                  className="mt-2 w-full rounded-lg bg-slate-800 p-2 text-white sm:w-36"
                />
              </label>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}

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
  if (!clubName.trim()) {
    return (
      <div id="fixture-lists" className="space-y-6">
        {DEMO_CLUB_NAMES.map((club) => (
          <section
            key={club}
            className="rounded-2xl border-2 border-green-400 bg-black/30 p-4"
          >
            <h3 className="mb-3 text-lg font-black text-green-300">
              {club} fixture list
            </h3>
            <FixtureRows
              fixtures={demoFixturesForClub(club)}
              selectable={false}
              selected={[]}
              amounts={{}}
              onToggle={onToggle}
              onAmount={onAmount}
            />
          </section>
        ))}
        <p className="text-sm text-green-100">
          Choose the club first, then tick the Matches you wish to sponsor on
          that club&apos;s list.
        </p>
      </div>
    );
  }

  const fixtures = demoFixturesForClub(clubName);
  return (
    <section
      id="fixture-lists"
      className="space-y-3 rounded-2xl border-2 border-green-400 bg-black/30 p-4"
    >
      <h3 className="text-lg font-black text-green-300">
        {clubName} fixture list
      </h3>
      <FixtureRows
        fixtures={fixtures}
        selectable
        selected={selected}
        amounts={amounts}
        onToggle={onToggle}
        onAmount={onAmount}
      />
      <p className="text-xs text-green-100">
        From {formatMoney(LOCAL_SPONSOR_MIN_GBP)} per selected Match. SUBMIT
        sends these amounts to the {clubName} Sustainability Director.
      </p>
    </section>
  );
}
