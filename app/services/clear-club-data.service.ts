import { supabase } from "../lib/supabase";
import { seasonNamesMatch } from "../lib/current-season";
import { clearClubLocalProjectsAndSponsors } from "../lib/clear-club-data";
import { fanTeamMatchesPostedClub } from "../lib/match-day-post";

export type ClearedClubData = {
  clubIds: string[];
  clubNames: string[];
  portfolios: number;
  campaignProjects: number;
  matchCampaigns: number;
  clubProjects: number;
  sponsorshipCampaigns: number;
  walletsRemoved: number;
  sponsorsRemoved: number;
  remainingCampaigns: number;
};

async function arsenalClubRows(clubName: string) {
  const { data, error } = await supabase.from("clubs").select("id, name");
  if (error) throw error;
  return (data ?? []).filter((row) => seasonNamesMatch(String(row.name ?? ""), clubName));
}

async function deleteWhereClubId(table: string, clubIds: string[]) {
  if (clubIds.length === 0) return 0;
  const { data, error } = await supabase.from(table).delete().in("club_id", clubIds).select("id");
  if (error) return 0;
  return data?.length ?? 0;
}

async function loadClubCampaigns(clubIds: string[], clubName: string) {
  const byId = clubIds.length
    ? await supabase.from("match_campaigns").select("id, title, club_id, status").in("club_id", clubIds)
    : { data: [] as Array<{ id: string; title?: string | null; club_id?: string | null; status?: string | null }> };
  const open = await supabase
    .from("match_campaigns")
    .select("id, title, club_id, status")
    .eq("status", "open");
  const rows = [...(byId.data ?? []), ...(open.data ?? [])];
  const seen = new Set<string>();
  return rows.filter((row) => {
    const id = String(row.id);
    if (seen.has(id)) return false;
    seen.add(id);
    if (clubIds.includes(String(row.club_id ?? ""))) return true;
    return clubIds.some((clubId) =>
      fanTeamMatchesPostedClub(
        { id: clubId, name: clubName, displayName: clubName },
        { clubId: row.club_id, title: row.title }
      )
    );
  });
}

export async function clearClubProjectsAndSponsors(
  clubName = "Arsenal"
): Promise<ClearedClubData> {
  const clubs = await arsenalClubRows(clubName);
  const clubIds = clubs.map((row) => String(row.id));
  const clubNames = clubs.map((row) => String(row.name));
  const hostedCampaigns = await loadClubCampaigns(clubIds, clubName);
  const campaignIds = hostedCampaigns.map((row) => String(row.id));

  const rpc = await supabase.rpc("clear_club_projects_and_sponsors", {
    p_club_name: clubName,
  });
  if (!rpc.error && rpc.data && typeof rpc.data === "object") {
    const row = rpc.data as Record<string, unknown>;
    const local = clearClubLocalProjectsAndSponsors({
      clubName,
      clubIds,
      campaignIds,
    });
    await deleteWhereClubId("notifications", clubIds);
    const remaining = await loadClubCampaigns(clubIds, clubName);
    return {
      clubIds,
      clubNames,
      portfolios: Number(row.portfolios) || 0,
      campaignProjects: Number(row.campaignProjects) || 0,
      matchCampaigns: Number(row.matchCampaigns) || 0,
      clubProjects: Number(row.clubProjects) || 0,
      sponsorshipCampaigns: Number(row.sponsorshipCampaigns) || 0,
      walletsRemoved: local.walletsRemoved,
      sponsorsRemoved: local.sponsorsRemoved,
      remainingCampaigns: remaining.filter((item) => item.status === "open").length,
    };
  }

  if (campaignIds.length > 0) {
    await supabase.from("supporter_votes").delete().in("campaign_id", campaignIds);
    await supabase.from("campaign_projects").delete().in("campaign_id", campaignIds);
    await supabase.from("match_campaigns").update({ status: "closed" }).in("id", campaignIds);
    await supabase.from("match_campaigns").delete().in("id", campaignIds);
  }

  const campaignProjects = campaignIds.length;
  const matchCampaigns = campaignIds.length;
  const portfolios = await deleteWhereClubId("club_match_portfolio", clubIds);
  const clubProjects = await deleteWhereClubId("climate_projects", clubIds);
  await deleteWhereClubId("club_climate_file_records", clubIds);
  await deleteWhereClubId("sponsor_match_offers", clubIds);
  await deleteWhereClubId("sponsor_project_proposals", clubIds);
  await deleteWhereClubId("notifications", clubIds);

  const allSponsorship = await supabase
    .from("sponsorship_campaigns")
    .select("id, campaign_name, sponsored_event, fixture");
  const arsenalSponsorshipIds = (allSponsorship.data ?? [])
    .filter((row) => {
      const sponsored = String(row.sponsored_event ?? "").replace(/goals scored/i, "").trim();
      return seasonNamesMatch(sponsored, clubName);
    })
    .map((row) => String(row.id));
  let sponsorshipCampaigns = 0;
  if (arsenalSponsorshipIds.length > 0) {
    const deleted = await supabase
      .from("sponsorship_campaigns")
      .delete()
      .in("id", arsenalSponsorshipIds)
      .select("id");
    sponsorshipCampaigns = deleted.data?.length ?? 0;
  }

  const local = clearClubLocalProjectsAndSponsors({
    clubName,
    clubIds,
    campaignIds,
  });

  const remaining = await loadClubCampaigns(clubIds, clubName);

  return {
    clubIds,
    clubNames,
    portfolios,
    campaignProjects,
    matchCampaigns,
    clubProjects,
    sponsorshipCampaigns,
    walletsRemoved: local.walletsRemoved,
    sponsorsRemoved: local.sponsorsRemoved,
    remainingCampaigns: remaining.filter((item) => item.status === "open").length,
  };
}
