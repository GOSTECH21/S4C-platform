/** Match date and venue shown under the My S4P Climate Campaign headline. */

import { sameNamedFixture, type ClubFixture } from "./club-fixtures";
import { stadiumSiteForClub } from "./project-site";

export const FAN_MATCH_META_STAMP = "fan-match-meta-v1";

export function formatFanMatchWhen(
  value: string | Date | null | undefined
): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const date = new Date(`${value.trim()}T12:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return formatLondonDate(date);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const datePart = formatLondonDate(date);
  const timePart = date
    .toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Europe/London",
    })
    .replace(/\u202f/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (!timePart || timePart === "12:00 am") {
    const iso = date.toISOString();
    if (iso.endsWith("T00:00:00.000Z")) return datePart;
  }
  return `${datePart} · ${timePart}`;
}

export function formatFanMatchVenue(
  venue: string | null | undefined
): string | null {
  const value = String(venue ?? "").trim();
  if (!value) return null;
  return value.split(",")[0]?.trim() || value;
}

export function stadiumVenueLabel(
  clubName: string | null | undefined
): string | null {
  const site = stadiumSiteForClub(clubName);
  if (!site) return null;
  return formatFanMatchVenue(site.address) ?? formatFanMatchVenue(site.name);
}

export function venueForNamedFixture(
  fixtureName: string | null | undefined,
  fixtures: Array<Pick<ClubFixture, "fixtureName" | "venue">>
): string | null {
  const title = String(fixtureName ?? "").trim();
  if (!title) return null;
  const hit = fixtures.find((row) => sameNamedFixture(row.fixtureName, title));
  return formatFanMatchVenue(hit?.venue ?? null);
}

export function resolveFanMatchVenue(options: {
  clubName?: string | null;
  fixtureName?: string | null;
  venue?: string | null;
  fixtures?: Array<Pick<ClubFixture, "fixtureName" | "venue">>;
}): string | null {
  return (
    formatFanMatchVenue(options.venue) ??
    venueForNamedFixture(options.fixtureName, options.fixtures ?? []) ??
    stadiumVenueLabel(options.clubName)
  );
}

export function fanMatchMetaLine(options: {
  kickoffAt?: string | Date | null;
  venue?: string | null;
  clubName?: string | null;
}): string | null {
  const when = formatFanMatchWhen(options.kickoffAt);
  const ground =
    formatFanMatchVenue(options.venue) ?? stadiumVenueLabel(options.clubName);
  const parts = [when, ground].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function formatLondonDate(date: Date): string {
  const weekday = date.toLocaleDateString("en-GB", {
    weekday: "short",
    timeZone: "Europe/London",
  });
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    timeZone: "Europe/London",
  });
  const month = date.toLocaleDateString("en-GB", {
    month: "short",
    timeZone: "Europe/London",
  });
  const year = date.toLocaleDateString("en-GB", {
    year: "numeric",
    timeZone: "Europe/London",
  });
  return `${weekday}, ${day} ${month} ${year}`;
}
