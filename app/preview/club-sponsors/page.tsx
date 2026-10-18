"use client";

import { useEffect, useState } from "react";
import { ClubClimateSponsorTabs } from "@/app/components/club/ClubClimateSponsorTabs";
import {
  MATCH_DAY_APPROVED_LABEL,
  MATCH_DAY_FULLY_FUNDED_LABEL,
  clubDashboardLookbackCopy,
} from "@/app/lib/partner-projects";
import {
  lookbackProjectFunding,
  matchDayProjectFundingLine,
} from "@/app/lib/climate-funding";
import { SponsorLeaderboard } from "@/app/components/fan/SponsorLeaderboard";
import { brandKey, type GoalSponsorshipNetwork } from "@/app/lib/climate-sponsors";
import {
  donationEntriesForClubSponsors,
  rankSponsorDonations,
  type SponsorLeaderboardRow,
} from "@/app/lib/sponsor-leaderboard";
import { writeLocalSponsorRecord, type LocalSponsorRecord } from "@/app/lib/local-sponsor";
import {
  leadClimateSponsorsForClub,
  localBusinessClimateSponsorsForClub,
  saveGoalNetwork,
  lockMatchDayClub,
} from "@/app/services/climate-sponsors.service";

const NETWORK_KEY = "s4p.sponsor.goalNetwork";
const LOCK_KEY = "s4p.sponsor.matchLock";

function network(
  brandName: string,
  clubName: string,
  email: string
): GoalSponsorshipNetwork {
  return {
    brandKey: brandKey(brandName),
    brandName,
    email,
    clubNames: [clubName],
    leagues: [],
  };
}

const SEEDED_HIBS_LOCALS: LocalSponsorRecord[] = [
  {
    brandName: "Mash Tun",
    email: "mash@local.test",
    clubName: "Hibernian",
    pledgeGbp: 500,
    createdAt: "2026-10-04T00:00:00.000Z",
    submittedAt: "2026-10-04T00:00:00.000Z",
    source: "registered",
    acceptedTerms: true,
    signerName: "Jamie",
    signedAt: "2026-10-04T00:00:00.000Z",
    matchSponsorships: [{ fixtureName: "Hibernian v Hearts", amountGbp: 500 }],
  },
];

const SEEDED_ARSENAL_LOCALS: LocalSponsorRecord[] = [
  {
    brandName: "Piazza Italiana",
    email: "piazza@local.test",
    clubName: "Arsenal",
    pledgeGbp: 1750,
    createdAt: "2026-10-04T00:00:00.000Z",
    submittedAt: "2026-10-04T00:00:00.000Z",
    source: "registered",
    acceptedTerms: true,
    signerName: "Jamie",
    signedAt: "2026-10-04T00:00:00.000Z",
    matchSponsorships: [
      { fixtureName: "Arsenal v Leeds United", amountGbp: 1750 },
    ],
  },
  {
    brandName: "The Fountain",
    email: "fountain@local.test",
    clubName: "Arsenal",
    pledgeGbp: 800,
    createdAt: "2026-10-04T00:00:00.000Z",
    submittedAt: "2026-10-04T00:00:00.000Z",
    source: "registered",
    acceptedTerms: true,
    signerName: "Jamie",
    signedAt: "2026-10-04T00:00:00.000Z",
    matchSponsorships: [
      { fixtureName: "Arsenal v Leeds United", amountGbp: 800 },
    ],
  },
];

function seedStores() {
  window.localStorage.removeItem(NETWORK_KEY);
  window.localStorage.removeItem(LOCK_KEY);
  const hibsLocals = [
    "Interval",
    "Kokobean Cafe",
    "Tax Assist",
    "Top Cellar",
  ];
  saveGoalNetwork(network("American Express", "Hibernian", "amex@amex.test"));
  lockMatchDayClub({
    brandName: "American Express",
    clubName: "Hibernian",
    matchLabel: "Scottish Premiership Match",
    fixtureName: "Hibernian v Hearts",
  });
  try {
    saveGoalNetwork(network("Puma", "Hibernian", "puma@puma.test"));
    lockMatchDayClub({
      brandName: "Puma",
      clubName: "Hibernian",
      matchLabel: "Scottish Premiership Match",
      fixtureName: "Hibernian v Hearts",
    });
  } catch {
    // A second Lead Climate Sponsor on the same Hibernian Match Day must be rejected.
  }
  for (const brandName of hibsLocals) {
    saveGoalNetwork(network(brandName, "Hibernian", `${brandName}@local.test`));
    try {
      lockMatchDayClub({
        brandName,
        clubName: "Hibernian",
        matchLabel:
          brandName === "Interval" || brandName === "Tax Assist"
            ? "Premier League Match"
            : "Scottish Premiership Match",
      });
    } catch {
      // Locals never occupy the Lead slot; ignore a stale lock error.
    }
  }
  writeLocalSponsorRecord(SEEDED_HIBS_LOCALS[0]);

  saveGoalNetwork(network("Puma", "Arsenal", "puma@puma.test"));
  try {
    lockMatchDayClub({
      brandName: "Puma",
      clubName: "Arsenal",
      matchLabel: "Premier League Match",
      fixtureName: "Arsenal v Leeds United",
    });
  } catch {
    // Puma is Arsenal's Lead Climate Sponsor; ignore a duplicate lock.
  }
  for (const row of SEEDED_ARSENAL_LOCALS) {
    writeLocalSponsorRecord(row);
  }

  saveGoalNetwork(network("Heineken", "Kilmarnock", "heineken@heineken.test"));
  writeLocalSponsorRecord({
    brandName: "The Fountain",
    email: "fountain@kilmarnock.test",
    clubName: "Kilmarnock",
    pledgeGbp: 800,
    createdAt: "2026-10-04T00:00:00.000Z",
    submittedAt: "2026-10-04T00:00:00.000Z",
    source: "registered",
    acceptedTerms: true,
    signerName: "Alex",
    signedAt: "2026-10-04T00:00:00.000Z",
    matchSponsorships: [
      { fixtureName: "Kilmarnock v Hearts", amountGbp: 800 },
    ],
  });
}

export default function ClubSponsorsPreviewPage() {
  const [hibsLeads, setHibsLeads] = useState(
    [] as ReturnType<typeof leadClimateSponsorsForClub>
  );
  const [hibsLocals, setHibsLocals] = useState(SEEDED_HIBS_LOCALS);
  const [arsenalLeads, setArsenalLeads] = useState(
    [] as ReturnType<typeof leadClimateSponsorsForClub>
  );
  const [arsenalLocals, setArsenalLocals] = useState(SEEDED_ARSENAL_LOCALS);
  const [kilmarnockLeads, setKilmarnockLeads] = useState(
    [] as ReturnType<typeof leadClimateSponsorsForClub>
  );
  const [kilmarnockLocals, setKilmarnockLocals] = useState(
    [] as ReturnType<typeof localBusinessClimateSponsorsForClub>
  );
  const [hibsBoard, setHibsBoard] = useState<SponsorLeaderboardRow[]>([]);
  const [arsenalBoard, setArsenalBoard] = useState<SponsorLeaderboardRow[]>([]);

  useEffect(() => {
    try {
      seedStores();
      const hibsLeadRows = leadClimateSponsorsForClub("Hibernian");
      const hibsLocalRows = localBusinessClimateSponsorsForClub("Hibernian");
      const arsenalLeadRows = leadClimateSponsorsForClub("Arsenal");
      const arsenalLocalRows = localBusinessClimateSponsorsForClub("Arsenal");
      const kilmarnockLeadRows = leadClimateSponsorsForClub("Kilmarnock");
      const kilmarnockLocalRows = localBusinessClimateSponsorsForClub("Kilmarnock");
      setHibsLeads(hibsLeadRows);
      setHibsLocals(hibsLocalRows);
      setArsenalLeads(arsenalLeadRows);
      setArsenalLocals(arsenalLocalRows);
      setKilmarnockLeads(kilmarnockLeadRows);
      setKilmarnockLocals(kilmarnockLocalRows);
      setHibsBoard(
        rankSponsorDonations(
          donationEntriesForClubSponsors({
            clubName: "Hibernian",
            leads: hibsLeadRows,
            locals: hibsLocalRows,
          })
        )
      );
      setArsenalBoard(
        rankSponsorDonations(
          donationEntriesForClubSponsors({
            clubName: "Arsenal",
            leads: arsenalLeadRows,
            locals: arsenalLocalRows,
          })
        )
      );
    } catch (err) {
      console.error("club-sponsors preview seed failed", err);
    }
  }, []);

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-16">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
            Preview
          </p>
          <h1 className="mt-2 text-4xl font-black">Club Climate Sponsors</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Each club shows only the brands that chose it. Hibernian Lead is
            American Express. Arsenal Lead is Puma. Heineken signing up for
            Kilmarnock stays on Our Lead Climate Sponsor, not Local Businesses.
          </p>
        </section>

        <section data-club="hibernian">
          <h2 className="text-3xl font-black">Hibernian</h2>
          <ClubClimateSponsorTabs
            clubName="Hibernian"
            leadSponsors={hibsLeads}
            localSponsors={hibsLocals}
            initialTab="local"
          />
          <div className="mt-8">
            <h3 className="mb-4 text-2xl font-black">Hibernian Sponsor Leaderboard</h3>
            <SponsorLeaderboard rows={hibsBoard} affiliateClubs={["Hibernian"]} />
          </div>
        </section>

        <section data-club="kilmarnock">
          <h2 className="text-3xl font-black">Kilmarnock</h2>
          <ClubClimateSponsorTabs
            clubName="Kilmarnock"
            leadSponsors={kilmarnockLeads}
            localSponsors={kilmarnockLocals}
            approvedBrandNames={["Heineken"]}
          />
          <KilmarnockLookbackPreview />
        </section>

        <section data-club="arsenal">
          <h2 className="text-3xl font-black">Arsenal</h2>
          <ClubClimateSponsorTabs
            clubName="Arsenal"
            leadSponsors={arsenalLeads}
            localSponsors={arsenalLocals}
          />
          <div className="mt-8">
            <h3 className="mb-4 text-2xl font-black">Arsenal Sponsor Leaderboard</h3>
            <SponsorLeaderboard rows={arsenalBoard} affiliateClubs={["Arsenal"]} />
          </div>
        </section>
      </div>
    </main>
  );
}

const KILMARNOCK_LOOKBACK = [
  {
    id: "gss",
    name: "Global Schools Solar",
    funding_goal: 150000,
    fundedGbp: 2300,
  },
  {
    id: "spoke",
    name: "Wee Spoke Hub",
    funding_goal: 8000,
    fundedGbp: 8000,
  },
];

function KilmarnockLookbackPreview() {
  return (
    <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
        Match Day File Record
      </p>
      <h3 className="mt-2 text-3xl font-black">
        Selected and Funded Projects, kept for lookback
      </h3>
      <p className="mt-2 max-w-2xl text-slate-400">
        {clubDashboardLookbackCopy()}
      </p>
      <ul className="mt-6 space-y-2 text-slate-300">
        {KILMARNOCK_LOOKBACK.map((project) => {
          const funding = lookbackProjectFunding({
            project,
            fanFunding: [project],
          });
          return (
            <li
              key={project.id}
              className="flex flex-wrap items-center gap-2"
            >
              <span>• {project.name}</span>
              <span className="rounded-full bg-s4p-mark px-2.5 py-0.5 text-xs font-semibold text-slate-950">
                {MATCH_DAY_APPROVED_LABEL}
              </span>
              {funding.fullyFunded ? (
                <span className="rounded-full bg-s4p-mark px-2.5 py-0.5 text-xs font-semibold text-slate-950">
                  {MATCH_DAY_FULLY_FUNDED_LABEL}
                </span>
              ) : null}
              <span className="text-sm text-green-300">
                {matchDayProjectFundingLine(
                  funding.receivedGbp,
                  funding.soughtGbp
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
