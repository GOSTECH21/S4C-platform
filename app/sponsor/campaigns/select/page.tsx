"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ClimateProject } from "@/app/services/votes.service";
import {
  loadFeaturedMatchDayProject,
  loadPartnerClimateProjects,
} from "@/app/services/club-match-day.service";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  proposalMailtoToDirector,
  sendSponsorProposalToClub,
} from "@/app/services/sponsor-offers.service";
import { CURRENT_SEASON_LEAGUES } from "@/app/lib/current-season";
import {
  MATCH_DAY_CHOICE_COUNT,
  MATCH_DAY_PROJECT_COUNT,
  partnerProjectPage,
} from "@/app/lib/partner-projects";
import { localCatalogCountryForClub } from "@/app/lib/featured-climate-country";
import { supabase } from "@/app/lib/supabase";
import {
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
} from "@/app/lib/routes";

export default function SponsorCreateCampaignPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("Sponsor");
  const [email, setEmail] = useState<string | null>(null);
  const [clubName, setClubName] = useState("Arsenal");
  const [clubId, setClubId] = useState<string | null>(null);
  const [clubEmail, setClubEmail] = useState<string | null>(null);
  const [projects, setProjects] = useState<ClimateProject[]>([]);
  const [featured, setFeatured] = useState<ClimateProject | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [list, setList] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMailto, setSentMailto] = useState<string | null>(null);

  const clubs = Object.values(CURRENT_SEASON_LEAGUES).flat();
  const localCountry = localCatalogCountryForClub({ clubName });
  const visible = useMemo(
    () => partnerProjectPage(projects, list === 1 ? 0 : 1),
    [projects, list]
  );

  useEffect(() => {
    async function load() {
      try {
        const sponsor = await getCurrentSponsor();
        setBrand(String(sponsor.name ?? "Sponsor"));
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setEmail(user?.email ?? null);
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
        return;
      }
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    async function loadCatalog() {
      const catalog = await loadPartnerClimateProjects({ clubName });
      setProjects(catalog);
      setFeatured(await loadFeaturedMatchDayProject());
      const { data: club } = await supabase
        .from("clubs")
        .select("id, name")
        .ilike("name", `%${clubName}%`)
        .limit(1)
        .maybeSingle();
      setClubId(club?.id ?? null);
      if (club?.id) {
        const { data: account } = await supabase
          .from("club_accounts")
          .select("email")
          .eq("club_id", club.id)
          .limit(1)
          .maybeSingle();
        setClubEmail((account?.email as string | null) ?? null);
      }
    }
    if (!loading) void loadCatalog();
  }, [clubName, loading]);

  function toggle(projectId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else if (next.size < MATCH_DAY_CHOICE_COUNT) next.add(projectId);
      return next;
    });
  }

  async function send() {
    if (selected.size !== MATCH_DAY_CHOICE_COUNT) {
      setError(`Select exactly ${MATCH_DAY_CHOICE_COUNT} Climate Partner projects.`);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const chosen = projects.filter((project) => selected.has(project.id));
      const five = featured ? [featured, ...chosen] : chosen;
      const proposal = await sendSponsorProposalToClub({
        clubId: clubId ?? `name:${clubName}`,
        clubName,
        sponsorName: brand,
        sponsorEmail: email,
        projects: five,
      });
      const mailto = proposalMailtoToDirector(clubEmail, proposal);
      setSentMailto(mailto);
      if (mailto.startsWith("mailto:") && clubEmail) {
        window.open(mailto, "_blank");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send this list to the club."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading S4P Climate Projects...</p>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link href={SPONSOR_DASHBOARD_PATH} className="text-sm font-semibold text-green-400">
        ← Back to dashboard
      </Link>
      <h1 className="mt-6 text-4xl font-black">Create Your Sponsorship Campaign</h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        Do the same thing the Sustainability Director does: Global Schools Solar
        is included, then choose 4 from List 1 ({localCountry}) and List 2
        (International). Send the 5 to the Sustainability Director so they can
        push them to fans.
      </p>

      <label className="mt-8 block max-w-xl text-sm text-slate-400">
        Club
        <select
          value={clubName}
          onChange={(event) => {
            setClubName(event.target.value);
            setSelected(new Set());
            setSentMailto(null);
          }}
          className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
        >
          {clubs.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      {featured && (
        <div className="mt-8 rounded-2xl border border-green-500/40 bg-green-500/10 p-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-green-400">
            Included · UK and International
          </p>
          <h2 className="mt-2 text-2xl font-bold">{featured.name}</h2>
          <p className="mt-2 text-slate-300">{featured.description}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold">
          {selected.size} of {MATCH_DAY_CHOICE_COUNT} partner projects selected
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setList(1)}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              list === 1 ? "bg-green-500 text-slate-950" : "border border-slate-700"
            }`}
          >
            List 1 · {localCountry}
          </button>
          <button
            type="button"
            onClick={() => setList(2)}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              list === 2 ? "bg-green-500 text-slate-950" : "border border-slate-700"
            }`}
          >
            List 2 · International
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {visible.map((project) => {
          if (featured && project.id === featured.id) return null;
          const isOn = selected.has(project.id);
          const full = !isOn && selected.size >= MATCH_DAY_CHOICE_COUNT;
          return (
            <div
              key={project.id}
              className={`rounded-2xl border p-6 ${
                isOn ? "border-green-500 bg-slate-800" : "border-slate-700 bg-slate-900"
              }`}
            >
              <h2 className="text-xl font-bold">{project.name}</h2>
              <p className="mt-2 text-sm text-slate-400">📍 {project.country}</p>
              <p className="mt-3 text-slate-300">{project.description}</p>
              <button
                type="button"
                disabled={full}
                onClick={() => toggle(project.id)}
                className={`mt-6 w-full rounded-xl py-3 font-bold ${
                  isOn
                    ? "bg-green-500 text-slate-950"
                    : "bg-slate-700 text-white"
                }`}
              >
                {isOn ? "✓ Selected" : "Select project"}
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => void send()}
        disabled={sending || selected.size !== MATCH_DAY_CHOICE_COUNT}
        className="mt-10 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold disabled:opacity-70"
      >
        {sending
          ? "Sending to the Sustainability Director..."
          : `Send these ${MATCH_DAY_PROJECT_COUNT} Climate Projects to the Sustainability Director`}
      </button>
      {sentMailto && (
        <p className="mt-4 text-center text-sm text-green-300">
          These 5 Climate Projects are now on the {clubName} Sustainability
          Director dashboard as Sponsorship Selected Projects.
        </p>
      )}
    </div>
  );
}
