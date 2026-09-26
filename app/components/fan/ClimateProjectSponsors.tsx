"use client";

import { useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import { LEAD_CLIMATE_SPONSOR_LABEL } from "@/app/lib/dual-sponsor";
import { isLeadClimateBrand } from "@/app/lib/match-day-branding";
import {
  DEFAULT_WALLET_VOTE_GBP,
  LEAD_WALLET_VOTE_GBP,
  formatWalletGbp,
  type SponsorWalletKind,
} from "@/app/lib/sponsor-wallet";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export type CarbonWalletSponsor = {
  brandName: string;
  kind: SponsorWalletKind;
  remainingGbp: number;
  logoUrl?: string | null;
};

export function ClimateProjectSponsors({
  lead,
  locals,
  projectCount = 5,
  onLeadVote,
  onLocalVote,
  busy = false,
  votingOpen = true,
}: {
  lead: CarbonWalletSponsor | null;
  locals: CarbonWalletSponsor[];
  projectCount?: number;
  onLeadVote: (input: { projectNumber?: string; split: boolean }) => void;
  onLocalVote: (brandName: string, projectNumber: string) => void;
  busy?: boolean;
  votingOpen?: boolean;
}) {
  const [leadNumber, setLeadNumber] = useState("");
  const [leadSplit, setLeadSplit] = useState(false);
  const [localNumbers, setLocalNumbers] = useState<Record<string, string>>({});
  const leadLogo = lead
    ? lead.logoUrl || loadBrandLogo(lead.brandName) || sponsorLogoSrc(lead.brandName, lead.logoUrl)
    : null;
  const leadBlocked =
    busy ||
    !votingOpen ||
    !lead ||
    lead.remainingGbp < LEAD_WALLET_VOTE_GBP ||
    (!leadSplit && !leadNumber);
  const share = formatWalletGbp(LEAD_WALLET_VOTE_GBP / Math.max(1, projectCount));
  const localRows = locals.filter(
    (row) => row.kind !== "lead" && !isLeadClimateBrand(row.brandName)
  );

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-black">Climate Project Sponsor</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Look at the Carbon Wallet next to each sponsor. Insert a project
          number, or tick Checkbox 2 on the Lead Climate Sponsor, then press
          Vote. By the end of Day 5 every Carbon Wallet should show{" "}
          {formatWalletGbp(0)}.
        </p>
      </div>

      {lead ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
          <p className="px-4 pt-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Lead Climate Project Sponsor
          </p>
          <div className="mt-3 flex flex-col gap-4 p-4 xl:flex-row xl:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3">
              <BrandMark name={lead.brandName} logoUrl={leadLogo} large />
              <div className="min-w-0">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {LEAD_CLIMATE_SPONSOR_LABEL}
                </p>
                <p className="truncate text-lg font-black text-slate-950">
                  {lead.brandName}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-400/40 bg-slate-900 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Carbon Wallet
              </p>
              <p className="mt-1 text-3xl font-black text-green-400">
                {formatWalletGbp(lead.remainingGbp)}
              </p>
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <span className="font-semibold">Checkbox 1</span>
              <input
                id="lead-project-number"
                type="number"
                min={1}
                max={projectCount}
                value={leadNumber}
                onChange={(event) => {
                  setLeadNumber(event.target.value);
                  setLeadSplit(false);
                }}
                className="h-10 w-16 rounded-md border-2 border-white/70 bg-slate-950 text-center text-lg font-black text-white"
                aria-label={`Insert a project number next to ${lead.brandName}'s Carbon Wallet`}
              />
              <span className="text-slate-500">
                {formatWalletGbp(LEAD_WALLET_VOTE_GBP)} to that project
              </span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <span className="font-semibold">Checkbox 2</span>
              <input
                type="checkbox"
                checked={leadSplit}
                onChange={(event) => {
                  setLeadSplit(event.target.checked);
                  if (event.target.checked) setLeadNumber("");
                }}
                className="h-8 w-8 accent-green-500"
                aria-label={`Share ${formatWalletGbp(LEAD_WALLET_VOTE_GBP)} across all Climate Projects`}
              />
              <span className="text-slate-500">
                Share {formatWalletGbp(LEAD_WALLET_VOTE_GBP)} ({share} each)
              </span>
            </label>
            <button
              type="button"
              disabled={leadBlocked}
              onClick={() =>
                onLeadVote({
                  projectNumber: leadNumber,
                  split: leadSplit,
                })
              }
              className={`rounded-xl px-6 py-3 text-sm font-bold ${
                leadBlocked
                  ? "cursor-not-allowed bg-slate-800 text-slate-500"
                  : "bg-green-500 text-slate-950 hover:bg-green-400"
              }`}
            >
              Vote
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
          No Lead Climate Sponsor has posted a Carbon Wallet for this Match Day
          yet.
        </div>
      )}

      <div>
        <h3 className="text-2xl font-black">Local Business Climate Sponsors</h3>
        <p className="mt-1 text-sm text-slate-400">
          Insert a project number next to a Carbon Wallet and press Vote. Each
          vote takes {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} from that wallet.
        </p>
      </div>

      {localRows.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
          No Local Business Climate Sponsors have a Carbon Wallet for this Match
          Day yet.
        </div>
      ) : (
        <div className="space-y-3">
          {localRows.map((row) => {
            const value = localNumbers[row.brandName] ?? "";
            const logo =
              row.logoUrl ||
              loadBrandLogo(row.brandName) ||
              sponsorLogoSrc(row.brandName, row.logoUrl);
            const blocked =
              busy ||
              !votingOpen ||
              row.remainingGbp < DEFAULT_WALLET_VOTE_GBP ||
              !value;
            return (
              <div
                key={row.brandName}
                className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 md:flex-row md:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <BrandMark name={row.brandName} logoUrl={logo} />
                  <div className="min-w-0">
                    <p className="truncate font-black text-white">{row.brandName}</p>
                    <p className="text-xs text-slate-500">
                      Local Business Climate Sponsor
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-400/30 bg-slate-900 px-4 py-3 text-center">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Carbon Wallet
                  </p>
                  <p className="text-2xl font-black text-green-400">
                    {formatWalletGbp(row.remainingGbp)}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-400">
                  Project
                  <input
                    type="number"
                    min={1}
                    max={projectCount}
                    value={value}
                    onChange={(event) =>
                      setLocalNumbers((prev) => ({
                        ...prev,
                        [row.brandName]: event.target.value,
                      }))
                    }
                    className="w-16 rounded-lg border border-slate-700 bg-slate-900 p-2 text-center font-black text-white"
                    aria-label={`Insert a project number next to ${row.brandName}'s Carbon Wallet`}
                  />
                </label>
                <button
                  type="button"
                  disabled={blocked}
                  onClick={() => onLocalVote(row.brandName, value)}
                  className={`rounded-xl px-5 py-3 text-sm font-bold ${
                    blocked
                      ? "cursor-not-allowed bg-slate-800 text-slate-500"
                      : "bg-green-500 text-slate-950 hover:bg-green-400"
                  }`}
                >
                  Vote
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
