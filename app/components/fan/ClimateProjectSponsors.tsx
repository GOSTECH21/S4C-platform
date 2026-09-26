"use client";

import { useMemo, useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import { LEAD_CLIMATE_SPONSOR_LABEL } from "@/app/lib/dual-sponsor";
import { isLeadClimateBrand } from "@/app/lib/match-day-branding";
import { fanInviteRegisterPath } from "@/app/lib/climate-funding";
import { FAN_REGISTER_PATH } from "@/app/lib/routes";
import {
  DEFAULT_WALLET_VOTE_GBP,
  LEAD_WALLET_VOTE_GBP,
  formatWalletGbp,
  normalizeKey,
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

export type WalletVoteInput = {
  brandName: string;
  projectNumber?: string;
  split: boolean;
};

export function ClimateProjectSponsors({
  lead,
  locals,
  projectCount = 5,
  onVote,
  onLeadVote,
  onLocalVote,
  busy = false,
  votingOpen = true,
  usedSponsorNames = [],
  clubId,
  clubName,
  showInvite = true,
}: {
  lead: CarbonWalletSponsor | null;
  locals: CarbonWalletSponsor[];
  projectCount?: number;
  onVote?: (input: WalletVoteInput) => void;
  onLeadVote?: (input: { projectNumber?: string; split: boolean }) => void;
  onLocalVote?: (brandName: string, projectNumber: string, split?: boolean) => void;
  busy?: boolean;
  votingOpen?: boolean;
  usedSponsorNames?: string[];
  clubId?: string | null;
  clubName?: string | null;
  showInvite?: boolean;
}) {
  const [leadNumber, setLeadNumber] = useState("");
  const [leadSplit, setLeadSplit] = useState(false);
  const [localNumbers, setLocalNumbers] = useState<Record<string, string>>({});
  const [localSplits, setLocalSplits] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const used = useMemo(
    () => new Set(usedSponsorNames.map((name) => normalizeKey(name))),
    [usedSponsorNames]
  );
  const leadLogo = lead
    ? lead.logoUrl || loadBrandLogo(lead.brandName) || sponsorLogoSrc(lead.brandName, lead.logoUrl)
    : null;
  const leadUsed = Boolean(lead && used.has(normalizeKey(lead.brandName)));
  const leadBlocked =
    busy ||
    !votingOpen ||
    !lead ||
    leadUsed ||
    lead.remainingGbp < LEAD_WALLET_VOTE_GBP ||
    (!leadSplit && !leadNumber);
  const leadShare = formatWalletGbp(LEAD_WALLET_VOTE_GBP / Math.max(1, projectCount));
  const localShare = formatWalletGbp(
    DEFAULT_WALLET_VOTE_GBP / Math.max(1, projectCount)
  );
  const localRows = locals.filter(
    (row) => row.kind !== "lead" && !isLeadClimateBrand(row.brandName)
  );
  const remainingFunds = roundDisplay(
    (lead ? lead.remainingGbp : 0) +
      localRows.reduce((sum, row) => sum + row.remainingGbp, 0)
  );
  const inviteHref = fanInviteRegisterPath(clubId, clubName);

  function voteLead() {
    if (!lead) return;
    onVote?.({
      brandName: lead.brandName,
      projectNumber: leadNumber,
      split: leadSplit,
    });
    onLeadVote?.({ projectNumber: leadNumber, split: leadSplit });
    setLeadNumber("");
    setLeadSplit(false);
  }

  function voteLocal(row: CarbonWalletSponsor) {
    const split = Boolean(localSplits[row.brandName]);
    const projectNumber = localNumbers[row.brandName] ?? "";
    onVote?.({ brandName: row.brandName, projectNumber, split });
    onLocalVote?.(row.brandName, projectNumber, split);
    setLocalNumbers((prev) => ({ ...prev, [row.brandName]: "" }));
    setLocalSplits((prev) => ({ ...prev, [row.brandName]: false }));
  }

  async function copyInvite() {
    const url =
      typeof window === "undefined"
        ? inviteHref
        : new URL(inviteHref, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-black">Climate Project Sponsor</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          You can take money once from each sponsor during the 5-day Vote.
          Insert a project number in Checkbox 1, or tick Checkbox 2, then press
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
            <CarbonWalletBox amount={lead.remainingGbp} />
            <VoteCheckboxes
              brandName={lead.brandName}
              projectCount={projectCount}
              numberValue={leadNumber}
              splitValue={leadSplit}
              amountLabel={formatWalletGbp(LEAD_WALLET_VOTE_GBP)}
              shareLabel={leadShare}
              used={leadUsed}
              onNumber={(value) => {
                setLeadNumber(value);
                setLeadSplit(false);
              }}
              onSplit={(value) => {
                setLeadSplit(value);
                if (value) setLeadNumber("");
              }}
              testIdPrefix="lead"
            />
            <VoteButton
              disabled={leadBlocked}
              used={leadUsed}
              onClick={voteLead}
              testId="lead-vote"
            />
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
          Same two checkboxes as the Lead Climate Sponsor. Checkbox 1 sends{" "}
          {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} to one project. Checkbox 2
          shares {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} ({localShare} each).
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
            const split = Boolean(localSplits[row.brandName]);
            const already = used.has(normalizeKey(row.brandName));
            const logo =
              row.logoUrl ||
              loadBrandLogo(row.brandName) ||
              sponsorLogoSrc(row.brandName, row.logoUrl);
            const blocked =
              busy ||
              !votingOpen ||
              already ||
              row.remainingGbp < DEFAULT_WALLET_VOTE_GBP ||
              (!split && !value);
            return (
              <div
                key={row.brandName}
                className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 xl:flex-row xl:items-center"
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
                <CarbonWalletBox amount={row.remainingGbp} compact />
                <VoteCheckboxes
                  brandName={row.brandName}
                  projectCount={projectCount}
                  numberValue={value}
                  splitValue={split}
                  amountLabel={formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)}
                  shareLabel={localShare}
                  used={already}
                  onNumber={(next) =>
                    setLocalNumbers((prev) => ({
                      ...prev,
                      [row.brandName]: next,
                    }))
                  }
                  onSplit={(next) =>
                    setLocalSplits((prev) => ({
                      ...prev,
                      [row.brandName]: next,
                    }))
                  }
                  testIdPrefix={`local-${row.brandName}`}
                />
                <VoteButton
                  disabled={blocked}
                  used={already}
                  onClick={() => voteLocal(row)}
                  testId={`local-vote-${row.brandName}`}
                />
              </div>
            );
          })}
        </div>
      )}

      {showInvite && remainingFunds > 0 ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-6">
          <h3 className="text-xl font-black">Invite friends to use remaining funds</h3>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            If Carbon Wallets still show cash on Day 5, invite friends to
            register on S4P. They may or may not support {clubName || "this club"}
            — they only need an account so they can take money once from each
            remaining sponsor.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void copyInvite()}
              className="rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-green-400"
            >
              {copied ? "Invite link copied" : "Copy invite link"}
            </button>
            <a
              href={inviteHref || FAN_REGISTER_PATH}
              className="rounded-xl border border-green-500/40 px-5 py-3 text-sm font-bold text-green-300 hover:bg-green-500/10"
            >
              Open fan registration
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CarbonWalletBox({
  amount,
  compact = false,
}: {
  amount: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-emerald-400/40 bg-slate-900 text-center ${
        compact ? "px-4 py-3" : "px-5 py-4"
      }`}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-emerald-300">
        Carbon Wallet
      </p>
      <p className={`font-black text-green-400 ${compact ? "text-2xl" : "mt-1 text-3xl"}`}>
        {formatWalletGbp(amount)}
      </p>
    </div>
  );
}

function VoteCheckboxes({
  brandName,
  projectCount,
  numberValue,
  splitValue,
  amountLabel,
  shareLabel,
  used,
  onNumber,
  onSplit,
  testIdPrefix,
}: {
  brandName: string;
  projectCount: number;
  numberValue: string;
  splitValue: boolean;
  amountLabel: string;
  shareLabel: string;
  used: boolean;
  onNumber: (value: string) => void;
  onSplit: (value: boolean) => void;
  testIdPrefix: string;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm text-slate-300 xl:flex-row xl:items-center">
      <label className="flex items-center gap-2">
        <span className="font-semibold">Checkbox 1</span>
        <input
          id={testIdPrefix === "lead" ? "lead-project-number" : undefined}
          type="number"
          min={1}
          max={projectCount}
          value={numberValue}
          disabled={used}
          onChange={(event) => {
            onNumber(event.target.value);
            onSplit(false);
          }}
          className="h-10 w-16 rounded-md border-2 border-white/70 bg-slate-950 text-center text-lg font-black text-white disabled:opacity-40"
          data-testid={`${testIdPrefix}-project-number`}
          aria-label={`Insert a project number next to ${brandName}'s Carbon Wallet`}
        />
        <span className="text-slate-500">{amountLabel} to that project</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-semibold">Checkbox 2</span>
        <input
          type="checkbox"
          checked={splitValue}
          disabled={used}
          onChange={(event) => {
            onSplit(event.target.checked);
            if (event.target.checked) onNumber("");
          }}
          className="h-8 w-8 accent-green-500 disabled:opacity-40"
          data-testid={`${testIdPrefix}-split`}
          aria-label={`Share ${amountLabel} across all Climate Projects from ${brandName}`}
        />
        <span className="text-slate-500">
          Share {amountLabel} ({shareLabel} each)
        </span>
      </label>
    </div>
  );
}

function VoteButton({
  disabled,
  used,
  onClick,
  testId,
}: {
  disabled: boolean;
  used: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-6 py-3 text-sm font-bold ${
        disabled
          ? "cursor-not-allowed bg-slate-800 text-slate-500"
          : "bg-green-500 text-slate-950 hover:bg-green-400"
      }`}
    >
      {used ? "Already used" : "Vote"}
    </button>
  );
}

function roundDisplay(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}
