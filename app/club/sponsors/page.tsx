"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  SUGGESTED_CLIMATE_BRANDS,
  emptySponsor,
  rankSponsorsBySpend,
  topClimateSponsors,
  type ClubClimateSponsor,
  type ClubSponsorRoster,
} from "@/app/lib/climate-sponsors";
import { formatMoney } from "@/app/lib/sponsorship-auction";
import {
  CLUB_DASHBOARD_PATH,
  CLUB_LOGIN_PATH,
} from "@/app/lib/routes";
import { loadClubSession } from "@/app/services/club-match-day.service";
import {
  addClubClimateSponsor,
  deleteClubClimateSponsor,
  loadClubSponsorRoster,
  loadGoalNetwork,
  loadMatchDayLock,
  sendNetworkInvite,
  setMatchDaySponsorTargets,
  updateClubClimateSponsor,
} from "@/app/services/climate-sponsors.service";
import { leagueForClubName } from "@/app/lib/current-season";

export default function OurClimateSponsorsPage() {
  const router = useRouter();
  const [clubId, setClubId] = useState<string | null>(null);
  const [clubName, setClubName] = useState("your club");
  const [directorName, setDirectorName] = useState("Sustainability Director");
  const [roster, setRoster] = useState<ClubSponsorRoster | null>(null);
  const [editing, setEditing] = useState<ClubClimateSponsor>(emptySponsor());
  const [inviteMessage, setInviteMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const session = await loadClubSession();
      if (!session) {
        router.replace(CLUB_LOGIN_PATH);
        return;
      }
      setClubId(session.club.id);
      setClubName(session.club.name);
      setDirectorName(
        [session.account.first_name, session.account.last_name]
          .filter(Boolean)
          .join(" ") || "Sustainability Director"
      );
      setRoster(loadClubSponsorRoster(session.club.id, session.club.name));
      setLoading(false);
    }
    void load();
  }, [router]);

  const ranked = useMemo(
    () => rankSponsorsBySpend(roster?.sponsors ?? []),
    [roster]
  );
  const topThree = useMemo(() => topClimateSponsors(roster?.sponsors ?? []), [roster]);

  function refresh(next: ClubSponsorRoster) {
    setRoster(next);
  }

  function saveSponsor(event: React.FormEvent) {
    event.preventDefault();
    if (!clubId) return;
    setNotice(null);
    const saved = roster?.sponsors.some((row) => row.id === editing.id)
      ? updateClubClimateSponsor(clubId, clubName, editing)
      : addClubClimateSponsor(clubId, clubName, editing);
    refresh(saved);
    const savedName = editing.brandName.trim() || "Sponsor";
    setEditing(emptySponsor());
    setNotice(`${savedName} is on Our Climate Sponsors.`);
  }

  function invite(sponsor: ClubClimateSponsor) {
    if (!clubId) return;
    const league = leagueForClubName(clubName);
    sendNetworkInvite({
      fromClubId: clubId,
      fromClubName: clubName,
      fromDirectorName: directorName,
      toBrandName: sponsor.brandName,
      toEmail: sponsor.email,
      message:
        inviteMessage.trim() ||
        `Please add ${clubName} to your Goal Sponsorship Network so we can send you our Match Day Climate Projects.${
          league ? ` Accepting also lets you add every club in the ${league}.` : ""
        }`,
    });
    setNotice(
      `LinkedIn-style request sent to ${sponsor.brandName}. If they accept, ${clubName} joins their Goal Sponsorship Network.`
    );
  }

  if (loading || !roster) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading Our Climate Sponsors...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.push(CLUB_DASHBOARD_PATH)}
          className="text-sm font-semibold text-green-400 hover:underline"
        >
          ← Back to dashboard
        </button>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          {clubName}
        </p>
        <h1 className="mt-2 text-4xl font-black">Our Climate Sponsors</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Add brands, decision-maker contacts and branding. Rank them by climate-project
          spend. Select who should receive your next Match Day five, then send a
          LinkedIn-style request if they still need {clubName} on their Goal
          Sponsorship Network.
        </p>

        {notice && (
          <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-300">
            {notice}
          </div>
        )}

        {topThree.length > 0 && (
          <section className="mt-10 rounded-3xl border border-amber-400/30 bg-amber-400/5 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
              Promote on the club website
            </p>
            <h2 className="mt-2 text-2xl font-black">Top 3 Climate Project Sponsors</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {topThree.map((sponsor, index) => (
                <div
                  key={sponsor.id}
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-5"
                >
                  <div className="flex items-center gap-3">
                    <BrandMark name={sponsor.brandName} logoUrl={sponsor.logoUrl} />
                    <div>
                      <p className="text-xs text-amber-300">#{index + 1}</p>
                      <h3 className="text-xl font-bold">{sponsor.brandName}</h3>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    Climate spend {formatMoney(sponsor.spentGbp)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <h2 className="text-2xl font-black">
            {editing.brandName ? `Edit ${editing.brandName}` : "Add a sponsor / brand"}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTED_CLIMATE_BRANDS.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setEditing(emptySponsor({ ...editing, brandName: brand }))}
                className="rounded-full border border-slate-600 px-3 py-1 text-sm hover:border-green-400"
              >
                {brand}
              </button>
            ))}
          </div>
          <form onSubmit={saveSponsor} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              required
              placeholder="Brand name"
              value={editing.brandName}
              onChange={(event) =>
                setEditing({ ...editing, brandName: event.target.value })
              }
              className="rounded-lg bg-slate-800 p-3"
            />
            <input
              placeholder="Logo / branding URL"
              value={editing.logoUrl}
              onChange={(event) =>
                setEditing({ ...editing, logoUrl: event.target.value })
              }
              className="rounded-lg bg-slate-800 p-3"
            />
            <input
              required
              placeholder="Key decision maker"
              value={editing.contactName}
              onChange={(event) =>
                setEditing({ ...editing, contactName: event.target.value })
              }
              className="rounded-lg bg-slate-800 p-3"
            />
            <input
              placeholder="Job title"
              value={editing.jobTitle}
              onChange={(event) =>
                setEditing({ ...editing, jobTitle: event.target.value })
              }
              className="rounded-lg bg-slate-800 p-3"
            />
            <input
              type="email"
              placeholder="Email"
              value={editing.email}
              onChange={(event) =>
                setEditing({ ...editing, email: event.target.value })
              }
              className="rounded-lg bg-slate-800 p-3"
            />
            <input
              placeholder="Phone"
              value={editing.phone}
              onChange={(event) =>
                setEditing({ ...editing, phone: event.target.value })
              }
              className="rounded-lg bg-slate-800 p-3"
            />
            <input
              placeholder="LinkedIn URL"
              value={editing.linkedinUrl}
              onChange={(event) =>
                setEditing({ ...editing, linkedinUrl: event.target.value })
              }
              className="rounded-lg bg-slate-800 p-3"
            />
            <input
              placeholder="Website"
              value={editing.website}
              onChange={(event) =>
                setEditing({ ...editing, website: event.target.value })
              }
              className="rounded-lg bg-slate-800 p-3"
            />
            <label className="block text-sm text-slate-400 md:col-span-2">
              Climate-project spend (£) — used to rank Our Climate Sponsors
              <input
                type="number"
                min={0}
                step={100}
                value={editing.spentGbp || ""}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    spentGbp: Number(event.target.value) || 0,
                  })
                }
                className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
              />
            </label>
            <textarea
              placeholder="Notes"
              value={editing.notes}
              onChange={(event) =>
                setEditing({ ...editing, notes: event.target.value })
              }
              className="h-24 rounded-lg bg-slate-800 p-3 md:col-span-2"
            />
            <button
              type="submit"
              className="rounded-xl bg-green-500 py-3 font-bold text-slate-950 md:col-span-2"
            >
              Save to Our Climate Sponsors
            </button>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black">Ranked by climate-project spend</h2>
          <p className="mt-2 text-slate-400">
            Tick a brand to receive the next Match Day five. They only see it if they
            selected {clubName} at registration or accepted your network request, and
            have locked {clubName} for this Match Day.
          </p>
          <label className="mt-4 block text-sm text-slate-400">
            LinkedIn-style message
            <textarea
              value={inviteMessage}
              onChange={(event) => setInviteMessage(event.target.value)}
              placeholder={`Hi — please add ${clubName} to your Goal Sponsorship Network.`}
              className="mt-2 h-24 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
          </label>
          <div className="mt-6 space-y-4">
            {ranked.length === 0 && (
              <p className="text-slate-500">No sponsors yet. Add Diageo, Gillette, Budweiser or Puma above.</p>
            )}
            {ranked.map((sponsor, index) => {
              const network = loadGoalNetwork(sponsor.brandName, sponsor.email);
              const lock = loadMatchDayLock(sponsor.brandName);
              const inNetwork = Boolean(
                network?.clubNames.some((name) =>
                  name.toLowerCase().includes(clubName.toLowerCase()) ||
                  clubName.toLowerCase().includes(name.toLowerCase())
                )
              );
              const lockedHere =
                Boolean(lock) &&
                (lock?.clubName.toLowerCase().includes(clubName.toLowerCase()) ||
                  clubName.toLowerCase().includes(lock?.clubName.toLowerCase() ?? ""));
              const selected = roster.selectedIds.includes(sponsor.id);
              return (
                <div
                  key={sponsor.id}
                  className={`rounded-2xl border p-5 ${
                    selected ? "border-green-500 bg-slate-800" : "border-slate-700 bg-slate-900"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <BrandMark name={sponsor.brandName} logoUrl={sponsor.logoUrl} large />
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Rank {index + 1}
                      </p>
                      <h3 className="text-2xl font-bold">{sponsor.brandName}</h3>
                      <p className="mt-1 text-slate-300">
                        {sponsor.contactName} · {sponsor.jobTitle}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {sponsor.email || "No email"} · {sponsor.phone || "No phone"}
                      </p>
                      <p className="mt-2 text-sm text-green-300">
                        Climate spend {formatMoney(sponsor.spentGbp)}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {inNetwork
                          ? "On their Goal Sponsorship Network"
                          : "Not on their network yet — send a request"}
                        {lockedHere
                          ? " · Locked in for this Match Day"
                          : " · Not locked in for this Match Day"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 md:w-56">
                      <button
                        type="button"
                        onClick={() =>
                          refresh(setMatchDaySponsorTargets(clubId, clubName, sponsor.id))
                        }
                        className={`rounded-xl py-3 font-bold ${
                          selected
                            ? "bg-green-500 text-slate-950"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {selected ? "✓ Selected for next post" : "Select for next post"}
                      </button>
                      <button
                        type="button"
                        onClick={() => invite(sponsor)}
                        className="rounded-xl border border-blue-500/40 py-3 text-sm font-semibold text-blue-300"
                      >
                        Ask to join Goal Sponsorship Network
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(sponsor)}
                        className="rounded-xl border border-slate-600 py-2 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          refresh(deleteClubClimateSponsor(clubId, clubName, sponsor.id))
                        }
                        className="rounded-xl border border-red-500/30 py-2 text-sm text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
