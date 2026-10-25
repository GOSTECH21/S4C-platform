import {
  clubInitials,
  clubLogoSearchQuery,
} from "@/app/lib/club-logos";
import { namesMatch } from "@/app/lib/upcoming-matches";

const FETCH_HEADERS = {
  "User-Agent":
    "S4PClubLogos/1.0 (https://github.com/GOSTECH21/S4C-platform)",
  Accept: "application/json,image/*",
};

const IMAGE_CACHE = "public, s-maxage=86400, max-age=3600";

type SportsDbTeam = {
  strTeam?: string;
  strSport?: string;
  strBadge?: string | null;
  strLogo?: string | null;
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function pickBadge(team: SportsDbTeam | undefined): string | null {
  const badge = team?.strBadge?.trim() || team?.strLogo?.trim();
  return badge || null;
}

async function lookupTheSportsDb(name: string): Promise<string | null> {
  const query = clubLogoSearchQuery(name);
  if (!query) return null;
  const payload = await fetchJson<{ teams?: SportsDbTeam[] | null }>(
    `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(query)}`
  );
  const teams = payload?.teams ?? [];
  if (teams.length === 0) return null;

  const rugbyWanted = /rugby/i.test(name) || /rugby/i.test(query);
  const sportOk = (team: SportsDbTeam) => {
    const sport = (team.strSport ?? "").toLowerCase();
    if (rugbyWanted) return sport.includes("rugby");
    return (
      sport.includes("soccer") ||
      sport.includes("football") ||
      sport === ""
    );
  };
  const pool = teams.filter(sportOk);
  const ranked = (pool.length > 0 ? pool : teams).filter((team) =>
    team.strTeam ? namesMatch(team.strTeam, query) : false
  );
  return pickBadge(ranked[0] ?? pool[0] ?? teams[0]);
}

async function lookupWikipedia(name: string): Promise<string | null> {
  const query = clubLogoSearchQuery(name);
  if (!query) return null;
  const rugbyWanted = /rugby/i.test(name) || /rugby/i.test(query);
  const searchTerm = rugbyWanted
    ? `${query} rugby`
    : `${query} football club`;
  const searched = await fetchJson<{
    query?: { search?: { title: string }[] };
  }>(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&srlimit=5`
  );
  const hits = searched?.query?.search ?? [];
  const title =
    hits.find((row) =>
      /F\.C\.|A\.F\.C\.|football club|rugby/i.test(row.title)
    )?.title ?? hits[0]?.title;
  if (!title) return null;
  const summary = await fetchJson<{ thumbnail?: { source?: string } }>(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  );
  return summary?.thumbnail?.source ?? null;
}

function svgInitials(name: string): Response {
  const initials = clubInitials(name || "FC");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#5bc662"/><text x="32" y="39" text-anchor="middle" font-size="20" font-weight="800" font-family="Arial,sans-serif" fill="#111">${initials}</text></svg>`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": IMAGE_CACHE,
    },
  });
}

async function proxyImage(url: string): Promise<Response | null> {
  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok || !response.body) return null;
    const contentType = response.headers.get("content-type") ?? "image/png";
    if (!contentType.startsWith("image/")) return null;
    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": IMAGE_CACHE,
      },
    });
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name")?.trim() ?? "";
  if (!name) return svgInitials("FC");

  const badge =
    (await lookupTheSportsDb(name)) ?? (await lookupWikipedia(name));
  if (badge) {
    const image = await proxyImage(badge);
    if (image) return image;
  }
  return svgInitials(name);
}
