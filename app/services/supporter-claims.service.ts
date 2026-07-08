import { supabase } from "../lib/supabase";

export async function claimSponsorCredit({
  supporterId,
  sponsorCreditId,
  clubId,
}: {
  supporterId: string;
  sponsorCreditId: string;
  clubId: string;
}) {
  const { data: credit, error: creditError } = await supabase
    .from("sponsor_climate_credits")
    .select("*")
    .eq("id", sponsorCreditId)
    .single();

  if (creditError) throw creditError;

  const remaining = credit.credits_issued - credit.credits_claimed;

  if (remaining <= 0) {
    const { data, error } = await supabase
      .from("supporter_claims")
      .insert([
        {
          supporter_id: supporterId,
          sponsor_credit_id: sponsorCreditId,
          club_id: clubId,
          claim_status: "unsuccessful",
        },
      ])
      .select();

    if (error) throw error;

    return {
      success: false,
      message: "No credits remaining.",
      claim: data,
    };
  }

  const { data: claim, error: claimError } = await supabase
    .from("supporter_claims")
    .insert([
      {
        supporter_id: supporterId,
        sponsor_credit_id: sponsorCreditId,
        club_id: clubId,
        claim_status: "successful",
      },
    ])
    .select();

  if (claimError) throw claimError;

  const { error: updateError } = await supabase
    .from("sponsor_climate_credits")
    .update({
      credits_claimed: credit.credits_claimed + 1,
    })
    .eq("id", sponsorCreditId);

  if (updateError) throw updateError;

  return {
    success: true,
    message: "Credit claimed successfully.",
    claim,
  };
}