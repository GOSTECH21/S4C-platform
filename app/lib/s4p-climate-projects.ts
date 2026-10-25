/** Shared S4P Climate Projects list labels for clubs and sponsors. */

export const S4P_CLIMATE_PROJECTS_LABEL = "S4P Climate Projects";

export const CLIMATE_PROJECTS_NEAR_STADIUM_LABEL =
  "Climate Projects near my Stadium";

export function climateProjectListLabel(
  list: 1 | 2 | 3,
  localCountry: string
): string {
  if (list === 1) return `List 1 · ${localCountry}`;
  if (list === 2) return "List 2 · International";
  return CLIMATE_PROJECTS_NEAR_STADIUM_LABEL;
}

export function ordinalDay(day: number): string {
  const remainder = day % 100;
  if (remainder >= 11 && remainder <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

export function formatLongMatchDate(
  value: string | Date | null | undefined
): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  const year = date.getUTCFullYear();
  return `${ordinalDay(day)} ${month} ${year}`;
}

export function sponsorOfferHeadline({
  clubName,
  matchTitle,
  matchDate,
  scoreLabel = "Goal",
}: {
  clubName: string;
  matchTitle?: string | null;
  matchDate?: string | Date | null;
  scoreLabel?: string;
}): string {
  const fixture = (matchTitle ?? `${clubName} Match`)
    .replace(/\s+climate campaign$/i, "")
    .trim();
  const when = formatLongMatchDate(matchDate);
  const during = /v |vs\.?/i.test(fixture) ? fixture : `${fixture} Match`;
  const dateBit = when ? ` on ${when}` : "";
  return `5 Climate Projects Sponsorship for ${scoreLabel}s scored by ${clubName} players during ${during}${dateBit}`;
}
