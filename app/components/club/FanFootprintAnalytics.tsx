"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/app/lib/sponsorship-auction";
import {
  FAN_FOOTPRINT_FUTURE_NOTE,
  FAN_FOOTPRINT_NAME,
  FAN_FOOTPRINT_STAMP,
  FAN_FOOTPRINT_TABS,
  fanFootprintReport,
  formatFanFootprintKg,
  formatFanFootprintTonnes,
  type FanFootprintSponsorship,
  type FanFootprintTabId,
} from "@/app/lib/fan-footprint";

export function FanFootprintAnalytics({
  clubName,
  sponsorships = [],
}: {
  clubName: string;
  sponsorships?: FanFootprintSponsorship[];
}) {
  const [tab, setTab] = useState<FanFootprintTabId>("core");
  const [showSettings, setShowSettings] = useState(false);
  const report = useMemo(
    () => fanFootprintReport({ clubName, sponsorships }),
    [clubName, sponsorships]
  );
  const maxMonth = Math.max(...report.months.map((row) => row.tonnes), 0.1);

  function exportReport() {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fanfootprint-${report.clubName.replace(/\s+/g, "-").toLowerCase()}-${report.season.replace("/", "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      data-fan-footprint={FAN_FOOTPRINT_STAMP}
      className="mt-12 overflow-hidden rounded-3xl border p-5 sm:p-8"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-s4p-mark/20 text-lg">
            🍃
          </span>
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              {FAN_FOOTPRINT_NAME}
            </h2>
            <p className="mt-1 inline-flex rounded-full border border-s4p-mark bg-s4p-mark/15 px-3 py-1 text-xs font-semibold">
              {report.clubName} · {report.season} Season
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportReport}
            className="fp-tab-off rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Export Report
          </button>
          <button
            type="button"
            onClick={() => setShowSettings((open) => !open)}
            className="fp-settings rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Settings
          </button>
        </div>
      </div>
      <p className="fp-muted mt-4 max-w-3xl text-sm">
        {FAN_FOOTPRINT_FUTURE_NOTE}
      </p>
      {showSettings ? (
        <p className="fp-card mt-3 rounded-2xl border p-4 text-sm">
          Live Matchrav journeys will feed this board as fans opt in. Until then
          the Sustainability Director can use this modelled season view for
          planning.
        </p>
      ) : null}

      <div className="fp-tab mt-6 flex flex-wrap gap-2">
        {FAN_FOOTPRINT_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold ${
              tab === item.id ? "fp-tab-on" : "fp-tab-off"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "core" ? (
        <div className="mt-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Kpi
              label="Total Season CO₂e"
              value={formatFanFootprintTonnes(report.totalTonnes)}
              hint={`${report.matches} matches`}
            />
            <Kpi
              label="Avg CO₂e per Fan"
              value={formatFanFootprintKg(report.kgPerFan)}
              hint="per match attended"
            />
            <Kpi
              label="vs Last Season"
              value={`${report.vsLastSeasonPct}%`}
              hint="Improvement"
              positive
            />
            <Kpi
              label="Low-Carbon Share"
              value={`${report.lowCarbonShare}%`}
              hint="rail/coach/walk"
            />
            <Kpi
              label="League Position"
              value={`#${report.leaguePosition}`}
              hint={`of ${report.leagueSize} clubs`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-5">
            <div className="fp-card rounded-2xl border p-5 xl:col-span-3">
              <h3 className="fp-muted text-sm font-semibold">
                Travel Emissions per Match (Season Trend)
              </h3>
              <div className="mt-6 flex h-52 items-stretch gap-3">
                {report.months.map((row) => (
                  <div
                    key={row.month}
                    className="flex min-h-0 flex-1 flex-col items-center"
                  >
                    <span className="fp-muted text-xs font-semibold">
                      {formatFanFootprintTonnes(row.tonnes)}
                    </span>
                    <div className="mt-2 flex min-h-0 w-full flex-1 items-end justify-center">
                      <div
                        className="w-full max-w-12 rounded-t-lg"
                        style={{
                          height: `${Math.max((row.tonnes / maxMonth) * 100, 12)}%`,
                          background:
                            "linear-gradient(to top, #be123c, #fb7185)",
                        }}
                      />
                    </div>
                    <span className="mt-2 text-xs font-semibold">
                      {row.month}
                    </span>
                    <span className="fp-muted text-[10px]">
                      {row.matches} matches
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="fp-card rounded-2xl border p-5 xl:col-span-2">
              <h3 className="fp-muted text-sm font-semibold">
                Transport Mode Split
              </h3>
              <ul className="mt-5 space-y-4">
                {report.modes.map((mode) => (
                  <li key={mode.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{mode.label}</span>
                      <span className="fp-muted">{mode.share}%</span>
                    </div>
                    <div className="fp-track mt-1 h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${mode.share}%`,
                          background: mode.color,
                        }}
                      />
                    </div>
                    <p className="fp-muted mt-1 text-[11px]">
                      Avg: {mode.avgMiles}km
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "match" ? (
        <div className="fp-card mt-6 overflow-hidden rounded-2xl border">
          <div className="fp-muted grid grid-cols-12 px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            <span className="col-span-5">Fixture</span>
            <span className="col-span-3">Date</span>
            <span className="col-span-2">Mode</span>
            <span className="col-span-2 text-right">CO₂e</span>
          </div>
          {report.matchesDetail.slice(0, 12).map((row) => (
            <div
              key={`${row.fixture}-${row.date}`}
              className="grid grid-cols-12 border-t border-black px-4 py-3 text-sm"
            >
              <span className="col-span-5 font-semibold">{row.fixture}</span>
              <span className="fp-muted col-span-3">{row.date}</span>
              <span className="col-span-2">{row.mode}</span>
              <span className="col-span-2 text-right font-black">
                {formatFanFootprintTonnes(row.tonnes)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "scenario" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ScenarioCard
            title="Shift 10% of cars to train"
            body={`About ${formatFanFootprintTonnes(Math.round(report.totalTonnes * 0.08 * 10) / 10)} less this season if one in ten car trips moves to rail.`}
          />
          <ScenarioCard
            title="Coach from supporters' clubs"
            body="A shared coach from each supporters' club cuts the long-distance car share and lifts Low-Carbon Share."
          />
          <ScenarioCard
            title="Walk/cycle last mile"
            body="Park-and-stride and cycle routes inside 3 miles of the stadium remove the shortest, dirtiest car hops."
          />
        </div>
      ) : null}

      {tab === "compliance" ? (
        <ul className="mt-6 space-y-3 text-sm">
          <li className="fp-card rounded-2xl border p-4">
            Record supporter travel mode and distance (Matchrav) for GHG
            Protocol Scope 3, category 6-style match-day travel.
          </li>
          <li className="fp-card rounded-2xl border p-4">
            Keep Match-Sponsorship lookback files so funded Climate Projects
            can be tied to residual travel that cannot yet be avoided.
          </li>
          <li className="fp-card rounded-2xl border p-4">
            Export this report before board and auditor reviews. Live opt-in
            journeys will replace the modelled season view.
          </li>
        </ul>
      ) : null}

      {tab === "commercial" ? (
        <div className="fp-card mt-6 rounded-2xl border p-5">
          <p className="text-sm">
            Match-Sponsorship on this club so far:{" "}
            <strong>
              {formatMoney(report.sponsorshipTotalGbp)}
            </strong>
            . FanFootprint shows where residual travel sits so the
            Sustainability Director can brief Lead Climate Sponsors on what
            their Match-Sponsorship is offsetting.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function Kpi({
  label,
  value,
  hint,
  positive = false,
}: {
  label: string;
  value: string;
  hint: string;
  positive?: boolean;
}) {
  return (
    <div className="fp-card rounded-2xl border p-4">
      <p className="fp-muted text-[11px] font-semibold uppercase tracking-[0.16em]">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black ${positive ? "fp-good" : ""}`}>
        {value}
      </p>
      <p className="fp-muted mt-1 text-xs">{hint}</p>
    </div>
  );
}

function ScenarioCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="fp-card rounded-2xl border p-5">
      <h3 className="font-black">{title}</h3>
      <p className="fp-muted mt-2 text-sm">{body}</p>
    </div>
  );
}
