import { fanTeamMatchesPostedClub } from "./match-day-post";

export type FanClubRef = {
  id?: string | null;
  name?: string | null;
  displayName?: string | null;
};

export type InvitedClubRef = {
  clubId?: string | null;
  clubName?: string | null;
};

export type FanCampaignRef = {
  clubId?: string | null;
  postedClubId?: string | null;
  clubName?: string | null;
  matchTitle?: string | null;
  title?: string | null;
};

export function uniqueFanClubs<T extends FanClubRef>(teams: T[]): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const team of teams) {
    const key = `${team.id ?? ""}:${team.name ?? team.displayName ?? ""}`
      .trim()
      .toLowerCase();
    if (!key.replace(":", "") || seen.has(key)) continue;
    seen.add(key);
    unique.push(team);
  }
  return unique;
}

/**
 * My S4P is scoped to clubs this supporter actually follows.
 * Browser-wide invite leftovers (another club's demo or fan session)
 * must never be merged on top of those clubs.
 */
export function teamsForFanCampaigns<T extends FanClubRef>(
  supported: T[],
  _invited: InvitedClubRef[] = []
): T[] {
  return uniqueFanClubs(
    supported.filter((team) => team.id || team.name || team.displayName)
  );
}

export function campaignBelongsToFan(
  campaign: FanCampaignRef,
  teams: FanClubRef[]
): boolean {
  if (teams.length === 0) return false;
  const clubId = campaign.postedClubId || campaign.clubId || null;
  const clubName = campaign.clubName || null;
  return teams.some((team) =>
    fanTeamMatchesPostedClub(
      {
        id: String(team.id ?? ""),
        name: String(team.name ?? team.displayName ?? ""),
        displayName: String(team.displayName ?? team.name ?? ""),
      },
      {
        clubId,
        clubName,
      }
    )
  );
}

export function filterCampaignsForFan<T extends FanCampaignRef>(
  campaigns: T[],
  teams: FanClubRef[]
): T[] {
  return campaigns.filter((campaign) => campaignBelongsToFan(campaign, teams));
}
