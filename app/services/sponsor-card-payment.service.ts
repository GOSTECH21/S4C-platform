import {
  cardPaymentAmountGbp,
  recordMatchDayCardPayment,
  type MatchDayCardPayment,
} from "../lib/sponsor-card-payment";
import { notifySignedSponsorship } from "../lib/sponsor-completion-flow";
import {
  recordLeadMatchApproved,
  recordLeadMatchPaid,
} from "../lib/lead-project-folder";
import {
  brandsMatch,
  displayLockFixture,
} from "../lib/climate-sponsors";
import {
  isSignedOffLocalSponsor,
  localSponsorsForClub,
} from "../lib/local-sponsor";
import {
  bindFundedSponsorToClub,
  ensureGoalNetwork,
  ensureMatchDayClubLock,
  loadMatchDayLock,
  lockWalletFundingToClub,
} from "./climate-sponsors.service";
import { publishSignedSponsorshipToFans } from "./club-match-day.service";
import { loadClubChosenClimateProjects } from "./sponsor-offers.service";
import { readClimateWallet } from "./sponsor-wallet.service";

export async function confirmMatchDayCardPayment({
  brandName,
  clubName,
  kind,
}: {
  brandName: string;
  clubName: string;
  kind: "lead" | "local" | "philanthropist";
}): Promise<MatchDayCardPayment> {
  const brand = brandName.trim();
  const club = clubName.trim();
  if (!brand || !club) {
    throw new Error("Choose the club this sponsorship is for first.");
  }
  const wallet = readClimateWallet(club, brand);
  const amountGbp = cardPaymentAmountGbp(wallet);
  if (!(amountGbp > 0)) {
    throw new Error(
      "Confirm the amounts on the Climate Sponsorship Wallet first."
    );
  }

  const uploaded = await loadClubChosenClimateProjects(club);
  const projects = uploaded?.projects ?? [];
  const projectIds = projects.map((project) => project.id).filter(Boolean);
  const clubId = String(uploaded?.clubId ?? "").trim();

  if (kind === "lead") {
    const existing = loadMatchDayLock(brand);
    ensureMatchDayClubLock({
      brandName: brand,
      clubName: club,
      matchLabel: existing?.matchLabel,
      fixtureName: existing?.fixtureName,
      competition: existing?.competition,
      fixtureDate: existing?.fixtureDate,
      kickoff: existing?.kickoff,
      venue: existing?.venue,
      sourceUrl: existing?.sourceUrl,
    });
    lockWalletFundingToClub({
      brandName: brand,
      clubName: club,
      commitmentFeeGbp: wallet?.commitmentFeeGbp ?? amountGbp,
      gbpPerGoal: wallet?.gbpPerGoal,
      maximumSponsorshipGbp: wallet?.maximumSponsorshipGbp,
    });
  }

  ensureGoalNetwork({ brandName: brand, clubNames: [club] });
  bindFundedSponsorToClub({
    clubName: club,
    brandName: brand,
    spentGbp:
      kind === "philanthropist"
        ? Number(wallet?.sponsorshipGbp) || amountGbp
        : amountGbp,
  });

  const payment = recordMatchDayCardPayment({
    clubId,
    clubName: club,
    brandName: brand,
    projectIds,
    amountGbp,
    kind,
  });

  if (kind === "local") {
    const local = localSponsorsForClub(club).find(
      (row) =>
        brandsMatch(row.brandName, brand) && isSignedOffLocalSponsor(row)
    );
    const matchTitle =
      displayLockFixture(loadMatchDayLock(brand)) ||
      String(local?.matchSponsorships?.[0]?.fixtureName ?? "").trim() ||
      `${club} Match`;
    const localAmount =
      Number(wallet?.sponsorshipGbp) ||
      Number(local?.pledgeGbp) ||
      Number(local?.matchSponsorships?.[0]?.amountGbp) ||
      amountGbp;
    recordLeadMatchApproved({
      brandName: brand,
      offerId: "",
      clubId: clubId || `name:${club}`,
      clubName: club,
      matchTitle,
      matchDate: local?.matchSponsorships?.[0]?.date ?? null,
      headline: `${club} · ${matchTitle}`,
      signedAt: new Date().toISOString(),
      signerName: brand,
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description ?? null,
        country: project.country ?? null,
        estimated_co2: project.estimated_co2 ?? null,
        fundedGbp: 0,
      })),
      sponsorshipAmountGbp: localAmount,
      gbpPerGoal: null,
      maxAmount: null,
    });
    recordLeadMatchPaid({
      brandName: brand,
      clubName: club,
      matchTitle,
    });
  }

  if (clubId && projectIds.length > 0) {
    await publishSignedSponsorshipToFans({
      clubId,
      clubName: club,
      brandName: brand,
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
      })),
      minAmount: kind === "lead" ? wallet?.commitmentFeeGbp : amountGbp,
      gbpPerGoal: wallet?.gbpPerGoal,
      maxAmount: wallet?.maximumSponsorshipGbp,
    });
    notifySignedSponsorship({
      clubId,
      clubName: club,
      brandName: brand,
      projectIds,
    });
  }

  return payment;
}
