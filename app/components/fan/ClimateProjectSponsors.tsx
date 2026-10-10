"use client";

import { useMemo, useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import { LEAD_CLIMATE_SPONSOR_LABEL } from "@/app/lib/dual-sponsor";
import { isLeadClimateBrand } from "@/app/lib/match-day-branding";
import { fanInviteRegisterPath } from "@/app/lib/climate-funding";
import { FAN_REGISTER_PATH } from "@/app/lib/routes";
import { featuredFromList, localFromList } from "@/app/lib/featured-gss";
import {
  DEFAULT_WALLET_VOTE_GBP,
  FUND_IT_LABEL,
  FUND_IT_MAX_TIMES,
  canPressFundIt,
  formatWalletGbp,
  fundItCopy,
  leadFundItCopy,
  localFundItCopy,
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
  split?: boolean;
};

const FUND_IT_COPY = fundItCopy();

export function ClimateProjectSponsors({
  lead,
  locals,
  projects = [],
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
  projects?: Array<{ number: number; name: string }>;
  projectCount?: number;
  onVote?: (input: WalletVoteInput) => void;
  onLeadVote?: (input: { projectNumber?: string; split?: boolean }) => void;
  onLocalVote?: (brandName: string, projectNumber: string, split?: boolean) => void;
  busy?: boolean;
  votingOpen?: boolean;
  usedSponsorNames?: string[];
  clubId?: string | null;
  clubName?: string | null;
  showInvite?: boolean;
}) {
  const [leadNumber, setLeadNumber] = useState("");
  const [localNumbers, setLocalNumbers] = useState<Record<string, string>>({});
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
    !lead ||
    !canPressFundIt({
      busy,
      fundingOpen: votingOpen,
      used: leadUsed,
      remainingGbp: lead.remainingGbp,
      projectNumber: leadNumber,
      projectCount,
    });
  const localRows = locals.filter(
    (row) => row.kind !== "lead" && !isLeadClimateBrand(row.brandName)
  );
  const remainingFunds = roundDisplay(
    (lead ? lead.remainingGbp : 0) +
      localRows.reduce((sum, row) => sum + row.remainingGbp, 0)
  );
  const inviteHref = fanInviteRegisterPath(clubId, clubName);
  const projectChoices =
    projects.length > 0
      ? projects
      : Array.from({ length: projectCount }, (_, index) => ({
          number: index + 1,
          name: `Climate Project ${index + 1}`,
        }));
  const leadChoices = featuredFromList(projectChoices);
  const localChoices = localFromList(projectChoices);

  function fundLead() {
    if (!lead) return;
    onVote?.({
      brandName: lead.brandName,
      projectNumber: leadNumber,
      split: false,
    });
    onLeadVote?.({ projectNumber: leadNumber, split: false });
    setLeadNumber("");
  }

  function fundLocal(row: CarbonWalletSponsor) {
    const projectNumber = localNumbers[row.brandName] ?? "";
    onVote?.({ brandName: row.brandName, projectNumber, split: false });
    onLocalVote?.(row.brandName, projectNumber, false);
    setLocalNumbers((prev) => ({ ...prev, [row.brandName]: "" }));
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
          {FUND_IT_COPY} By the end of Day 5 every Carbon Wallet should show{" "}
          {formatWalletGbp(0)}.
        </p>
      </div>

      {lead ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
          <p className="px-4 pt-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Lead Climate Project Sponsor
          </p>
          <p className="px-4 pt-2 text-center text-sm text-slate-400">
            {leadFundItCopy()}
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
            <FundProjectSelect
              brandName={lead.brandName}
              projects={leadChoices}
              numberValue={leadNumber}
              used={leadUsed}
              onNumber={setLeadNumber}
              testIdPrefix="lead"
              label="Global Schools Solar"
              emptyLabel="Select a Global Schools Solar version"
              ariaLabel={`Select a Global Schools Solar version to receive funding from ${lead.brandName}`}
            />
            <FundItButton
              disabled={leadBlocked}
              used={leadUsed}
              onClick={fundLead}
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
        <p className="mt-1 text-sm text-slate-400">{localFundItCopy()}</p>
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
            const already = used.has(normalizeKey(row.brandName));
            const logo =
              row.logoUrl ||
              loadBrandLogo(row.brandName) ||
              sponsorLogoSrc(row.brandName, row.logoUrl);
            const blocked = !canPressFundIt({
              busy,
              fundingOpen: votingOpen,
              used: already,
              remainingGbp: row.remainingGbp,
              projectNumber: value,
              projectCount,
            });
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
                <FundProjectSelect
                  brandName={row.brandName}
                  projects={localChoices}
                  numberValue={value}
                  used={already}
                  onNumber={(next) =>
                    setLocalNumbers((prev) => ({
                      ...prev,
                      [row.brandName]: next,
                    }))
                  }
                  testIdPrefix={`local-${row.brandName}`}
                />
                <FundItButton
                  disabled={blocked}
                  used={already}
                  onClick={() => fundLocal(row)}
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
            — they only need an account so they can {FUND_IT_LABEL} once from
            each remaining sponsor, up to {FUND_IT_MAX_TIMES} times.
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

function FundProjectSelect({
  brandName,
  projects,
  numberValue,
  used,
  onNumber,
  testIdPrefix,
  label = "Climate Project",
  emptyLabel = "Select a Climate Project",
  ariaLabel,
}: {
  brandName: string;
  projects: Array<{ number: number; name: string }>;
  numberValue: string;
  used: boolean;
  onNumber: (value: string) => void;
  testIdPrefix: string;
  label?: string;
  emptyLabel?: string;
  ariaLabel?: string;
}) {
  return (
    <label className="flex min-w-[14rem] flex-1 flex-col gap-1 text-sm text-slate-300">
      <span className="font-semibold">{label}</span>
      <select
        id={testIdPrefix === "lead" ? "lead-project-select" : undefined}
        value={numberValue}
        disabled={used}
        onChange={(event) => onNumber(event.target.value)}
        className="h-10 w-full rounded-md border-2 border-white/70 bg-slate-950 px-2 text-sm font-bold text-white disabled:opacity-40"
        data-testid={`${testIdPrefix}-project-select`}
        aria-label={
          ariaLabel ??
          `Select a Climate Project to receive ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} from ${brandName}`
        }
      >
        <option value="">{emptyLabel}</option>
        {projects.map((project) => (
          <option key={project.number} value={String(project.number)}>
            {project.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function FundItButton({
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
      {used ? "Already used" : FUND_IT_LABEL}
    </button>
  );
}

function roundDisplay(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}
