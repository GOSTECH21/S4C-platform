"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import { InviteFriendsRemainingFunds } from "@/app/components/fan/InviteFriendsRemainingFunds";
import { isLeadClimateBrand } from "@/app/lib/match-day-branding";
import { localFromList } from "@/app/lib/featured-gss";
import {
  DEFAULT_WALLET_VOTE_GBP,
  FUND_IT_LABEL,
  canPressFundIt,
  formatWalletGbp,
  leadFundItCopy,
  localFundItCopy,
  normalizeBrandKey,
  normalizeKey,
  type SponsorWalletKind,
} from "@/app/lib/sponsor-wallet";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export const LOCAL_SPONSOR_FUND_SLOTS = 4;

export type CarbonWalletSponsor = {
  brandName: string;
  kind: SponsorWalletKind;
  remainingGbp: number;
  committedGbp?: number;
  logoUrl?: string | null;
  sponsoredProjectId?: string | null;
  sponsoredProjectName?: string | null;
};

export type WalletVoteInput = {
  brandName: string;
  projectNumber?: string;
  split?: boolean;
};

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
  voteError = null,
  voteNotice = null,
}: {
  lead: CarbonWalletSponsor | null;
  locals: CarbonWalletSponsor[];
  projects?: Array<{ id?: string; number: number; name: string }>;
  projectCount?: number;
  onVote?: (input: WalletVoteInput) => void | boolean | Promise<boolean | void>;
  onLeadVote?: (input: { projectNumber?: string; split?: boolean }) => void;
  onLocalVote?: (brandName: string, projectNumber: string, split?: boolean) => void;
  busy?: boolean;
  votingOpen?: boolean;
  usedSponsorNames?: string[];
  clubId?: string | null;
  clubName?: string | null;
  showInvite?: boolean;
  voteError?: string | null;
  voteNotice?: string | null;
}) {
  const [leadNumber, setLeadNumber] = useState("");
  const [localNumbers, setLocalNumbers] = useState<Record<string, string>>({});
  const used = useMemo(() => {
    const keys = new Set<string>();
    for (const name of usedSponsorNames) {
      keys.add(normalizeKey(name));
      keys.add(normalizeBrandKey(name));
    }
    return keys;
  }, [usedSponsorNames]);
  const leadLogo = lead
    ? lead.logoUrl || loadBrandLogo(lead.brandName) || sponsorLogoSrc(lead.brandName, lead.logoUrl)
    : null;
  const leadUsed = Boolean(
    lead &&
      walletTakeUsed(lead) &&
      (used.has(normalizeKey(lead.brandName)) ||
        used.has(normalizeBrandKey(lead.brandName)))
  );
  const projectChoices = projects;
  const localChoices = localFromList(projectChoices);
  const listedCount = Math.max(projectChoices.length, projectCount, 1);
  const leadBlocked =
    !lead ||
    !canPressFundIt({
      busy,
      fundingOpen: votingOpen,
      used: leadUsed,
      remainingGbp: lead.remainingGbp,
      projectNumber: leadNumber,
      projectCount: listedCount,
    });
  const localRows = locals.filter(
    (row) => row.kind !== "lead" && !isLeadClimateBrand(row.brandName)
  );
  const localSlots: Array<CarbonWalletSponsor | null> = Array.from(
    { length: LOCAL_SPONSOR_FUND_SLOTS },
    (_, index) => localRows[index] ?? null
  );
  const remainingFunds = roundDisplay(
    (lead ? lead.remainingGbp : 0) +
      localRows.reduce((sum, row) => sum + row.remainingGbp, 0)
  );

  function fundLead() {
    if (!lead || !leadNumber) return;
    onLeadVote?.({ projectNumber: leadNumber, split: false });
    void Promise.resolve(
      onVote?.({
        brandName: lead.brandName,
        projectNumber: leadNumber,
        split: false,
      })
    ).then((ok) => {
      if (ok === false) return;
      setLeadNumber("");
    });
  }

  useEffect(() => {
    if (voteNotice) setLeadNumber("");
  }, [voteNotice]);

  useEffect(() => {
    setLocalNumbers((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const row of locals) {
        const chosenId = String(row.sponsoredProjectId ?? "").trim();
        if (!chosenId) continue;
        const match = projects.find(
          (project) =>
            project.id === chosenId || project.name === row.sponsoredProjectName
        );
        if (match && next[row.brandName] !== String(match.number)) {
          next[row.brandName] = String(match.number);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [locals, projects]);

  function fundLocal(row: CarbonWalletSponsor) {
    const projectNumber = localNumbers[row.brandName] ?? "";
    onVote?.({ brandName: row.brandName, projectNumber, split: false });
    onLocalVote?.(row.brandName, projectNumber, false);
    setLocalNumbers((prev) => ({ ...prev, [row.brandName]: "" }));
  }


  return (
    <section className="space-y-8" data-my-s4p-fund-strips="fund-strips-v1">
      <div>
        <p className="max-w-3xl text-sm text-slate-300">{leadFundItCopy()}</p>
        {lead ? (
          <div
            id="lead-fund-it"
            data-lead-fund-it="lead-fund-it-v1"
            data-fund-it-native="lead-fund-it-take-v1"
            className="mt-4"
          >
            <SponsorFundStrip
              kind="lead"
              sponsor={lead}
              logoUrl={leadLogo}
              projects={projectChoices}
              numberValue={leadNumber}
              used={leadUsed}
              blocked={leadBlocked}
              onNumber={setLeadNumber}
              onFund={fundLead}
              testIdPrefix="lead"
              fundTestId="lead-vote"
              emptyLabel="Select a Climate Project"
              ariaLabel={`Select a Climate Project to receive funding from ${lead.brandName}`}
            />
            {voteError ? (
              <p
                data-fund-it-error="lead-fund-it-error"
                className="mt-3 rounded-xl border-2 border-red-700 bg-red-50 px-3 py-2 text-center text-sm font-bold text-red-800"
              >
                {voteError}
              </p>
            ) : null}
            {voteNotice && !voteError ? (
              <p
                data-fund-it-notice="lead-fund-it-notice"
                className="mt-3 rounded-xl border-2 border-green-700 bg-green-50 px-3 py-2 text-center text-sm font-bold text-green-900"
              >
                {voteNotice}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
            No Lead Climate Sponsor has posted a Carbon Wallet for this Match Day
            yet.
          </div>
        )}
      </div>

      <div>
        <p className="max-w-3xl text-sm text-slate-300">{localFundItCopy()}</p>
        <div className="mt-4 space-y-3">
          {localSlots.map((row, index) => {
            if (!row) {
              return (
                <SponsorFundStrip
                  key={`local-slot-${index + 1}`}
                  kind="local"
                  sponsor={null}
                  logoUrl={null}
                  projects={localChoices}
                  numberValue=""
                  used={false}
                  blocked
                  onNumber={() => {}}
                  onFund={() => {}}
                  testIdPrefix={`local-slot-${index + 1}`}
                  fundTestId={`local-slot-${index + 1}`}
                  emptyLabel="Select a Climate Project"
                />
              );
            }
            const value = localNumbers[row.brandName] ?? "";
            const already =
              walletTakeUsed(row) &&
              (used.has(normalizeKey(row.brandName)) ||
                used.has(normalizeBrandKey(row.brandName)));
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
              projectCount: listedCount,
            });
            return (
              <SponsorFundStrip
                key={row.brandName}
                kind="local"
                sponsor={row}
                logoUrl={logo}
                projects={localChoices}
                numberValue={value}
                used={already}
                blocked={blocked}
                onNumber={(next) =>
                  setLocalNumbers((prev) => ({
                    ...prev,
                    [row.brandName]: next,
                  }))
                }
                onFund={() => fundLocal(row)}
                testIdPrefix={`local-${row.brandName}`}
                fundTestId={`local-vote-${row.brandName}`}
                emptyLabel="Select a Climate Project"
              />
            );
          })}
        </div>
      </div>

      {showInvite && remainingFunds > 0 ? (
        <InviteFriendsRemainingFunds clubId={clubId} clubName={clubName} />
      ) : null}
    </section>
  );
}

function SponsorFundStrip({
  kind,
  sponsor,
  logoUrl,
  projects,
  numberValue,
  used,
  blocked,
  onNumber,
  onFund,
  testIdPrefix,
  fundTestId,
  emptyLabel,
  ariaLabel,
}: {
  kind: "lead" | "local";
  sponsor: CarbonWalletSponsor | null;
  logoUrl: string | null;
  projects: Array<{ number: number; name: string }>;
  numberValue: string;
  used: boolean;
  blocked: boolean;
  onNumber: (value: string) => void;
  onFund: () => void;
  testIdPrefix: string;
  fundTestId: string;
  emptyLabel: string;
  ariaLabel?: string;
}) {
  return (
    <div
      data-sponsor-fund-strip={kind}
      data-fund-strip-fit="phone-stack-v1"
      className="overflow-hidden rounded-2xl border border-slate-800 bg-white p-3 text-slate-950"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] items-end gap-2 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)_auto]">
        <LabeledCell label="Logo" className="w-[4.5rem] shrink-0">
          {sponsor ? (
            <BrandMark
              name={sponsor.brandName}
              logoUrl={logoUrl}
              className="h-14 w-14 text-sm"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg border-2 border-slate-800 bg-slate-800/80" />
          )}
        </LabeledCell>
        <LabeledCell label="Name">
          <div className="flex h-14 items-center rounded-lg border-2 border-slate-800 px-2 text-xs font-black leading-tight sm:text-sm">
            <span className="line-clamp-2 break-words">{sponsor?.brandName ?? ""}</span>
          </div>
        </LabeledCell>
        <LabeledCell label="Carbon Wallet">
          <div className="flex h-14 items-center justify-center rounded-lg border-2 border-slate-800 px-1 text-sm font-black text-emerald-800 sm:px-2 sm:text-lg">
            {sponsor ? formatWalletGbp(sponsor.remainingGbp) : ""}
          </div>
        </LabeledCell>
        <LabeledCell label="Climate Projects" className="col-span-2 md:col-span-1">
          <FundProjectSelect
            brandName={sponsor?.brandName ?? "sponsor"}
            projects={projects}
            numberValue={numberValue}
            used={used || !sponsor}
            onNumber={onNumber}
            testIdPrefix={testIdPrefix}
            emptyLabel={emptyLabel}
            ariaLabel={ariaLabel}
          />
        </LabeledCell>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-center text-[0.6rem] font-semibold uppercase leading-tight tracking-wide text-slate-500 sm:text-[0.65rem]">
            {FUND_IT_LABEL}
          </span>
          <FundItButton
            disabled={blocked || !sponsor}
            used={used}
            onClick={onFund}
            testId={fundTestId}
          />
        </div>
      </div>
    </div>
  );
}

function LabeledCell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`min-w-0 ${className ?? ""}`}>
      <p className="mb-1 px-0.5 text-center text-[0.6rem] font-semibold uppercase leading-tight tracking-wide text-slate-500 sm:text-[0.65rem]">
        {label}
      </p>
      {children}
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
  emptyLabel = "Select a Climate Project",
  ariaLabel,
}: {
  brandName: string;
  projects: Array<{ number: number; name: string }>;
  numberValue: string;
  used: boolean;
  onNumber: (value: string) => void;
  testIdPrefix: string;
  emptyLabel?: string;
  ariaLabel?: string;
}) {
  const selectId = testIdPrefix === "lead" ? "lead-project-select" : undefined;
  if (projects.length === 0) {
    return (
      <p className="flex h-14 items-center text-xs font-semibold text-amber-800">
        No Climate Projects are posted for this Match Day yet.
      </p>
    );
  }
  return (
    <div className="relative min-w-0 max-w-full overflow-hidden" data-testid={`${testIdPrefix}-project-select`}>
      <select
        id={selectId}
        disabled={used}
        value={numberValue}
        aria-label={
          ariaLabel ??
          `Select a Climate Project to receive ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} from ${brandName}`
        }
        onChange={(event) => onNumber(event.target.value)}
        className="h-14 w-full min-w-0 max-w-full appearance-none rounded-lg border-2 border-slate-800 bg-white px-2 pr-7 text-xs font-bold text-slate-950 disabled:opacity-40 sm:px-3 sm:pr-8 sm:text-sm"
      >
        <option value="">{emptyLabel}</option>
        {projects.map((project) => (
          <option key={project.number} value={String(project.number)}>
            {project.number}. {project.name}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-700"
      >
        ▼
      </span>
    </div>
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
  const lock = useRef(0);
  function take(event?: { preventDefault?: () => void }) {
    event?.preventDefault?.();
    if (disabled || used) return;
    const now = Date.now();
    if (now - lock.current < 700) return;
    lock.current = now;
    onClick();
  }
  const className = `flex h-14 w-full items-center justify-center rounded-lg px-3 text-center text-sm font-bold no-underline ${
    disabled || used
      ? "cursor-not-allowed border-2 border-slate-400 bg-transparent text-slate-500"
      : "bg-green-500 text-slate-950 hover:bg-green-400"
  }`;
  if (used) {
    return (
      <p className={className} data-testid={testId}>
        Already used
      </p>
    );
  }
  return (
    <a
      href="#lead-fund-it"
      data-testid={testId}
      data-fund-it-native="lead-fund-it-take-v1"
      role="button"
      aria-disabled={disabled}
      className={className}
      onClick={take}
      onPointerUp={take}
    >
      {FUND_IT_LABEL}
    </a>
  );
}

function walletTakeUsed(row: CarbonWalletSponsor): boolean {
  const remaining = Number(row.remainingGbp) || 0;
  const committed = Number(row.committedGbp);
  if (!(committed > 0)) return true;
  return remaining + DEFAULT_WALLET_VOTE_GBP <= committed + 0.001;
}

function roundDisplay(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}
