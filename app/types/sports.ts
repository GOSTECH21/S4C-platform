export type Sport = {
  id: string;
  name: string;
};

export type League = {
  id: string;
  sportId: string;
  name: string;
  country: string;
  season: string;
};

export type Club = {
  id: string;
  leagueId: string;
  name: string;
  shortName: string;
  country: string;
};

export type Match = {
  id: string;
  leagueId: string;
  homeClubId: string;
  awayClubId: string;
  kickoffTime: string;
  status: "scheduled" | "live" | "completed";
  homeScore: number;
  awayScore: number;
};

export type ScoreEvent = {
  id: string;
  matchId: string;
  clubId: string;
  scoreType: string;
  scorerName?: string;
  minute?: number;
  pointsValue: number;
};