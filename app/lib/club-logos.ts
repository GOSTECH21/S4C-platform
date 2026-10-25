import { normalizeClubName } from "@/app/lib/upcoming-matches";

const SEARCH_ALIASES: Record<string, string> = {
  hearts: "Heart of Midlothian",
  "heart of midlothian": "Heart of Midlothian",
  "hearts of midlothian": "Heart of Midlothian",
  spurs: "Tottenham Hotspur",
  tottenham: "Tottenham Hotspur",
  wolves: "Wolverhampton Wanderers",
  brighton: "Brighton",
  "brighton hove albion": "Brighton",
  "nottingham forest": "Nottingham Forest",
  "nottm forest": "Nottingham Forest",
  forest: "Nottingham Forest",
  bournemouth: "Bournemouth",
  "afc bournemouth": "Bournemouth",
  "man utd": "Manchester United",
  "man united": "Manchester United",
  "man city": "Manchester City",
  "west ham": "West Ham United",
  newcastle: "Newcastle United",
  leeds: "Leeds United",
  "qpr": "Queens Park Rangers",
  "mk dons": "Milton Keynes Dons",
  psg: "Paris Saint Germain",
  inter: "Inter Milan",
  atletico: "Atletico Madrid",
  "sporting": "Sporting Lisbon",
  scotland: "Scotland Rugby",
  "scotland rugby": "Scotland Rugby",
};

export function clubLogoSearchQuery(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const key = normalizeClubName(trimmed);
  return SEARCH_ALIASES[key] ?? trimmed.replace(/\s+FC$/i, "").trim();
}

export function clubLogoSrc(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return `/api/home/club-logo?name=${encodeURIComponent(trimmed)}`;
}

export function clubInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function clubShortName(name: string): string {
  return name
    .replace(/\s+(Football Club|A\.?F\.?C\.?|F\.?C\.?)$/i, "")
    .trim();
}
