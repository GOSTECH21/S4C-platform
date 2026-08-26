import { findMatchingCampaign } from "./sponsorship-campaigns.service";
import { calculateGoalPayment } from "./sponsor-payment.service";
import { settleCampaign } from "./sponsor-settlement.service";
import { issueClimateCredits } from "./sponsor-climate-credits.service";

export type SportingEvent = {
  sport: string;
  competition: string;
  fixture: string;
  team: string;
  event: string;
  minute: number;
};

export async function processSportingEvent(
  sportingEvent: SportingEvent
) {
    console.log("🔥 processSportingEvent ENTERED");
  console.group("⚽ Live Sporting Event");

  console.log("Sport:", sportingEvent.sport);
  console.log("Competition:", sportingEvent.competition);
  console.log("Fixture:", sportingEvent.fixture);
  console.log("Team:", sportingEvent.team);
  console.log("Event:", sportingEvent.event);
  console.log("Minute:", sportingEvent.minute);

  const sponsoredEvent =
  sportingEvent.sport === "Rugby"
    ? `${sportingEvent.team} TRY`
    : `${sportingEvent.team} Goal Scored`;
    console.log("Looking for:", sponsoredEvent);
console.log("Looking for sponsored event:", sponsoredEvent);
  try {
    const campaigns = await findMatchingCampaign(
      sportingEvent.fixture,
      sponsoredEvent
    );
console.log("Campaigns found:", campaigns.length);
console.table(campaigns);
    if (!campaigns || campaigns.length === 0) {
  console.log("❌ No matching sponsorship campaign found.");
} else {
  console.log("✅ Matching Sponsorship Campaign(s):");

  console.table(campaigns);

  for (const campaign of campaigns) {
  const payment = calculateGoalPayment(campaign);
await issueClimateCredits(
  campaign,
  payment
);

console.log(
  `🌱 ${payment.toLocaleString()} Climate Credits Issued`
);
  console.log(
    `💷 ${campaign.campaign_name} has triggered £${payment.toLocaleString()}`
  );
  
  const updatedCampaign = await settleCampaign(
    campaign,
    payment
  );

  console.log("✅ Campaign Updated");

  console.table(updatedCampaign);
}
}

    console.groupEnd();

    return {
      success: true,
      sportingEvent,
      campaigns,
    };
  } catch (error) {
    console.error("Trigger Engine Error:", error);
    console.groupEnd();

    return {
      success: false,
      sportingEvent,
      campaigns: [],
    };
  }
}