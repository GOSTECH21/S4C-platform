"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandLogoField } from "@/app/components/sponsor/BrandLogoField";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { TodaysClimateSponsors } from "@/app/components/fan/TodaysClimateSponsors";
import {
  LOCAL_SPONSOR_MIN_GBP,
  LOCAL_SPONSORS_PER_MATCH,
  type LocalSponsorRecord,
  writeLocalSponsorForClub,
  removeLocalSponsorForClub,
} from "@/app/lib/local-sponsor";
import {
  LEAD_CLIMATE_SPONSOR_SHARE,
} from "@/app/lib/dual-sponsor";
import {
  assignLocalSponsorsToProjects,
  localExposureMultiplier,
} from "@/app/lib/match-day-local-sponsors";
import {
  isLeadClimateBrand,
  isRegisteredLocalSponsor,
  uploadedLocalSponsorsForClub,
} from "@/app/lib/match-day-branding";
import { MATCH_DAY_PROJECT_COUNT } from "@/app/lib/partner-projects";
import { formatMoney } from "@/app/lib/sponsorship-auction";
import {
  loadBrandLogo,
  loadClubSponsorRoster,
  saveBrandLogo,
} from "@/app/services/climate-sponsors.service";
import type { ClimateProject } from "@/app/services/votes.service";

export function MatchDayLocalSponsorBoard({
  clubId,
  clubName,
  projects,
  leadName,
  leadLogoUrl,
}: {
  clubId?: string;
  clubName: string;
  projects: ClimateProject[];
  leadName: string;
  leadLogoUrl?: string | null;
}) {
  const [locals, setLocals] = useState<LocalSponsorRecord[]>([]);
  const [brandName, setBrandName] = useState("");
  const [pledgeGbp, setPledgeGbp] = useState(String(LOCAL_SPONSOR_MIN_GBP));
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refreshLocals() {
    const roster = loadClubSponsorRoster(clubId || clubName, clubName);
    setLocals(
      uploadedLocalSponsorsForClub(clubName, roster.sponsors).filter(
        (row) => isRegisteredLocalSponsor(row) && !isLeadClimateBrand(row.brandName)
      )
    );
  }

  useEffect(() => {
    refreshLocals();
  }, [clubId, clubName]);

  const placements = useMemo(
    () => assignLocalSponsorsToProjects(projects, locals),
    [projects, locals]
  );
  const rankedLocals = placements
    .map((row) => row.local)
    .filter((row): row is LocalSponsorRecord => Boolean(row))
    .filter(isRegisteredLocalSponsor);

  function addLocal(event: React.FormEvent) {
    event.preventDefault();
    const pledge = Number(pledgeGbp);
    if (!brandName.trim()) {
      setError("Add the local business name.");
      return;
    }
    if (isLeadClimateBrand(brandName)) {
      setError(
        "American Express and other Lead Climate Sponsors stay in the 65% lead slot — they cannot be attached as a Local Business Climate Sponsor."
      );
      return;
    }
    if (!Number.isFinite(pledge) || pledge < LOCAL_SPONSOR_MIN_GBP) {
      setError(`Local Business Climate Sponsors pay from £${LOCAL_SPONSOR_MIN_GBP}.`);
      return;
    }
    if (locals.length >= LOCAL_SPONSORS_PER_MATCH) {
      setError(
        `Attach up to ${LOCAL_SPONSORS_PER_MATCH} Local Business Climate Sponsors — one for each Climate Project card.`
      );
      return;
    }
    setError(null);
    const record: LocalSponsorRecord = {
      brandName: brandName.trim(),
      email: "",
      clubName,
      pledgeGbp: pledge,
      createdAt: new Date().toISOString(),
      logoUrl,
      tagline: tagline.trim() || null,
      source: "uploaded",
    };
    if (logoUrl) saveBrandLogo(record.brandName, logoUrl);
    writeLocalSponsorForClub(record);
    refreshLocals();
    setBrandName("");
    setPledgeGbp(String(LOCAL_SPONSOR_MIN_GBP));
    setTagline("");
    setLogoUrl(null);
  }

  return (
    <section className="mt-10 rounded-3xl border border-amber-400/30 bg-slate-950 p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
        Local Business Climate Sponsors
      </p>
      <h3 className="mt-2 text-3xl font-black">
        Attach registered local logos, one on each Climate Project card
      </h3>
      <p className="mt-3 max-w-4xl text-slate-300">
        The Lead Climate Sponsor occupies {LEAD_CLIMATE_SPONSOR_SHARE}% of the logo space on every card
        — only that brand and logo appear on all five. Then attach Local Business
        Climate Sponsors that have registered for this club, from £
        {LOCAL_SPONSOR_MIN_GBP}. Demo brands are not shown. Together the registered
        locals occupy the remaining {100 - LEAD_CLIMATE_SPONSOR_SHARE}% of logo
        space, one local per card. Highest pledge is placed on card 1
        (Global Schools Solar); lowest on card {MATCH_DAY_PROJECT_COUNT}. A £1,500
        pledge receives {localExposureMultiplier(1500)}× the fan exposures of a £
        {LOCAL_SPONSOR_MIN_GBP} pledge, and its logo is drawn larger in the
        35% local slot.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="py-2 pr-4">Card</th>
              <th className="py-2 pr-4">Climate Project</th>
              <th className="py-2 pr-4">Local Business</th>
              <th className="py-2 pr-4">Pledge</th>
              <th className="py-2 pr-4">Fan exposures</th>
              <th className="py-2"> </th>
            </tr>
          </thead>
          <tbody>
            {placements.map((row) => (
              <tr key={row.project.id} className="border-t border-slate-800">
                <td className="py-3 pr-4 font-black text-rose-300">
                  {row.cardIndex}
                </td>
                <td className="py-3 pr-4 font-semibold text-white">
                  {row.project.name}
                </td>
                <td className="py-3 pr-4 text-slate-200">
                  {row.local?.brandName ?? "—"}
                </td>
                <td className="py-3 pr-4 text-amber-200">
                  {row.local ? formatMoney(row.local.pledgeGbp) : "—"}
                </td>
                <td className="py-3 pr-4 text-emerald-300">
                  {row.local
                    ? `${localExposureMultiplier(row.local.pledgeGbp)}× per posted fan`
                    : "—"}
                </td>
                <td className="py-3">
                  {row.local ? (
                    <button
                      type="button"
                      className="text-xs font-semibold text-slate-400 hover:text-red-300"
                      onClick={() => {
                        removeLocalSponsorForClub(clubName, row.local!.brandName);
                        refreshLocals();
                      }}
                    >
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={addLocal}
        className="mt-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-2"
      >
        <label className="block text-sm text-slate-400">
          Local business name
          <input
            value={brandName}
            onChange={(event) => setBrandName(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            placeholder="Mash Tun"
          />
        </label>
        <label className="block text-sm text-slate-400">
          Pledge (from £{LOCAL_SPONSOR_MIN_GBP})
          <input
            type="number"
            min={LOCAL_SPONSOR_MIN_GBP}
            step={50}
            value={pledgeGbp}
            onChange={(event) => setPledgeGbp(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
          />
        </label>
        <label className="block text-sm text-slate-400 md:col-span-2">
          Tagline
          <input
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            placeholder="Local hospitality with a climate pledge."
          />
        </label>
        <div className="md:col-span-2">
          <BrandLogoField
            brandName={brandName}
            logoUrl={logoUrl}
            onChange={setLogoUrl}
          />
        </div>
        {error ? (
          <p className="md:col-span-2 text-sm font-semibold text-red-300">{error}</p>
        ) : null}
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button
            type="submit"
            className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950"
          >
            Attach local sponsor
          </button>
        </div>
      </form>

      {projects.length >= MATCH_DAY_PROJECT_COUNT && leadName ? (
        <div className="mt-10 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Fan preview
          </p>
          <TodaysClimateSponsors
            leadName={leadName}
            leadLogoUrl={leadLogoUrl || loadBrandLogo(leadName)}
            locals={rankedLocals}
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {placements.map((row) => (
              <MatchDayProjectCard
                key={row.project.id}
                project={row.project}
                cardIndex={row.cardIndex}
                clubName={clubName}
                leadName={leadName}
                leadLogoUrl={leadLogoUrl}
                local={row.local}
                localScale={row.scale}
                showVote={false}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
