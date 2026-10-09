import { ListedClimateProjectCard } from "@/app/components/climate/ListedClimateProjectCard";
import {
  civRecordFromListing,
  encodePartnerLocation,
} from "@/app/lib/climate-impact-value";
import {
  selectOwnListedProjects,
} from "@/app/lib/partner-projects";
import type { ClimateProject } from "@/app/services/votes.service";

const civ = civRecordFromListing({
  name: "Partner Rooftop Solar",
  fundingAmountSought: 12000,
  projectedCiv: 18,
  civPeriod: "Annual",
  projectLifeYears: 20,
  pipDays: 90,
  methodology: "Solar generation × applicable emissions factor",
  evidence: "Technical specification / baseline / calculations",
  verificationStatus: "Provider-declared",
  undertakingSigned: true,
  signerName: "Alex Partner",
  postcode: "EH7 5QG",
  address: "12 Albion Place, Edinburgh",
});

const leftovers: ClimateProject[] = [
  {
    id: "ghana",
    name: "Ghana Community Solar Upload",
    description: "Should not appear on a new Climate Partner home.",
    category: "Solar Energy",
    country: "Ghana",
    estimated_co2: 40,
    funding_goal: 8000,
    image_url: null,
    status: "active",
    location: encodePartnerLocation("Other Provider", civ),
  },
  {
    id: "tynecastle",
    name: "Tynecastle High School Solar Installation",
    description: "Should not appear on a new Climate Partner home.",
    category: "Solar Energy",
    country: "Scotland",
    estimated_co2: 55,
    funding_goal: 55000,
    image_url: null,
    status: "active",
    location: encodePartnerLocation("Other Provider", civ),
  },
  {
    id: "sccan",
    name: "SCCAN Community Learning Exchange",
    description: "Should not appear on a new Climate Partner home.",
    category: "Education",
    country: "Scotland",
    estimated_co2: 12,
    funding_goal: 25000,
    image_url: null,
    status: "active",
    location: encodePartnerLocation(
      "Scottish Communities Climate Action Network",
      civ
    ),
  },
];

const ownListed: ClimateProject = {
  id: "own-listed",
  name: "Partner Rooftop Solar",
  description: "The Climate Project this partner signed off for listing on S4P.",
  category: "Solar Energy",
  country: "Scotland",
  estimated_co2: 18,
  funding_goal: 12000,
  image_url: null,
  status: "listed",
  location: encodePartnerLocation("New Climate Co", civ, {
    postcode: "EH7 5QG",
    address: "12 Albion Place, Edinburgh",
  }),
};

const implementing: ClimateProject = {
  ...ownListed,
  id: "own-implementing",
  name: "Partner Rooftop Solar — in implementation",
  status: "implementation",
  location: encodePartnerLocation("New Climate Co", {
    ...civ,
    fullyFundedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }, {
    postcode: "EH7 5QG",
    address: "12 Albion Place, Edinburgh",
  }),
};

const emptyHome = selectOwnListedProjects(leftovers, "New Climate Co");
const afterSignOff = selectOwnListedProjects(
  [...leftovers, ownListed],
  "New Climate Co"
);

export default function PartnerListedPreviewPage() {
  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Climate Partner
        </p>
        <h1 className="mt-2 text-4xl font-black">Your listed Climate Projects</h1>
        <p className="mt-2 text-slate-400">
          Only the Climate Project you have just signed off for listing on
          S4P appears here — not another provider's project.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-black">Before sign-off</h2>
          {emptyHome.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
              No Climate Project is listed on this account yet. After you
              register, fill the Climate Project Form and sign it off, it
              appears here on login.
            </div>
          ) : (
            <p>Unexpected leftover listings.</p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-black">After this partner signs off</h2>
          <div className="mt-4 grid gap-4">
            {afterSignOff.map((project) => (
              <ListedClimateProjectCard
                key={project.id}
                project={project}
                canUploadImages
              />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-black">When it is being implemented</h2>
          <div className="mt-4 grid gap-4">
            <ListedClimateProjectCard
              project={implementing}
              fundedGbp={12000}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
