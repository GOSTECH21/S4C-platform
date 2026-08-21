"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CampaignBuilderPage() {

  const router = useRouter();

  // -----------------------------
  // Wizard State
  // -----------------------------

  const [step, setStep] = useState(1);

  const [selectedSport, setSelectedSport] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
        const [selectedFixture, setSelectedFixture] = useState("");
const [selectedOutcome, setSelectedOutcome] = useState("");
const [selectedPackage, setSelectedPackage] = useState("Gold");

  const [campaignName, setCampaignName] = useState("");
  const [trigger, setTrigger] = useState("Goal");
  const [contribution, setContribution] = useState(2);
  const [reward, setReward] = useState("10% Discount");
  const [budget, setBudget] = useState(1000);

  // -----------------------------
  // Competitions
  // -----------------------------

  const competitions: Record<string, string[]> = {

    Football: [
    "Premier League",
    "Championship",
    "Scottish Premier League",
    "Women's Super League",
  ],

  Rugby: [
    "Six Nations",
    "Premiership Rugby",
  ],

  NFL: [
    "NFL Regular Season",
  ],

  Basketball: [
    "NBA",
    "EuroLeague",
  ],

  Cricket: [
    "The Hundred",
    "IPL",
  ],

  Golf: [
    "PGA Tour",
    "DP World Tour",
  ],
};

  // -----------------------------
  // Temporary Fixtures
  // (These will later come from a Live Football API)
  // -----------------------------

  const fixtures: Record<string, string[]> = {
  "Premier League": [
    "Arsenal vs Chelsea",
    "Liverpool vs Everton",
    "Manchester United vs Leeds United",
    "Tottenham Hotspur vs Newcastle United",
    "Manchester City vs Aston Villa",
    "Brighton vs West Ham United",
    "Crystal Palace vs Fulham",
    "Nottingham Forest vs Brentford",
    "Wolverhampton Wanderers vs Bournemouth",
    "Burnley vs Sunderland",
  ],

  "Championship": [
    "Leicester City vs Norwich City",
    "Sheffield United vs Middlesbrough",
    "Coventry City vs Watford",
    "West Bromwich Albion vs Blackburn Rovers",
    "Queens Park Rangers vs Stoke City",
    "Hull City vs Swansea City",
    "Cardiff City vs Bristol City",
    "Preston North End vs Millwall",
  ],

  "Scottish Premier League": [
    "Celtic vs Rangers",
    "Hearts vs Hibernian",
    "Aberdeen vs Dundee United",
    "Motherwell vs Kilmarnock",
    "St Mirren vs Ross County",
    "Livingston vs St Johnstone",
  ],

  "Women's Super League": [
    "Arsenal Women vs Chelsea Women",
    "Manchester City Women vs Manchester United Women",
    "Liverpool Women vs Aston Villa Women",
    "Everton Women vs Tottenham Women",
    "Brighton Women vs Leicester Women",
    "West Ham Women vs Crystal Palace Women",
  ],

  "Six Nations": [
    "England vs France",
    "Ireland vs Scotland",
    "Wales vs Italy",
    "France vs Wales",
    "Scotland vs England",
    "Italy vs Ireland",
  ],

  "Premiership Rugby": [
    "Saracens vs Harlequins",
    "Bath vs Leicester Tigers",
    "Northampton Saints vs Bristol Bears",
    "Exeter Chiefs vs Gloucester",
    "Sale Sharks vs Newcastle Falcons",
    "Wasps vs Worcester Warriors",
  ],

  "NFL Regular Season": [
    "Kansas City Chiefs vs Buffalo Bills",
    "Dallas Cowboys vs Philadelphia Eagles",
    "Green Bay Packers vs Chicago Bears",
    "San Francisco 49ers vs Seattle Seahawks",
    "Miami Dolphins vs New York Jets",
    "Baltimore Ravens vs Cincinnati Bengals",
    "Pittsburgh Steelers vs Cleveland Browns",
    "Detroit Lions vs Minnesota Vikings",
  ],

  "NBA": [
    "Los Angeles Lakers vs Golden State Warriors",
    "Boston Celtics vs Miami Heat",
    "New York Knicks vs Brooklyn Nets",
    "Chicago Bulls vs Milwaukee Bucks",
    "Dallas Mavericks vs Houston Rockets",
    "Denver Nuggets vs Phoenix Suns",
    "Philadelphia 76ers vs Toronto Raptors",
    "Sacramento Kings vs LA Clippers",
  ],

  "EuroLeague": [
    "Real Madrid vs Barcelona",
    "Olympiacos vs Panathinaikos",
    "Fenerbahçe vs Anadolu Efes",
    "Virtus Bologna vs Olimpia Milano",
    "Bayern Munich vs AS Monaco",
    "Maccabi Tel Aviv vs Partizan Belgrade",
  ],

  "The Hundred": [
    "Oval Invincibles vs London Spirit",
    "Southern Brave vs Trent Rockets",
    "Manchester Originals vs Northern Superchargers",
    "Welsh Fire vs Birmingham Phoenix",
    "London Spirit vs Oval Invincibles",
    "Northern Superchargers vs Southern Brave",
  ],

  "IPL": [
    "Mumbai Indians vs Chennai Super Kings",
    "Royal Challengers Bengaluru vs Kolkata Knight Riders",
    "Delhi Capitals vs Rajasthan Royals",
    "Punjab Kings vs Gujarat Titans",
    "Sunrisers Hyderabad vs Lucknow Super Giants",
    "Chennai Super Kings vs Kolkata Knight Riders",
    "Mumbai Indians vs Royal Challengers Bengaluru",
    "Rajasthan Royals vs Delhi Capitals",
  ],

  "PGA Tour": [
    "The Players Championship - Final Round",
    "Arnold Palmer Invitational - Final Round",
    "Genesis Invitational - Final Round",
    "Memorial Tournament - Final Round",
    "Travelers Championship - Final Round",
    "FedEx St Jude Championship - Final Round",
  ],

  "DP World Tour": [
    "BMW PGA Championship - Final Round",
    "Dubai Desert Classic - Final Round",
    "Scottish Open - Final Round",
    "Irish Open - Final Round",
    "Italian Open - Final Round",
    "Andalucía Masters - Final Round",
  ],
};
const opponent = selectedFixture
  ?.split(" vs ")
  .find(team => team !== selectedOutcome);

const generatedCampaignName =
  selectedOutcome && opponent
    ? `${selectedOutcome} Goal Sponsorship vs ${opponent}`
    : "";
return (
  <div className="mx-auto max-w-6xl px-6 py-12">

    {/* Header */}

    <div className="mb-10">

      <h1 className="text-4xl font-bold">
        Create Sponsorship Campaign
      </h1>

      <p className="mt-3 text-slate-600">
        Build a sponsorship campaign in four simple steps.
      </p>

    </div>

    {/* Progress */}

    <div className="mb-8 flex gap-3">

      {[1, 2, 3, 4].map((n) => (

        <div
          key={n}
          className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
            step >= n
              ? "bg-emerald-600 text-white"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {n}
        </div>

      ))}

    </div>

    {/* White Card */}

    <div className="rounded-2xl border bg-white p-8 shadow-sm">

      {/* ===========================
           STEP 1
      ============================ */}

      {step === 1 && (

        <div>

          <h2 className="mb-6 text-2xl font-bold">
            Choose a Sport
          </h2>

          <p className="mb-8 text-slate-500">
            Select the sport you want to sponsor.
          </p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

            {[
              "Football",
              "Rugby",
              "NFL",
              "Basketball",
              "Cricket",
              "Golf",
            ].map((sport) => (

              <button
                key={sport}
                onClick={() => {
                  setSelectedSport(sport);
                  setStep(2);
                }}
                className="rounded-xl border p-6 text-center transition hover:border-emerald-600 hover:bg-emerald-50"
              >
                {sport}
          </button>

        ))}
      </div>

    </div>

  )}

{/* ===========================
           STEP 2
      ============================ */}

{step === 2 && (

  <div>

    <h2 className="mb-6 text-2xl font-bold">
      Choose Competition
    </h2>

    <p className="mb-8 text-slate-500">
      Select the competition you want to sponsor.
    </p>

    <div className="grid gap-4">

      {(competitions[selectedSport] || []).map((competition) => (

        <button
          key={competition}
          onClick={() => {
            setSelectedCompetition(competition);
            setStep(3);
          }}
          className="rounded-xl border p-5 text-left transition hover:border-emerald-600 hover:bg-emerald-50"
        >
          {competition}
        </button>

      ))}

    </div>

    <div className="mt-8 flex gap-4">

      <button
        onClick={() => setStep(1)}
        className="rounded-lg border px-6 py-3 hover:bg-slate-100"
      >
        ← Back
      </button>

    </div>

  </div>
)}

{/* ===========================
      STEP 3
=========================== */}

{step === 3 && (

<div>

  <h2 className="mb-6 text-2xl font-bold">
    Choose Fixture
  </h2>

  <p className="mb-8 text-slate-500">
    Select the fixture you would like to sponsor.
  </p>

  <div className="grid gap-4">

    {(fixtures[selectedCompetition] || []).map((fixture) => (

      <button
        key={fixture}
        onClick={() => {
          setSelectedFixture(fixture);
          setStep(4);
        }}
        className="rounded-xl border p-5 text-left transition hover:border-emerald-600 hover:bg-emerald-50"
      >
        {fixture}
      </button>

    ))}

  </div>

  <div className="mt-8 flex gap-4">

    <button
      onClick={() => setStep(2)}
      className="rounded-lg border px-6 py-3 hover:bg-slate-100"
    >
      ← Back
    </button>

  </div>

</div>
)}

{/* ===========================
      STEP 4
=========================== */}

{step === 4 && (

<div>

  <h2 className="mb-6 text-2xl font-bold">
    Review Sponsorship
  </h2>

  <p className="mb-8 text-slate-500">
    Review your campaign before creating it.
  </p>

  {/* Summary */}

  <div className="rounded-xl border p-6 mb-8">

    <h3 className="font-semibold mb-4">
      Campaign Summary
    </h3>

    <div className="space-y-3">

      <div className="flex justify-between">
        <span className="text-slate-500">Sport</span>
        <span>{selectedSport}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">Competition</span>
        <span>{selectedCompetition}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">Fixture</span>
        <span>{selectedFixture}</span>
      </div>

    </div>
<div className="flex justify-between">
  <span>Sponsored Event</span>

  <span className="font-medium">
    {selectedOutcome
      ? `${selectedOutcome} Goals Scored`
      : "-"}
  </span>
</div>
  </div>
{/* Sponsorship Type */}

<div className="mt-6 rounded-xl border p-6">

  <h3 className="mb-4 font-semibold">
    What would you like to sponsor?
  </h3>

  {selectedFixture && (
    <div className="grid gap-3">

      {selectedFixture.split(" vs ").map((team) => (

        <label
          key={team}
          className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:border-emerald-600"
        >

          <div>

            <p className="font-medium">
              {team} Goals Scored
            </p>

            <p className="text-sm text-slate-500">
              Reward {team} supporters whenever this team scores.
            </p>

          </div>

          <input
            type="radio"
            name="outcome"
            value={team}
            checked={selectedOutcome === team}
            onChange={() => setSelectedOutcome(team)}
          />

        </label>

      ))}

    </div>
  )}

</div>
  {/* Sponsorship Package */}

  <div className="rounded-xl border p-6 mb-8">

    <h3 className="font-semibold mb-5">
      Sponsorship Package
    </h3>

    <div className="space-y-4">

      {[
        {name:"Bronze",price:"£500"},
        {name:"Silver",price:"£2,000"},
        {name:"Gold",price:"£5,000"},
        {name:"Platinum",price:"£10,000"}
      ].map((pkg)=>(
        <label
          key={pkg.name}
          className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:border-emerald-600"
        >

          <div className="flex items-center gap-3">

            <input
              type="radio"
              name="package"
              value={pkg.name}
              checked={selectedPackage===pkg.name}
              onChange={()=>setSelectedPackage(pkg.name)}
            />

            <span>{pkg.name}</span>

          </div>

          <span className="font-semibold">
            {pkg.price}
          </span>

        </label>

      ))}

    </div>

  </div>

  {/* Climate Impact */}

  <div className="rounded-xl border bg-emerald-50 p-6 mb-8">

    <h3 className="font-semibold mb-4">
      Estimated Climate Impact
    </h3>

    <ul className="space-y-2">

      <li>🌳 2,500 Trees Planted</li>

      <li>🌍 6 Tonnes CO₂ Removed</li>

      <li>🤝 15 Community Hours Supported</li>

    </ul>

  </div>

  {/* Campaign Name */}

  <div className="mb-8">

    <label className="block mb-2 font-medium">
      Campaign Name
    </label>

    <input
    readOnly
    value={generatedCampaignName}
    className="w-full rounded-lg border p-3 bg-slate-50"
/>

  </div>

  {/* Buttons */}

  <div className="flex gap-4">

    <button

      onClick={()=>setStep(3)}

      className="rounded-lg border px-6 py-3"

    >
      ← Back
    </button>

    <button

      onClick={()=>alert("Campaign Created Successfully!")}

      className="rounded-lg bg-emerald-600 px-8 py-3 text-white hover:bg-emerald-700"

    >
      Create Sponsorship Campaign

    </button>

  </div>

</div>
)}
</div>
</div>
);
}
