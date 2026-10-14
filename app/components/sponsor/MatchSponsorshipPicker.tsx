"use client";

import { useState } from "react";
import {
  formatKickoff,
  formatMatchDate,
} from "@/app/lib/upcoming-matches";
import type { ClubFixture } from "@/app/lib/club-fixtures";
import { DEMO_CLUB_NAMES } from "@/app/lib/current-season";
import { demoFixturesForClub } from "@/app/lib/demo-club-fixtures";
import { LOCAL_SPONSOR_MIN_GBP } from "@/app/lib/local-sponsor";
import { formatMoney } from "@/app/lib/sponsorship-auction";
import {
  fixtureAccordionHint,
  fixtureListIsCollapsible,
  visibleAccordionItems,
} from "@/app/lib/fixture-accordion";

function FixtureRows({
  fixtures,
  selectable,
  selected,
  amounts,
  onToggle,
  onAmount,
  heading,
}: {
  fixtures: ClubFixture[];
  selectable: boolean;
  selected: string[];
  amounts: Record<string, string>;
  onToggle: (fixtureName: string) => void;
  onAmount: (fixtureName: string, amount: string) => void;
  heading: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = visibleAccordionItems(fixtures, expanded, (row) =>
    selected.includes(row.fixtureName)
  );
  const collapsible = fixtureListIsCollapsible(fixtures.length);
  const hint = fixtureAccordionHint(fixtures.length, visible.length, expanded);
  return (
    <div className="space-y-3">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="w-full text-left"
        >
          <h3 className="text-lg font-black text-green-300">
            {heading}
            {hint ? (
              <span className="ml-2 text-sm font-semibold text-green-100">
                {hint}
              </span>
            ) : null}
          </h3>
        </button>
      ) : (
        <h3 className="text-lg font-black text-green-300">{heading}</h3>
      )}
      {visible.map((fixture) => {
        const on = selected.includes(fixture.fixtureName);
        return (
          <label
            key={fixture.id}
            className={`flex flex-col gap-2 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              on
                ? "border-s4p-mark bg-slate-900"
                : "border-emerald-400/40 bg-slate-900"
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
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white sm:w-36"
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
            className="rounded-2xl border border-emerald-400/40 bg-slate-900 p-4"
          >
            <FixtureRows
              heading={`${club} fixture list`}
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
      className="space-y-3 rounded-2xl border border-emerald-400/40 bg-slate-900 p-4"
    >
      <FixtureRows
        heading={`${clubName} fixture list`}
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
