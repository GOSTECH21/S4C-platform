"use client";

import { useMemo, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { FanClimateProjectPager } from "@/app/components/fan/FanClimateProjectPager";
import { FEATURED_PROJECT_NAME } from "@/app/lib/sccan-catalog";
import {
  DEFAULT_WALLET_VOTE_GBP,
  formatWalletGbp,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import type { FanProjectDetail, FanProjectSponsor } from "@/app/lib/fan-climate-project-cards";

const DETAILS: FanProjectDetail[] = [
  {
    id: "gss",
    name: FEATURED_PROJECT_NAME,
    description:
      "Install rooftop solar systems in schools around the world so classrooms can run on clean energy.",
    category: "Solar Energy",
  },
  {
    id: "rooftop",
    name: "Community Rooftop Solar",
    description:
      "Help bring cleaner energy to community buildings through your club's climate programme.",
    category: "Solar Energy",
  },
  {
    id: "energy",
    name: "Vauxhall Local Community Energy",
    description: "Community energy for streets around the stadium.",
    category: "Renewable Energy",
  },
  {
    id: "river",
    name: "Sunderland Riverside Restoration",
    description: "Restore the river corridor and lock up carbon on the Wear.",
    category: "Biodiversity",
    location: "River Wear, Sunderland, SR1 1UN",
  },
  {
    id: "heat",
    name: "Vauxhall Shared Clean Heat Loop",
    description: "Shared clean heat for nearby terraced streets.",
    category: "Renewable Energy",
  },
];

const INITIAL: NumberedClimateProject[] = DETAILS.map((project, index) => ({
  id: project.id,
  name: project.name,
  number: index + 1,
  fundedGbp: index === 0 || index === 3 ? 0.2 : 0,
  votesReceived: index === 0 || index === 3 ? 1 : 0,
}));

export default function ClimateProjectsPreviewPage() {
  const [numbered, setNumbered] = useState(INITIAL);
  const [leadRemaining, setLeadRemaining] = useState(9599.8);
  const [localRemaining, setLocalRemaining] = useState(1149.8);
  const [used, setUsed] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const lead: FanProjectSponsor = useMemo(
    () => ({
      brandName: "American Express",
      kind: "lead",
      remainingGbp: leadRemaining,
      committedGbp: 9600,
      logoUrl: null,
    }),
    [leadRemaining]
  );
  const locals: FanProjectSponsor[] = useMemo(
    () => [
      {
        brandName: "Scotmid Coop",
        kind: "local",
        remainingGbp: localRemaining,
        committedGbp: 1150,
        sponsoredProjectId: "rooftop",
        sponsoredProjectName: "Community Rooftop Solar",
      },
    ],
    [localRemaining]
  );

  return (
    <main className="min-h-screen px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-xl">
        <FanNav />
        <FanClimateProjectPager
          clubName="Everton"
          numbered={numbered}
          details={DETAILS}
          lead={lead}
          locals={locals}
          usedSponsorNames={used}
          voteNotice={notice}
          onFund={({ brandName, projectNumber }) => {
            const project = numbered.find(
              (row) => String(row.number) === String(projectNumber)
            );
            if (!project) return false;
            setNumbered((prev) =>
              prev.map((row) =>
                row.id === project.id
                  ? {
                      ...row,
                      fundedGbp: row.fundedGbp + DEFAULT_WALLET_VOTE_GBP,
                      votesReceived: row.votesReceived + 1,
                    }
                  : row
              )
            );
            if (brandName === "American Express") {
              setLeadRemaining((value) => value - DEFAULT_WALLET_VOTE_GBP);
            } else {
              setLocalRemaining((value) => value - DEFAULT_WALLET_VOTE_GBP);
            }
            setUsed((prev) => [...prev, brandName]);
            setNotice(
              `FUND-IT moved ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} from ${brandName}'s Carbon Wallet into ${project.name}.`
            );
            return true;
          }}
        />
      </div>
    </main>
  );
}
