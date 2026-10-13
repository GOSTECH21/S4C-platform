"use client";

import { LocalSignedSponsorHome } from "@/app/components/sponsor/LocalSignedSponsorHome";
import { lobiRowsForArea } from "@/app/lib/lobi";
import { localSponsoredMatches } from "@/app/lib/local-sponsor-home";
import type { LocalSponsorRecord } from "@/app/lib/local-sponsor";
import type { FundedSponsorProject } from "@/app/lib/sponsor-signed-home";

const mashTun: LocalSponsorRecord = {
  brandName: "Mash Tun",
  email: "mash@local.test",
  clubName: "Hibernian",
  pledgeGbp: 600,
  createdAt: "2026-10-01T12:00:00.000Z",
  submittedAt: "2026-10-01T12:00:00.000Z",
  postcode: "EH7 5AA",
  source: "registered",
  matchSponsorships: [
    { fixtureName: "Hibernian v Motherwell", amountGbp: 600 },
  ],
};

const mashHearts: LocalSponsorRecord = {
  ...mashTun,
  clubName: "Hearts",
  pledgeGbp: 600,
  matchSponsorships: [{ fixtureName: "Hearts v Aberdeen", amountGbp: 600 }],
};

const kokobean: LocalSponsorRecord = {
  brandName: "Kokobean Cafe",
  email: "koko@local.test",
  clubName: "Hibernian",
  pledgeGbp: 1000,
  createdAt: "2026-10-02T12:00:00.000Z",
  submittedAt: "2026-10-02T12:00:00.000Z",
  postcode: "EH6 6AA",
  source: "registered",
  matchSponsorships: [
    { fixtureName: "Hibernian v Dundee", amountGbp: 1000 },
  ],
};

const records = [mashTun, mashHearts, kokobean];
const fixtures = [
  { fixtureName: "Hibernian v Motherwell", date: "2026-10-18" },
  { fixtureName: "Hearts v Aberdeen", date: "2026-10-31" },
  { fixtureName: "Hibernian v Dundee", date: "2026-10-25" },
];

const projects: FundedSponsorProject[] = [
  {
    id: "spoke",
    name: "Wee Spoke Hub",
    clubName: "Hibernian",
    matchTitle: "Hibernian v Motherwell",
    description: "Fans FUND-IT onto this Match Day Climate Project.",
    fundedGbp: 0.2,
    fanFunded: true,
  },
];

export default function LocalSponsorHomePreview() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <LocalSignedSponsorHome
        brand="Mash Tun"
        logoUrl={null}
        matches={localSponsoredMatches({
          records: [mashTun, mashHearts],
          fixtures: fixtures.map((row) => ({
            id: row.fixtureName,
            homeName: row.fixtureName.split(" v ")[0],
            awayName: row.fixtureName.split(" v ")[1],
            fixtureName: row.fixtureName,
            competition: "Scottish Premiership Match",
            date: row.date,
            kickoff: null,
            venue: null,
            sourceUrl: null,
          })),
        })}
        projects={projects}
        lobiRows={lobiRowsForArea({
          records,
          area: "EH",
          monthKey: "2026-10",
          brandName: "Mash Tun",
          fixtures,
        })}
        postcodeArea="EH"
        onNewSponsorship={() => undefined}
      />
    </div>
  );
}
