"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutSponsor } from "@/app/services/sponsor-auth.service";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  loadSponsorFolder,
  type SignedSponsorship,
  type SponsorDashboardStats,
  type SponsorMatchOffer,
} from "@/app/services/sponsor-offers.service";
import {
  SPONSOR_CREATE_CAMPAIGN_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_OFFERS_PATH,
} from "@/app/lib/routes";
import { formatLongMatchDate } from "@/app/lib/s4p-climate-projects";
import { formatMoney, formatVoteCount } from "@/app/lib/sponsorship-auction";

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
  const [stats, setStats] = useState<SponsorDashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const sponsor = await getCurrentSponsor();
        setBrand(String(sponsor.name ?? "your brand"));
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
        return;
      }
      try {
        const folder = await loadSponsorFolder();
        setPending(folder.pending);
        setSigned(folder.signed);
        setStats(folder.stats);
      } catch (err) {
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

  if (loading) {
    return <p className="text-slate-400">Loading sponsor dashboard...</p>;
  }

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
            Signed in as {brand}
          </p>
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
            Open New Sponsorship/Score Offer immediately. If the Sustainability
            Director has posted their 5, sign them off here.
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
