export const MISSING_CAMPAIGN_VOTE_MESSAGE =
  "This club's Match Day voting campaign is not open yet. Ask the Sustainability Director to open the club dashboard (or post the 5 Climate Projects to fans again), then submit your vote.";

export function isVoteUuid(
  value: string | null | undefined
): value is string {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value ?? ""
  );
}

export function voteRowsForInsert(
  supporterId: string,
  selectedProjectIds: string[],
  campaignId: string | null | undefined
) {
  const resolved = isVoteUuid(campaignId) ? campaignId : null;
  return selectedProjectIds.map((projectId) => ({
    supporter_id: supporterId,
    climate_project_id: projectId,
    ...(resolved ? { campaign_id: resolved } : {}),
  }));
}

export function ownedCampaignId(
  campaign: { id?: string | null; club_id?: string | null } | null | undefined,
  postedClubId: string | null | undefined
): string | null {
  const id = campaign?.id;
  if (!isVoteUuid(id)) return null;
  if (
    isVoteUuid(postedClubId) &&
    campaign?.club_id &&
    campaign.club_id !== postedClubId
  ) {
    return null;
  }
  return id;
}

export function isCampaignIdNotNullError(error: {
  code?: string;
  message?: string;
} | null | undefined) {
  if (!error) return false;
  if (error.code !== "23502") return false;
  return /campaign_id/i.test(String(error.message ?? ""));
}
