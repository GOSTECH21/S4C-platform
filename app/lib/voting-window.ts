/** Fan voting stays open for five days around kick-off, at the same clock time. */

export const VOTING_PERIOD_DAYS = 5;
export const VOTING_OPENS_DAYS_BEFORE_KICKOFF = 3;
export const VOTING_CLOSES_DAYS_AFTER_KICKOFF = 2;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type VotingPhase = "upcoming" | "open" | "closed";

export type VotingWindow = {
  opensAt: Date;
  closesAt: Date;
  kickoffAt: Date | null;
};

export function addDays(value: Date, days: number): Date {
  return new Date(value.getTime() + days * MS_PER_DAY);
}

export function parseFixtureKickoff(row: {
  kickoff_at?: string | null;
  fixture_date?: string | null;
  kickoff_time?: string | null;
}): Date | null {
  if (row.kickoff_at) {
    const fromStamp = new Date(row.kickoff_at);
    if (!Number.isNaN(fromStamp.getTime())) return fromStamp;
  }
  const date = (row.fixture_date ?? "").trim();
  if (!date) return null;
  const time = ((row.kickoff_time ?? "15:00").trim() || "15:00").slice(0, 5);
  const fromParts = new Date(`${date}T${time}:00`);
  if (!Number.isNaN(fromParts.getTime())) return fromParts;
  return null;
}

export function votingWindowForKickoff(kickoff: Date | string): VotingWindow {
  const kickoffAt = kickoff instanceof Date ? kickoff : new Date(kickoff);
  return {
    opensAt: addDays(kickoffAt, -VOTING_OPENS_DAYS_BEFORE_KICKOFF),
    closesAt: addDays(kickoffAt, VOTING_CLOSES_DAYS_AFTER_KICKOFF),
    kickoffAt,
  };
}

export function resolveVotingWindow(options: {
  kickoff?: Date | string | null;
  opensAt?: Date | string | null;
  closesAt?: Date | string | null;
  postedAt?: Date | string | null;
  now?: Date | string;
}): VotingWindow {
  const kickoff = asDate(options.kickoff);
  if (kickoff) return votingWindowForKickoff(kickoff);

  const opensAt = asDate(options.opensAt);
  const closesAt = asDate(options.closesAt);
  if (opensAt && closesAt) {
    const duration = closesAt.getTime() - opensAt.getTime();
    if (duration + 1_000 < VOTING_PERIOD_DAYS * MS_PER_DAY) {
      return {
        opensAt,
        closesAt: addDays(opensAt, VOTING_PERIOD_DAYS),
        kickoffAt: null,
      };
    }
    return { opensAt, closesAt, kickoffAt: null };
  }
  if (opensAt) {
    return {
      opensAt,
      closesAt: addDays(opensAt, VOTING_PERIOD_DAYS),
      kickoffAt: null,
    };
  }
  const start = asDate(options.postedAt) ?? asDate(options.now) ?? new Date();
  return {
    opensAt: start,
    closesAt: addDays(start, VOTING_PERIOD_DAYS),
    kickoffAt: null,
  };
}

export function votingPhase(
  window: VotingWindow,
  now: Date | string = new Date()
): VotingPhase {
  const current = asDate(now) ?? new Date();
  if (current.getTime() < window.opensAt.getTime()) return "upcoming";
  if (current.getTime() > window.closesAt.getTime()) return "closed";
  return "open";
}

export function isVotingOpen(
  window: VotingWindow,
  now: Date | string = new Date()
): boolean {
  return votingPhase(window, now) === "open";
}

export function fanVotingWindowCopy(): string {
  return `Voting is open for ${VOTING_PERIOD_DAYS} days. It opens ${VOTING_OPENS_DAYS_BEFORE_KICKOFF} days before kick-off and closes ${VOTING_CLOSES_DAYS_AFTER_KICKOFF} days after, at the same time. A Saturday 15:00 kick-off opens voting Wednesday at 15:00 and closes Monday at 15:00.`;
}

export function clubVotingWindowCopy(choiceCount: number): string {
  return `Select ${choiceCount} Climate Partner projects at least ${VOTING_OPENS_DAYS_BEFORE_KICKOFF} days before kick-off. ${fanVotingWindowCopy()} Global Schools Solar is included in every Match Day five. After you post, fans see the five on My S4P and Climate Projects immediately.`;
}

export function formatVotingClock(value: Date): string {
  return value.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function fanVotingWindowForMatchCopy(window: VotingWindow): string {
  return `Voting is open for ${VOTING_PERIOD_DAYS} days. It opens ${formatVotingClock(window.opensAt)} and closes ${formatVotingClock(window.closesAt)}.`;
}

function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
