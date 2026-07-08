"use client";
import { createImpactOpportunity } from "../../services/impact-opportunities.service";
import { createScoreEvent } from "../../services/score-event.service";
import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { getCompetitions } from "../../services/competitions.service";
import { getClubs } from "../../services/clubs.service";
import { processSponsorTrigger } from "../../services/sponsor-trigger.service";
import {
  createFixture,
  getFixtures,
  updateFixtureScore,
} from "../../services/fixtures.service";

type Competition = {
  id: string;
  name: string;
};

type Club = {
  id: string;
  name: string;
};

type Fixture = {
  id: string;
  fixture_date: string;
  kickoff_time: string;
  venue: string;
  status: string;
  home_score: number;
  away_score: number;
home_club_id: string;
away_club_id: string;
  competitions?: { name: string };
  home_club?: { name: string };
  away_club?: { name: string };
};

export default function FixturesAdminPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);

  const [competitionId, setCompetitionId] = useState("");
  const [homeClubId, setHomeClubId] = useState("");
  const [awayClubId, setAwayClubId] = useState("");
  const [fixtureDate, setFixtureDate] = useState("");
  const [kickoffTime, setKickoffTime] = useState("");
  const [venue, setVenue] = useState("");
async function handleRecordScore(
  fixture: Fixture,
  clubId: string
) {
  try {
    const isHomeGoal = clubId === fixture.home_club_id;

    const newHomeScore = isHomeGoal
      ? fixture.home_score + 1
      : fixture.home_score;

    const newAwayScore = !isHomeGoal
      ? fixture.away_score + 1
      : fixture.away_score;

    const scoreEvent = await createScoreEvent({
  fixtureId: fixture.id,
  clubId,
  scoreType: "Goal",
  scorerName: "Test Scorer",
  minute: 73,
});

    await updateFixtureScore({
  fixtureId: fixture.id,
  homeScore: newHomeScore,
  awayScore: newAwayScore,
  clubId: clubId,
});
    
const scoringClubName = clubId === fixture.home_club_id
  ? fixture.home_club?.name
  : fixture.away_club?.name;

await createImpactOpportunity({
  fixtureId: fixture.id,
  clubId,
  title: `${scoringClubName} goal created a Climate Action Opportunity`,
  description: `A goal by ${scoringClubName} in ${fixture.home_club?.name} vs ${fixture.away_club?.name} has created a fan-funded opportunity for measurable climate action.`,
});
    window.location.reload();

    alert("Goal recorded!");
  } catch (error) {
    console.error(error);
    alert("Failed to record goal.");
  }
}
async function loadData() {
  const competitionsData = await getCompetitions();
  const clubsData = await getClubs();
  const fixturesData = await getFixtures();

  setCompetitions(competitionsData || []);
  setClubs(clubsData || []);
  setFixtures(fixturesData || []);
}
  async function handleCreateFixture() {
    if (!competitionId || !homeClubId || !awayClubId || !fixtureDate) return;

    await createFixture({
      competitionId,
      homeClubId,
      awayClubId,
      fixtureDate,
      kickoffTime,
      venue,
    });

    setCompetitionId("");
    setHomeClubId("");
    setAwayClubId("");
    setFixtureDate("");
    setKickoffTime("");
    setVenue("");

    await loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-green-400">Fixtures Admin</h1>
          <p className="mt-3 text-slate-300">
            Create and manage fixtures that can generate S4C impact opportunities.
          </p>
        </div>

        <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-3">
          <select className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white" value={competitionId} onChange={(e) => setCompetitionId(e.target.value)}>
            <option value="">Select competition</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>

          <select className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white" value={homeClubId} onChange={(e) => setHomeClubId(e.target.value)}>
            <option value="">Home club</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>

          <select className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white" value={awayClubId} onChange={(e) => setAwayClubId(e.target.value)}>
            <option value="">Away club</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>

          <input className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white" type="date" value={fixtureDate} onChange={(e) => setFixtureDate(e.target.value)} />

          <input className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white" type="time" value={kickoffTime} onChange={(e) => setKickoffTime(e.target.value)} />

          <input className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white" placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />

          <button onClick={handleCreateFixture} className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-slate-950 md:col-span-3">
            Add Fixture
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-2xl font-bold">Fixtures</h2>

          <div className="space-y-3">
            {fixtures.map((fixture) => (
              <div key={fixture.id} className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4 md:grid-cols-8">
                <div>{fixture.fixture_date}</div>
                <div>{fixture.kickoff_time}</div>
                <div>{fixture.home_club?.name}</div>

<div className="text-center font-bold text-lg">
  {fixture.home_score} - {fixture.away_score}
</div>

<div>{fixture.away_club?.name}</div>
                
                <div className="text-slate-400">{fixture.competitions?.name}</div>
                <div className="text-slate-400">{fixture.status}</div>

<button
  onClick={() => handleRecordScore(fixture, fixture.home_club_id)}
  className="rounded bg-green-500 px-3 py-2 text-sm font-semibold text-slate-950"
>
  Home Goal
</button>

<button
  onClick={() => handleRecordScore(fixture, fixture.away_club_id)}
  className="rounded bg-blue-500 px-3 py-2 text-sm font-semibold text-white"
>
  Away Goal
</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}