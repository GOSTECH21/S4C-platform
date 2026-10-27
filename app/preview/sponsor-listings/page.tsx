"use client";

import { useEffect, useMemo, useState } from "react";
import { ClubSponsorsListings } from "@/app/components/club/ClubSponsorsListings";
import { SponsorInviteInbox } from "@/app/components/sponsor/SponsorInviteInbox";
import {
  MATCH_DAY_APPROVED_LABEL,
  MATCH_DAY_PENDING_APPROVAL_LABEL,
  matchDayProjectApprovalLabel,
} from "@/app/lib/partner-projects";
import {
  INVITE_LOCKED_NEXT_COPY,
  localInvitesSentCopy,
  commitGlobalSponsorship,
  createInviteRound,
  listingsOfKind,
  mergeInviteRound,
  requireExactInviteCount,
  seededSponsorListings,
  type SponsorInviteRound,
  type SponsorListing,
  type SponsorListingKind,
} from "@/app/lib/sponsor-listings";
import { saveClubInviteRound } from "@/app/services/sponsor-listings.service";

const PROJECTS = [
  { id: "gss", name: "Global Schools Solar" },
  { id: "cookstoves", name: "Clean Cookstoves Kenya" },
  { id: "mangrove", name: "Mangrove Restore Sundarbans" },
  { id: "kenya-solar", name: "Solar Irrigation Sudan" },
  { id: "amazon", name: "Amazon Community Reforestation" },
];

export default function SponsorListingsPreviewPage() {
  const listings = useMemo(() => seededSponsorListings(), []);
  const globals = listingsOfKind(listings, "global");
  const locals = listingsOfKind(listings, "local");
  const [selectedGlobalIds, setSelectedGlobalIds] = useState<string[]>(
    globals.slice(0, 5).map((row) => row.id)
  );
  const [selectedLocalIds, setSelectedLocalIds] = useState<string[]>(
    locals.slice(0, 10).map((row) => row.id)
  );
  const [round, setRound] = useState<SponsorInviteRound | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialTab] = useState<SponsorListingKind>(() => {
    if (typeof window === "undefined") return "global";
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") === "local" || params.get("demo") === "local-sent"
      ? "local"
      : "global";
  });
  const sentAt = useMemo(
    () => new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    []
  );
  const hoursAfterSent = (hours: number) =>
    new Date(new Date(sentAt).getTime() + hours * 60 * 60 * 1000).toISOString();
  const approved = Boolean(round?.lockedListingId);
  const bidder = globals.find((row) => selectedGlobalIds.includes(row.id)) ?? globals[0];
  const demoLocalInvite =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("demo") === "local-invite";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const demo = params.get("demo");
    if (
      demo !== "lock" &&
      demo !== "winner" &&
      demo !== "sent" &&
      demo !== "local-sent" &&
      demo !== "local-invite"
    ) {
      return;
    }
    const drafted = createInviteRound({
      clubId: "hearts-demo",
      clubName: "Hearts",
      directorName: "Alex Director",
      matchLabel: "Hearts v Rangers",
      projectIds: PROJECTS.map((row) => row.id),
      projectNames: PROJECTS.map((row) => row.name),
      globalInviteeIds: selectedGlobalIds,
      localInviteeIds: selectedLocalIds,
      sentAt,
    });
    if (demo === "sent" || demo === "local-sent" || demo === "local-invite") {
      saveClubInviteRound(drafted);
      setRound(drafted);
      setNotice(
        demo === "local-sent"
          ? localInvitesSentCopy(selectedLocalIds.length)
          : "Invitation to Sponsor sent to 5 Global Brands. Only one will be accepted — highest amount within 8 hours."
      );
      return;
    }
    const first = commitGlobalSponsorship(
      drafted,
      bidder,
      demo === "winner"
        ? 12500
        : 8000,
      hoursAfterSent(1)
    );
    if (demo === "winner") {
      saveClubInviteRound(first.round);
      setRound(first.round);
      setNotice(`${INVITE_LOCKED_NEXT_COPY}.`);
      return;
    }
    const rival =
      globals.find((row) => row.id !== bidder.id && selectedGlobalIds.includes(row.id)) ??
      bidder;
    const second = commitGlobalSponsorship(
      first.round,
      rival,
      12000,
      hoursAfterSent(3)
    );
    saveClubInviteRound(second.round);
    setRound(second.round);
    setNotice(
      `${second.round.lockedBrandName} locked in at £${second.round.lockedAmountGbp?.toLocaleString("en-GB")}. Projects are ${MATCH_DAY_APPROVED_LABEL}.`
    );
    // Preview-only ?demo=lock / ?demo=winner bootstrap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(listing: SponsorListing) {
    if (listing.kind === "global") {
      setSelectedGlobalIds((current) => toggleId(current, listing.id));
    } else {
      setSelectedLocalIds((current) => toggleId(current, listing.id));
    }
  }

  function invite(kind: SponsorListingKind) {
    const selected = kind === "global" ? selectedGlobalIds : selectedLocalIds;
    const countError = requireExactInviteCount(selected, kind === "global" ? 5 : 10, kind);
    if (countError) {
      setError(countError);
      setNotice(null);
      return;
    }
    const drafted = createInviteRound({
      clubId: "hearts-demo",
      clubName: "Hearts",
      directorName: "Alex Director",
      matchLabel: "Hearts v Rangers",
      projectIds: PROJECTS.map((row) => row.id),
      projectNames: PROJECTS.map((row) => row.name),
      globalInviteeIds: kind === "global" ? selectedGlobalIds : [],
      localInviteeIds: kind === "local" ? selectedLocalIds : [],
      sentAt,
    });
    const next = round ? mergeInviteRound(round, drafted) : drafted;
    saveClubInviteRound(next);
    setRound(next);
    setError(null);
    setNotice(
      kind === "global"
        ? "Invitation to Sponsor recorded for 5 Global Brands. Highest amount within 8 hours wins."
        : localInvitesSentCopy(selected.length)
    );
  }

  function simulateHighestBid(current = round) {
    if (!current || !bidder) {
      setError("Send the Global Brand invitations first.");
      return;
    }
    const first = commitGlobalSponsorship(
      current,
      bidder,
      8000,
      hoursAfterSent(1)
    );
    const rival =
      globals.find((row) => row.id !== bidder.id && selectedGlobalIds.includes(row.id)) ??
      bidder;
    const second = commitGlobalSponsorship(
      first.round,
      rival,
      12000,
      hoursAfterSent(3)
    );
    saveClubInviteRound(second.round);
    setRound(second.round);
    setNotice(
      `${second.round.lockedBrandName} locked in at £${second.round.lockedAmountGbp?.toLocaleString("en-GB")}. Projects are ${MATCH_DAY_APPROVED_LABEL}.`
    );
    setError(null);
  }

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <ClubSponsorsListings
          clubName="Hearts"
          matchLabel="Hearts v Rangers"
          projectNames={PROJECTS.map((row) => row.name)}
          projectCount={PROJECTS.length}
          listings={listings}
          round={round}
          notice={notice}
          error={error}
          selectedGlobalIds={selectedGlobalIds}
          selectedLocalIds={selectedLocalIds}
          onToggle={toggle}
          onInvite={invite}
          initialTab={initialTab}
        />
        <button
          type="button"
          onClick={simulateHighestBid}
          className="w-full rounded-xl border border-amber-400/40 bg-amber-400/10 py-3 font-bold text-amber-200"
        >
          Preview: two Global Brands commit — highest amount locks in
        </button>
        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <h2 className="text-2xl font-black">Climate Projects for this Match Day</h2>
          <ul className="mt-4 space-y-2">
            {PROJECTS.map((project) => (
              <li key={project.id} className="flex items-center gap-2">
                <span>{project.name}</span>
                <span className="rounded-full bg-s4p-mark px-2.5 py-0.5 text-xs font-semibold text-slate-950">
                  {matchDayProjectApprovalLabel(approved)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-400">
            Before lock-in they show {MATCH_DAY_PENDING_APPROVAL_LABEL}. After the
            highest Global Brand commits within 8 hours they show{" "}
            {MATCH_DAY_APPROVED_LABEL} and appear to Hearts fans.
          </p>
        </section>
        {round && (demoLocalInvite ? locals[0] : bidder) && (
          <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
            <h2 className="text-2xl font-black">Sponsor invitation inbox</h2>
            <div className="mt-6">
              <SponsorInviteInbox
                listing={demoLocalInvite ? locals[0] : bidder}
                rounds={[round]}
                onRoundChange={setRound}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((row) => row !== id) : [...ids, id];
}
