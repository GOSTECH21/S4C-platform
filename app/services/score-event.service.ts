import { supabase } from "../lib/supabase";

export async function createScoreEvent({
  fixtureId,
  clubId,
  scoreType,
  scorerName,
  minute,
}: {
  fixtureId: string;
  clubId: string;
  scoreType: string;
  scorerName: string;
  minute: number;
}) {
  const { data: scoreEvent, error: scoreError } = await supabase
    .from("score_events")
    .insert([
      {
        fixture_id: fixtureId,
        club_id: clubId,
        score_type: scoreType,
        scorer_name: scorerName,
        minute,
      },
    ])
    .select()
    .single();

  if (scoreError) throw scoreError;

  const { error: opportunityError } = await supabase
    .from("impact_opportunities")
    .insert([
      {
        score_event_id: scoreEvent.id,
        fixture_id: fixtureId,
        club_id: clubId,
        title: `${scoreType} created an Impact Opportunity`,
        description:
          "This sporting moment has created a new opportunity to fund verified climate impact.",
      },
    ]);

  if (opportunityError) throw opportunityError;

  return scoreEvent;
}