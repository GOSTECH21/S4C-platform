"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutSponsor } from "@/app/services/sponsor-auth.service";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  loadSponsorFolder,
  listSponsorSentProposals,
  type SignedSponsorship,
  type SponsorDashboardStats,
  type SponsorMatchOffer,
  type SponsorProjectProposal,
} from "@/app/services/sponsor-offers.service";
import {
  clearMatchDayLock,
  ensureGoalNetwork,
  listInvitesForSponsor,
  loadBrandLogo,
  loadGoalNetwork,
  loadMatchDayLock,
  lockMatchDayClub,
  readLogoFile,
  respondToNetworkInvite,
  saveBrandLogo,
} from "@/app/services/climate-sponsors.service";
import { ClubNetworkPicker } from "@/app/components/sponsor/ClubNetworkPicker";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  MATCH_DAY_LOCK_LABELS,
  lockCopy,
  unlockedMatchDay,
  type GoalSponsorshipNetwork,
  type MatchDayClubLock,
  type NetworkInvite,
} from "@/app/lib/climate-sponsors";
import { leagueForClubName } from "@/app/lib/current-season";
import {
  CLUB_LOGIN_PATH,
  SPONSOR_CREATE_CAMPAIGN_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_OFFERS_PATH,
} from "@/app/lib/routes";
import { formatLongMatchDate } from "@/app/lib/s4p-climate-projects";
import { formatMoney, formatVoteCount } from "@/app/lib/sponsorship-auction";
import { sponsorLogoSrc } from "@/app/services/teams.service";

const EMPTY_STATS: SponsorDashboardStats = {
  projectCount: 0,
  carbonTonnes: 0,
  expenditureGbp: 0,
  fanVotes: 0,
};

export default function SponsorDashboardPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("your brand");
  const [pending, setPending] = useState<SponsorMatchOffer[]>([]);
  const [signed, setSigned] = useState<SignedSponsorship[]>([]);
  const [sentCampaigns, setSentCampaigns] = useState<SponsorProjectProposal[]>(
    []
  );
  const [stats, setStats] = useState<SponsorDashboardStats>(EMPTY_STATS);
  const [network, setNetwork] = useState<GoalSponsorshipNetwork | null>(null);
  const [lock, setLock] = useState<MatchDayClubLock | null>(null);
  const [invites, setInvites] = useState<NetworkInvite[]>([]);
  const [lockClub, setLockClub] = useState("");
  const [lockLabel, setLockLabel] = useState(MATCH_DAY_LOCK_LABELS[0]);
  const [networkClubs, setNetworkClubs] = useState<string[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      let sponsorName = "your brand";
      let sponsorId = "";
      let sponsorEmail: string | null = null;
      try {
        const sponsor = await getCurrentSponsor();
        sponsorName = String(sponsor.name ?? "your brand");
        sponsorId = String(sponsor.id ?? "");
        sponsorEmail = (sponsor.email as string | null) ?? null;
        setBrand(sponsorName);
        setEmail(sponsorEmail);
        const uploaded = loadBrandLogo(sponsorName);
        const fromRecord = (sponsor.logo_url as string | null) ?? null;
        setLogoUrl(
          uploaded || fromRecord || sponsorLogoSrc(sponsorName, fromRecord)
        );
        const existing = loadGoalNetwork(sponsorName, sponsorEmail);
        setNetwork(existing);
        setNetworkClubs(existing?.clubNames ?? []);
        const currentLock = loadMatchDayLock(sponsorName);
        setLock(currentLock);
        setLockClub(currentLock?.clubName ?? "");
        if (currentLock?.matchLabel) setLockLabel(currentLock.matchLabel);
        setInvites(listInvitesForSponsor(sponsorName, sponsorEmail));
        setLoading(false);
        const folder = await loadSponsorFolder({
          sponsorId,
          brandName: sponsorName,
          brandEmail: sponsorEmail,
        });
        setPending(folder.pending);
        setSigned(folder.signed);
        setStats(folder.stats);
        setSentCampaigns(
          await listSponsorSentProposals(sponsorId, sponsorName)
        );
      } catch (err) {
        if (!sponsorId) {
          router.replace(SPONSOR_LOGIN_PATH);
          return;
        }
        setError(err instanceof Error ? err.message : "Could not load offers.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function logout() {
    await logoutSponsor();
    router.push(SPONSOR_LOGIN_PATH);
  }

  async function refreshFolder() {
    const folder = await loadSponsorFolder({ brandName: brand, brandEmail: email });
    setPending(folder.pending);
    setSigned(folder.signed);
  }

  function applyMatchDayLock(clubName: string, matchLabel: string) {
    const club = clubName.trim();
    setLockLabel(matchLabel);
    if (!club) {
      clearMatchDayLock(brand);
      setLock(null);
      setLockClub("");
      void refreshFolder();
      return;
    }
    const next = lockMatchDayClub({
      brandName: brand,
      clubName: club,
      matchLabel,
    });
    setLock(next);
    setLockClub(club);
    void refreshFolder();
  }

  function unlockMatchDay() {
    const cleared = unlockedMatchDay(lockLabel);
    applyMatchDayLock(cleared.clubName, cleared.matchLabel);
  }

  if (loading) {
    return <p className="text-slate-400">Loading sponsor dashboard...</p>;
  }

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <BrandMark name={brand} logoUrl={logoUrl} large />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
                Signed in as {brand}
              </p>
              <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-green-400">
                {logoUrl ? "Change brand logo" : "Upload brand logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void readLogoFile(file).then((next) => {
                      setLogoUrl(next);
                      saveBrandLogo(brand, next);
                    });
                  }}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight">
            S4P SPONSORSHIP DASHBOARD
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Receive the club&apos;s 5 Climate Projects, sign them off, and keep
            the settled sponsorships in your folder — including carbon impact,
            spend, and fans who voted with your brand on screen.
          </p>
        </div>
        <button
          onClick={() => void logout()}
          className="rounded-xl bg-red-500 px-5 py-3 font-semibold"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {invites.some((row) => row.status === "pending") && (
        <section className="rounded-3xl border border-blue-500/30 bg-slate-900 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
            LinkedIn-style requests
          </p>
          <h2 className="mt-2 text-3xl font-black">Goal Sponsorship Network</h2>
          <div className="mt-6 space-y-4">
            {invites
              .filter((row) => row.status === "pending")
              .map((invite) => {
                const league = leagueForClubName(invite.fromClubName);
                return (
                  <div
                    key={invite.id}
                    className="rounded-2xl border border-slate-700 bg-slate-950 p-5"
                  >
                    <p className="text-sm text-slate-400">
                      From {invite.fromDirectorName} at {invite.fromClubName}
                    </p>
                    <p className="mt-2 text-slate-200">{invite.message}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          respondToNetworkInvite({
                            inviteId: invite.id,
                            brandName: brand,
                            email,
                            accept: true,
                            includeLeague: false,
                          });
                          const next = loadGoalNetwork(brand, email);
                          setNetwork(next);
                          setNetworkClubs(next?.clubNames ?? []);
                          if (next?.clubNames[0] && !lock) {
                            setLockClub(next.clubNames[0]);
                          }
                          setInvites(listInvitesForSponsor(brand, email));
                        }}
                        className="rounded-xl bg-green-500 px-4 py-3 font-bold text-slate-950"
                      >
                        Add {invite.fromClubName}
                      </button>
                      {league && (
                        <button
                          type="button"
                          onClick={() => {
                            respondToNetworkInvite({
                            inviteId: invite.id,
                            brandName: brand,
                            email,
                            accept: true,
                            includeLeague: true,
                          });
                          const next = loadGoalNetwork(brand, email);
                          setNetwork(next);
                          setNetworkClubs(next?.clubNames ?? []);
                          if (next?.clubNames[0] && !lock) {
                            setLockClub(next.clubNames[0]);
                          }
                          setInvites(listInvitesForSponsor(brand, email));
                          }}
                          className="rounded-xl border border-green-500/40 px-4 py-3 font-semibold text-green-300"
                        >
                          Add every {league} club
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          respondToNetworkInvite({
                            inviteId: invite.id,
                            brandName: brand,
                            email,
                            accept: false,
                            includeLeague: false,
                          });
                          setInvites(listInvitesForSponsor(brand, email));
                        }}
                        className="rounded-xl border border-slate-600 px-4 py-3 text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-green-500/30 bg-slate-900 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          Match Day lock-in
        </p>
        <h2 className="mt-2 text-3xl font-black">
          Select the club whose Goals you will sponsor
        </h2>
        <p className="mt-3 max-w-3xl text-slate-300">{lockCopy()}</p>
        <div className="mt-6 rounded-2xl border border-green-500/40 bg-green-500/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-green-300">
            {lockClub ? "Locked in" : "Choose a club"}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-400">
              Club
              <select
                value={lockClub}
                onChange={(event) =>
                  applyMatchDayLock(event.target.value, lockLabel)
                }
                className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
              >
                <option value="">Select a club</option>
                {(
                  Array.from(
                    new Set([...(network?.clubNames ?? []), lockClub].filter(Boolean))
                  ) as string[]
                ).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  )
                )}
              </select>
            </label>
            <label className="block text-sm text-slate-400">
              Match
              <select
                value={lockLabel}
                onChange={(event) =>
                  applyMatchDayLock(lockClub, event.target.value)
                }
                className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
              >
                {MATCH_DAY_LOCK_LABELS.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {lockClub ? (
            <>
              <p className="mt-4 text-2xl font-black">
                {lockClub} · {lockLabel}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Posted Climate Projects from other clubs will not appear on this
                dashboard until you change this lock.
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              Unlock cleared the club from this box. Pick a club on the left and
              the Match Day on the right — or tap a club in your Goal
              Sponsorship Network.
            </p>
          )}
          <button
            type="button"
            onClick={unlockMatchDay}
            disabled={!lockClub}
            className="mt-4 rounded-xl border border-slate-600 px-4 py-2 text-sm disabled:opacity-40"
          >
            Unlock
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
        <h2 className="text-2xl font-black">Goal Sponsorship Network</h2>
        <p className="mt-2 text-slate-400">
          Clubs you chose at registration plus any you accepted from a
          Sustainability Director. Add more at any time. Tap a club already in
          your network to put it in the lock box above — that replaces the
          previous club. Choose the Match (Premier League, Champions League,
          FA Cup) on the right of that box.
        </p>
        <div className="mt-6">
          <ClubNetworkPicker
            selected={networkClubs}
            matchDayClub={lockClub}
            onChooseMatchDayClub={(club) => applyMatchDayLock(club, lockLabel)}
            onChange={(clubs) => {
              setNetworkClubs(clubs);
              const next = ensureGoalNetwork({
                brandName: brand,
                clubNames: clubs,
              });
              setNetwork(next);
            }}
            compact
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Climate Projects sponsored"
          value={String(stats.projectCount)}
        />
        <StatCard
          label="Carbon impact"
          value={`${formatVoteCount(Math.round(stats.carbonTonnes))} tCO₂e`}
        />
        <StatCard
          label="Total expenditure"
          value={formatMoney(stats.expenditureGbp)}
        />
        <StatCard
          label="Fans who voted and saw your brand"
          value={formatVoteCount(stats.fanVotes)}
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Link
          href={SPONSOR_OFFERS_PATH}
          className="rounded-3xl border border-slate-700 bg-slate-900 p-8 hover:border-green-500"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
            Option 1
          </p>
          <h2 className="mt-3 text-2xl font-black">Receive the club&apos;s 5</h2>
          <p className="mt-3 text-slate-300">
            After you lock in a club, open New Sponsorship/Score Offer. If that
            club&apos;s Sustainability Director posted their 5 to you, sign them
            off here. Posts from other clubs stay hidden while the lock is on.
          </p>
          <p className="mt-5 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950">
            {pending.length > 0
              ? `Open ${pending.length} new offer${pending.length === 1 ? "" : "s"}`
              : "Open New Sponsorship/Score Offer"}
          </p>
        </Link>
        <Link
          href={SPONSOR_CREATE_CAMPAIGN_PATH}
          className="rounded-3xl border border-slate-700 bg-slate-900 p-8 hover:border-green-500"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
            Option 2
          </p>
          <h2 className="mt-3 text-2xl font-black">
            Create Your Sponsorship Campaign
          </h2>
          <p className="mt-3 text-slate-300">
            Choose 5 Climate Projects yourself — Global Schools Solar plus 4
            from List 1 (local) and List 2 (international) — and send them to
            the Sustainability Director to push to fans.
          </p>
        </Link>
      </section>

      <section className="rounded-3xl border border-blue-500/30 bg-slate-900 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
          Option 2 campaigns you sent
        </p>
        <h2 className="mt-2 text-3xl font-black">
          Waiting for Post these to fans
        </h2>
        <p className="mt-2 text-slate-300">
          After you create a campaign, the club Sustainability Director posts
          it to fans. Log in as that club to see the blue{" "}
          <strong>Post these to fans</strong> button under Sponsorship
          Selected Projects.
        </p>
        {sentCampaigns.length === 0 ? (
          <p className="mt-6 text-slate-500">
            No campaign sent yet. Choose 5 Climate Projects in Option 2, then
            click the blue send button.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {sentCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-2xl border border-slate-700 bg-slate-950 p-6"
              >
                <p className="text-sm text-green-300">
                  Sent to {campaign.clubName}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {campaign.status === "posted"
                    ? "The Sustainability Director has posted this list to fans."
                    : "The Sustainability Director still needs to click Post these to fans."}
                </p>
                <ul className="mt-4 space-y-1 text-slate-300">
                  {campaign.projects.map((project) => (
                    <li key={project.id}>• {project.name}</li>
                  ))}
                </ul>
                {campaign.status !== "posted" && (
                  <Link
                    href={`${CLUB_LOGIN_PATH}#sponsorship-selected`}
                    className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500"
                  >
                    Post these to fans
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section
        id="signed-folder"
        className="rounded-3xl border border-slate-700 bg-slate-900 p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          Folder
        </p>
        <h2 className="mt-2 text-3xl font-black">Signed sponsorships</h2>
        <p className="mt-2 text-slate-400">
          Once you sign off a club&apos;s 5 and the sponsorship is settled, it
          is lodged here.
        </p>
        {signed.length === 0 ? (
          <p className="mt-6 text-slate-500">
            No signed sponsorships yet. Use Option 1 to receive the club&apos;s
            5, agree, and sign them off.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {signed.map((row) => {
              const when = formatLongMatchDate(row.offer.matchDate);
              return (
                <div
                  key={row.signature.id}
                  className="rounded-2xl border border-green-500/30 bg-slate-950 p-6"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="text-sm text-green-300">
                        SPONSORED BY {row.signature.brandName}
                      </p>
                      <h3 className="mt-1 text-xl font-bold">
                        {row.offer.headline}
                      </h3>
                      {when && (
                        <p className="mt-1 text-sm text-slate-400">{when}</p>
                      )}
                      <p className="mt-1 text-sm text-slate-400">
                        Signed by {row.signature.signerName} on{" "}
                        {new Date(row.signature.signedAt).toLocaleString("en-GB")}
                      </p>
                    </div>
                    <p className="font-semibold text-green-300">
                      {formatMoney(
                        Number(row.offer.sponsorshipAmountGbp) || 0
                      )}
                    </p>
                  </div>
                  <ul className="mt-4 space-y-1 text-slate-300">
                    {row.offer.projects.map((project) => (
                      <li key={project.id}>
                        • {project.name}
                        {project.estimated_co2
                          ? ` — ${formatVoteCount(Math.round(Number(project.estimated_co2)))} tCO₂e`
                          : ""}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`${SPONSOR_OFFERS_PATH}/${row.offer.id}`}
                    className="mt-4 inline-flex text-sm font-semibold text-green-400"
                  >
                    Open signed copy
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
