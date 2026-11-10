"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fileRecordDownloadName,
  loadClubProjectBoard,
  readFileRecords,
  readStoredMatchDay,
  type ClubFileRecord,
  type ClubFileProject,
  type ClubProfile,
} from "@/app/services/club-match-day.service";
import {
  hydrateClubSponsorsFromSigned,
  listClubSignedSponsorships,
  type SignedSponsorship,
} from "@/app/services/sponsor-offers.service";
import {
  isFeaturedClimateProject,
  type ClimateProject,
} from "@/app/services/votes.service";
import {
  ciltLeagueForClub,
  ciltPositionLabel,
  climateImpactLeagueTable,
} from "@/app/lib/cilt";
import { qualifyingCivTonnes } from "@/app/lib/climate-impact-value";
import {
  CLUB_ADMIN_SENT_PROJECTS_HEADING,
  CLUB_ADMIN_SENT_PROJECTS_STAMP,
  MATCH_DAY_APPROVED_LABEL,
  MATCH_DAY_FULLY_FUNDED_LABEL,
  MATCH_DAY_PENDING_APPROVAL_LABEL,
  MATCH_DAY_PROJECT_COUNT,
  MATCH_DAY_RELEASED_LABEL,
  clubDashboardLookbackCopy,
  matchDayAdminStatusLabel,
  matchDayInvitationSent,
} from "@/app/lib/partner-projects";
import {
  lookbackProjectFunding,
  matchDayProjectFundingLine,
  readProjectFunding,
} from "@/app/lib/climate-funding";
import { formatMoney } from "@/app/lib/sponsorship-auction";
import {
  dedupeLookbackRecords,
  lookbackSponsorForRecord,
} from "@/app/lib/sponsor-dashboard";
import { BrandMark } from "@/app/components/club/BrandMark";
import { FanFootprintAnalytics } from "@/app/components/club/FanFootprintAnalytics";
import { sponsorLogoSrc } from "@/app/services/teams.service";
import { SIGNED_SPONSORSHIP_EVENT } from "@/app/lib/sponsor-completion-flow";
import { approvedIdsForClubMatch } from "@/app/services/sponsor-listings.service";
import {
  isMatchDayCardPaymentConfirmed,
  paidProjectIdsForClub,
} from "@/app/lib/sponsor-card-payment";
import {
  ClimatePartnerSupplyCard,
  climatePartnerSupplyBadge,
} from "@/app/components/climate/ClimatePartnerSupplyCard";
import { isFeaturedGssName } from "@/app/lib/featured-gss";

export default function ClubAdminLookbackAndCilt({
  club,
}: {
  club: ClubProfile;
}) {
  const [voted, setVoted] = useState<ClimateProject[]>([]);
  const [funded, setFunded] = useState<ClimateProject[]>([]);
  const [selected, setSelected] = useState<ClimateProject[]>([]);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [gbpPerGoal, setGbpPerGoal] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [gbpPerVote, setGbpPerVote] = useState<number | null>(null);
  const [records, setRecords] = useState<ClubFileRecord[]>(() =>
    readFileRecords(club.id)
  );
  const [fanFunding, setFanFunding] = useState<
    ReturnType<typeof readProjectFunding>
  >([]);
  const [signedCopies, setSignedCopies] = useState<SignedSponsorship[]>([]);

  useEffect(() => {
    async function load() {
      const board = await loadClubProjectBoard(club.id, club.name);
      setVoted(board.voted);
      setFunded(board.funded);
      setSelected(board.selected);
      setMinAmount(board.minAmount);
      setRecords(board.records);
      setFanFunding(readProjectFunding(club.id));
      const stored = readStoredMatchDay(club.id);
      const storedMin =
        stored?.minAmount && stored.minAmount > 0 ? stored.minAmount : null;
      const boardMin =
        board.minAmount && board.minAmount > 0 ? board.minAmount : null;
      setMinAmount(storedMin ?? boardMin);
      setGbpPerGoal(
        stored?.gbpPerGoal && stored.gbpPerGoal > 0 ? stored.gbpPerGoal : null
      );
      setMaxAmount(
        stored?.maxAmount && stored.maxAmount > 0 ? stored.maxAmount : null
      );
      setGbpPerVote(stored?.gbpPerVote ?? null);
      await hydrateClubSponsorsFromSigned(club.id, club.name);
      setSignedCopies(
        await listClubSignedSponsorships(club.id, club.name)
      );
    }
    void load();
  }, [club.id, club.name]);

  useEffect(() => {
    async function refreshSignedLive() {
      await hydrateClubSponsorsFromSigned(club.id, club.name);
      setSignedCopies(
        await listClubSignedSponsorships(club.id, club.name)
      );
      try {
        const board = await loadClubProjectBoard(club.id, club.name);
        setVoted(board.voted);
        setFunded(board.funded);
        setSelected(board.selected);
        setRecords(board.records);
        setFanFunding(readProjectFunding(club.id));
      } catch {
        // Signed copies still refresh even if the project board cannot.
      }
    }
    function onLive() {
      void refreshSignedLive();
    }
    window.addEventListener(SIGNED_SPONSORSHIP_EVENT, onLive);
    window.addEventListener("storage", onLive);
    return () => {
      window.removeEventListener(SIGNED_SPONSORSHIP_EVENT, onLive);
      window.removeEventListener("storage", onLive);
    };
  }, [club.id, club.name]);

  const extraTonnes = useMemo(
    () =>
      [...funded, ...voted].reduce(
        (sum, project) => sum + qualifyingCivTonnes(project),
        0
      ),
    [funded, voted]
  );
  const ciltLeague = ciltLeagueForClub(club.name);
  const cilt = ciltLeague
    ? climateImpactLeagueTable(ciltLeague, club.name, extraTonnes)
    : [];
  const clubRow = cilt.find((row) => row.isClub);
  const lookbackRecords = useMemo(
    () => dedupeLookbackRecords(records),
    [records]
  );
  const approvedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const copy of signedCopies) {
      for (const project of copy.offer.projects) ids.add(project.id);
    }
    for (const id of approvedIdsForClubMatch(club.id)) ids.add(id);
    return ids;
  }, [signedCopies, club.id]);

  function downloadFileRecord() {
    const payload = {
      club: club.name,
      country: club.country,
      savedAt: new Date().toISOString(),
      thisMatchDay: {
        minAmount,
        gbpPerGoal,
        maxAmount,
        gbpPerVote,
        selected,
        voted,
        funded,
      },
      records: lookbackRecords,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileRecordDownloadName(club.name);
    link.click();
    URL.revokeObjectURL(url);
  }

  const paidIds = useMemo(() => {
    return new Set(
      paidProjectIdsForClub({ clubId: club.id, clubName: club.name })
    );
  }, [club.id, club.name, signedCopies]);
  const clubPaid = isMatchDayCardPaymentConfirmed({ clubName: club.name });
  const sentProjects: Array<ClimateProject | ClubFileProject> =
    selected.length > 0
      ? selected
      : lookbackRecords[0]?.selected ?? [];
  const sentReady = matchDayInvitationSent(sentProjects.length);

  return (
    <>
      <section
        data-sent-climate-projects={CLUB_ADMIN_SENT_PROJECTS_STAMP}
        className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
          My Admin
        </p>
        <h2 className="mt-2 text-3xl font-black">
          {CLUB_ADMIN_SENT_PROJECTS_HEADING}
        </h2>
        {!sentReady ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-8 text-slate-400">
            No Climate Projects sent to sponsors yet. Choose {MATCH_DAY_PROJECT_COUNT}{" "}
            Match Day projects and press Send Invitation to Sponsors.
          </div>
        ) : (
          <SentProjectsAccordion
            projects={sentProjects}
            approvedIds={approvedIds}
            paidIds={paidIds}
            clubPaid={clubPaid}
          />
        )}
      </section>

      <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
              Match Day File Record
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Selected and Funded Projects, kept for lookback
            </h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              {clubDashboardLookbackCopy()}
            </p>
          </div>
          <button
            onClick={downloadFileRecord}
            className="rounded-xl border border-green-500 px-5 py-3 font-semibold text-green-400"
          >
            Download file record
          </button>
        </div>

        {lookbackRecords.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-8 text-slate-400">
            No file records yet. Confirm {MATCH_DAY_PROJECT_COUNT} Match Day
            projects to create the first record.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {lookbackRecords.map((record) => {
              const sponsor = lookbackSponsorForRecord(
                record,
                signedCopies,
                (name) => sponsorLogoSrc(name, null)
              );
              return (
                <LookbackSponsorshipAccordion
                  key={record.id}
                  record={record}
                  sponsor={sponsor}
                  approvedIds={approvedIds}
                  fanFunding={fanFunding}
                  catalog={selected}
                />
              );
            })}
          </div>
        )}
      </section>

      <FanFootprintAnalytics
        clubName={club.name}
        sponsorships={lookbackRecords.map((record) => {
          const sponsor = lookbackSponsorForRecord(
            record,
            signedCopies,
            (name) => sponsorLogoSrc(name, null)
          );
          return {
            fixture: record.matchLabel,
            amountGbp: record.minAmount ?? 0,
            savedAt: record.savedAt,
            sponsorName: sponsor?.name ?? record.sponsorName ?? null,
          };
        })}
      />

      <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
              S4P Climate Impact League Table
            </p>
            <h2 className="mt-2 text-3xl font-black">
              CILT · {ciltLeague ?? "League"}
            </h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              {ciltLeague
                ? `${ciltLeague} clubs ranked by tonnes of carbon avoided, reduced or offset from Goals scored and fan votes.`
                : "Clubs ranked by tonnes of carbon avoided, reduced or offset from sponsorship funded by Goals scored."}
            </p>
          </div>
          {clubRow && (
            <div className="rounded-2xl bg-green-500 px-6 py-4 text-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                {club.name} position
              </p>
              <p className="text-3xl font-black">
                {ciltPositionLabel(clubRow)}
              </p>
              <p className="text-sm font-semibold">
                {clubRow.tonnes.toLocaleString("en-GB")} t CO₂
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
          <div className="grid grid-cols-12 bg-slate-950 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span className="col-span-2">Pos</span>
            <span className="col-span-7">Club</span>
            <span className="col-span-3 text-right">t CO₂</span>
          </div>
          {cilt.map((row) => (
            <div
              key={row.club}
              className={`grid grid-cols-12 border-t border-slate-800 px-5 py-4 ${
                row.isClub ? "bg-green-500 text-slate-950" : "bg-slate-950/40"
              }`}
            >
              <strong className="col-span-2">{row.position}</strong>
              <span className="col-span-7 font-semibold">{row.club}</span>
              <span className="col-span-3 text-right font-black">
                {row.tonnes.toLocaleString("en-GB")}
              </span>
            </div>
          ))}
          {cilt.length === 0 && (
            <div className="border-t border-slate-800 px-5 py-6 text-slate-400">
              This club is not yet ranked in a CILT league table.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function SentProjectsAccordion({
  projects,
  approvedIds,
  paidIds,
  clubPaid,
}: {
  projects: Array<ClimateProject | ClubFileProject>;
  approvedIds: Set<string>;
  paidIds: Set<string>;
  clubPaid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const detailsId = "sent-climate-projects";
  const releasedCount = projects.filter((project) =>
    matchDayAdminStatusLabel({
      approved: approvedIds.has(project.id),
      paid: paidIds.has(project.id) || clubPaid,
    }) === MATCH_DAY_RELEASED_LABEL
  ).length;
  const overall =
    releasedCount === projects.length && projects.length > 0
      ? MATCH_DAY_RELEASED_LABEL
      : MATCH_DAY_PENDING_APPROVAL_LABEL;

  return (
    <article
      data-sent-projects-accordion="sent-projects-accordion-v1"
      className="mt-6 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950"
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-start gap-3 p-6 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xl font-bold text-white">
              {projects.length} Climate Projects sent to sponsors
            </span>
            <span className="mt-2 inline-flex rounded-full border border-s4p-mark bg-s4p-mark/15 px-3 py-1 text-xs font-semibold text-slate-950">
              {overall}
            </span>
          </span>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            {open ? "Hide" : "Details"}
          </span>
        </button>
      </h3>
      {open ? (
        <div id={detailsId} className="grid gap-4 px-6 pb-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => {
            const featured =
              "featured" in project
                ? isFeaturedClimateProject(project as ClimateProject)
                : isFeaturedGssName(project.name);
            const approved = approvedIds.has(project.id);
            const paid = paidIds.has(project.id) || clubPaid;
            const status = matchDayAdminStatusLabel({ approved, paid });
            const badge = featured
              ? climatePartnerSupplyBadge("featured")
              : climatePartnerSupplyBadge("local");
            return (
              <ClimatePartnerSupplyCard
                key={project.id || `${project.name}-${index}`}
                project={{
                  id: project.id,
                  name: project.name,
                  description: project.description,
                  category: project.category,
                  image_url:
                    "image_url" in project
                      ? (project as ClimateProject).image_url
                      : null,
                  country: project.country,
                  location:
                    "location" in project
                      ? (project as ClimateProject).location
                      : null,
                  funding_goal:
                    "funding_goal" in project
                      ? (project as ClimateProject).funding_goal
                      : null,
                  estimated_co2:
                    "estimated_co2" in project
                      ? (project as ClimateProject).estimated_co2
                      : null,
                  status:
                    "status" in project
                      ? (project as ClimateProject).status
                      : null,
                }}
                badge={badge}
              >
                <p
                  className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold text-slate-950 ${
                    status === MATCH_DAY_RELEASED_LABEL
                      ? "bg-s4p-mark"
                      : "border border-s4p-mark bg-s4p-mark/15"
                  }`}
                >
                  {status}
                </p>
              </ClimatePartnerSupplyCard>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}

function LookbackSponsorshipAccordion({
  record,
  sponsor,
  approvedIds,
  fanFunding,
  catalog,
}: {
  record: ClubFileRecord;
  sponsor: { name: string; logoUrl: string | null } | null;
  approvedIds: Set<string>;
  fanFunding: ReturnType<typeof readProjectFunding>;
  catalog: ClimateProject[];
}) {
  const [open, setOpen] = useState(false);
  const detailsId = `lookback-${record.id}`;

  return (
    <article
      data-lookback-accordion="lookback-accordion-v1"
      className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950"
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-start gap-3 p-6 text-left"
        >
          {sponsor ? (
            <BrandMark name={sponsor.name} logoUrl={sponsor.logoUrl} />
          ) : null}
          <span className="min-w-0 flex-1">
            <span className="block text-xl font-bold text-white">
              {record.matchLabel}
            </span>
            <span className="mt-1 block text-sm font-semibold text-amber-300">
              Sponsored by {sponsor?.name ?? "a Climate Sponsor"}
            </span>
            <span className="mt-2 block text-sm text-green-300">
              Match-Sponsorship: {formatMoney(record.minAmount ?? 0)}
            </span>
          </span>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            {open ? "Hide" : "Details"}
          </span>
        </button>
      </h3>
      {open ? (
        <div id={detailsId} className="px-6 pb-6">
          <p className="text-sm text-slate-400">
            {new Date(record.savedAt).toLocaleString("en-GB")}
          </p>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Selected
          </p>
          <ul className="mt-2 space-y-2 text-slate-300">
            {record.selected.map((project) => {
              const approved =
                approvedIds.has(project.id) || Boolean(sponsor);
              const funding = lookbackProjectFunding({
                project,
                fanFunding,
                catalog,
              });
              return (
                <li
                  key={project.id}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span>• {project.name}</span>
                  {approved ? (
                    <span className="rounded-full bg-s4p-mark px-2.5 py-0.5 text-xs font-semibold text-slate-950">
                      {MATCH_DAY_APPROVED_LABEL}
                    </span>
                  ) : null}
                  {funding.fullyFunded ? (
                    <span className="rounded-full bg-s4p-mark px-2.5 py-0.5 text-xs font-semibold text-slate-950">
                      {MATCH_DAY_FULLY_FUNDED_LABEL}
                    </span>
                  ) : null}
                  {approved &&
                  (funding.soughtGbp > 0 || funding.receivedGbp > 0) ? (
                    <span className="text-sm text-green-300">
                      {matchDayProjectFundingLine(
                        funding.receivedGbp,
                        funding.soughtGbp
                      )}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
