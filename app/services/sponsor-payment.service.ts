export function calculateGoalPayment(campaign: any) {
  const amount = Number(campaign.amount_per_goal || 0);

  console.group("💰 Sponsorship Payment");

  console.log("Campaign:", campaign.campaign_name);
  console.log("Package:", campaign.package);
  console.log("Amount per Goal:", `£${amount.toLocaleString()}`);

  console.groupEnd();

  return amount;
}