import { readFileSync } from "fs";
import {
  appendChosenMatch,
  canClaimLeadClimateSponsor,
  chosenMatchesForClub,
  leadSponsorBrandForFixture,
  leadSponsorsForClubFromStores,
  localBusinessSponsorsForClubFromStores,
  occupyingLeadBrandNames,
  nextFanMatchForClub,
  nextSignedOffFixtureForClub,
  occupyingLeadClimateSponsor,
  occupyingLeadClimateSponsorForMatch,
  offerMatchesLockedMatch,
  brandsMatch,
  isSponsorBlockedFromClub,
  SECOND_LEAD_CLIMATE_SPONSOR_REJECTED,
  secondLeadClimateSponsorRejectedMessage,
  type GoalSponsorshipNetwork,
  type MatchDayClubLock,
} from "../app/lib/climate-sponsors";
import {
  clubFixtureFromUpcoming,
  fixtureByIdOrName,
  matchDetailsLines,
  sameNamedFixture,
} from "../app/lib/club-fixtures";
import {
  demoFixturesForClub,
  withDemoClubFixtures,
} from "../app/lib/demo-club-fixtures";
import { campaignHeadline } from "../app/lib/sponsorship-auction";
import {
  LOCAL_SPONSOR_MIN_GBP,
  isClubInboundLocalSponsor,
  isSignedOffLocalSponsor,
  isSubmittedLocalSponsor,
  localMatchLabels,
  totalLocalPledge,
  type LocalSponsorRecord,
} from "../app/lib/local-sponsor";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const arsenalLeeds = clubFixtureFromUpcoming({
  id: "list-arsenal-leeds",
  date: "2026-10-10",
  kickoff: "12:30",
  homeName: "Arsenal",
  awayName: "Leeds United",
  venue: "Emirates Stadium",
  competition: "England - Premier League",
  source: "fixtures-list",
  sourceUrl: "https://www.bbc.co.uk/sport/football/teams/arsenal/scores-fixtures",
});
assert(
  arsenalLeeds.fixtureName === "Arsenal v Leeds United" &&
    arsenalLeeds.date === "2026-10-10" &&
    arsenalLeeds.venue === "Emirates Stadium" &&
    arsenalLeeds.kickoff === "12:30",
  "Lock-in fixtures keep the published date, venue and kick-off"
);
assert(
  fixtureByIdOrName([arsenalLeeds], "Bournemouth v Arsenal") === null,
  "Invented catalog matches such as Bournemouth v Arsenal are not treated as published fixtures"
);
const details = matchDetailsLines(arsenalLeeds);
assert(
  details.date.includes("10") &&
    details.venue === "Emirates Stadium" &&
    details.kickoff === "12:30 pm",
  "See Match details formats Date, Venue and Kick-off"
);

const diageo: GoalSponsorshipNetwork = {
  brandKey: "diageo",
  brandName: "Diageo",
  email: "sm@diageo.test",
  clubNames: ["Arsenal", "Liverpool"],
  leagues: ["Premier League"],
};
const puma: GoalSponsorshipNetwork = {
  brandKey: "puma",
  brandName: "Puma",
  email: "puma@puma.test",
  clubNames: ["Arsenal"],
  leagues: ["Premier League"],
};
const cafe: GoalSponsorshipNetwork = {
  brandKey: "the stadium cafe",
  brandName: "The Stadium Cafe",
  email: "cafe@local.test",
  clubNames: ["Arsenal"],
  leagues: [],
};

const now = "2026-10-01T12:00:00.000Z";
const diageoLock: MatchDayClubLock = appendChosenMatch(null, {
  brandKey: "diageo",
  clubName: "Arsenal",
  matchLabel: "Premier League Match",
  fixtureName: "Arsenal v Chelsea",
  competition: "Premier League Match",
  lockedAt: now,
});
const afterSecond = appendChosenMatch(diageoLock, {
  brandKey: "diageo",
  clubName: "Arsenal",
  matchLabel: "Champions League Match",
  fixtureName: "Bayern Munich v Arsenal",
  competition: "Champions League Match",
  lockedAt: now,
});
assert(
  afterSecond.matches?.map((row) => row.fixtureName).join(",") ===
    "Arsenal v Chelsea,Bayern Munich v Arsenal",
  "A Lead Climate Sponsor can lock more than one Arsenal fixture"
);

const pumaLock: MatchDayClubLock = {
  brandKey: "puma",
  clubName: "Arsenal",
  matchLabel: "Premier League Match",
  fixtureName: "Arsenal v Manchester United",
  lockedAt: now,
};

const leads = leadSponsorsForClubFromStores({
  clubName: "Arsenal",
  networks: [diageo, puma, cafe],
  locks: [afterSecond, pumaLock],
  excludeBrandKeys: ["The Stadium Cafe"],
});
assert(
  leads.map((row) => row.brandName).sort().join(",") === "Diageo,Puma",
  "Arsenal Lead tab lists Diageo and Puma when they sponsor different Match Days"
);
assert(
  leads.find((row) => row.brandName === "Diageo")?.matches.includes("Arsenal v Chelsea") &&
    leads.find((row) => row.brandName === "Diageo")?.matches.includes("Bayern Munich v Arsenal"),
  "Diageo shows the Arsenal matches it chose to sponsor"
);
assert(
  leads.some((row) => row.brandName === "Puma"),
  "Puma appears on Arsenal's Lead tab for a later Match Day"
);
assert(
  !canClaimLeadClimateSponsor({
    clubName: "Arsenal",
    brandName: "Puma",
    fixtureName: "Arsenal v Chelsea",
    networks: [diageo, puma, cafe],
    locks: [afterSecond, pumaLock],
  }),
  "Puma cannot claim Arsenal v Chelsea on the same Match Day as Diageo"
);
assert(
  canClaimLeadClimateSponsor({
    clubName: "Arsenal",
    brandName: "Puma",
    fixtureName: "Arsenal v Manchester United",
    networks: [diageo, puma, cafe],
    locks: [afterSecond, pumaLock],
  }),
  "Puma can lock a later Arsenal Match Day after Diageo has this week's match"
);
assert(
  canClaimLeadClimateSponsor({
    clubName: "Arsenal",
    brandName: "Diageo",
    fixtureName: "Arsenal v Tottenham",
    networks: [diageo, puma, cafe],
    locks: [afterSecond, pumaLock],
  }),
  "The occupying Lead Climate Sponsor can still lock further Arsenal matches"
);

const fountainNetwork: GoalSponsorshipNetwork = {
  brandKey: "the fountain",
  brandName: "The Fountain",
  email: "fountain@local.test",
  clubNames: ["Arsenal"],
  leagues: [],
};
const arsenalLocals = localBusinessSponsorsForClubFromStores({
  clubName: "Arsenal",
  networks: [diageo, puma, fountainNetwork],
  locks: [afterSecond, pumaLock],
});
assert(
  arsenalLocals.map((row) => row.brandName).join(",") === "The Fountain",
  "Arsenal Local tab is The Fountain, not Puma or Diageo"
);
assert(
  !leadSponsorsForClubFromStores({
    clubName: "Arsenal",
    networks: [diageo, puma, fountainNetwork],
    locks: [afterSecond, pumaLock],
  }).some((row) => row.brandName === "The Fountain"),
  "The Fountain stays off Arsenal's Lead Climate Sponsor tab"
);

const amex: GoalSponsorshipNetwork = {
  brandKey: "american express",
  brandName: "American Express",
  email: "amex@amex.test",
  clubNames: ["Hibernian"],
  leagues: ["Scottish Premiership"],
};
const hibsLocalNetworks: GoalSponsorshipNetwork[] = [
  amex,
  {
    brandKey: "interval",
    brandName: "Interval",
    email: "interval@local.test",
    clubNames: ["Hibernian"],
    leagues: [],
  },
  {
    brandKey: "kokobean cafe",
    brandName: "Kokobean Cafe",
    email: "kokobean@local.test",
    clubNames: ["Hibernian"],
    leagues: [],
  },
  {
    brandKey: "tax assist",
    brandName: "Tax Assist",
    email: "tax@local.test",
    clubNames: ["Hibernian"],
    leagues: [],
  },
  {
    brandKey: "top cellar",
    brandName: "Top Cellar",
    email: "cellar@local.test",
    clubNames: ["Hibernian"],
    leagues: [],
  },
];
const hibsLocalLocks: MatchDayClubLock[] = [
  {
    brandKey: "american express",
    clubName: "Hibernian",
    matchLabel: "Scottish Premiership Match",
    fixtureName: "Hibernian v Hearts",
    lockedAt: now,
  },
  {
    brandKey: "interval",
    clubName: "Hibernian",
    matchLabel: "Premier League Match",
    lockedAt: now,
  },
  {
    brandKey: "kokobean cafe",
    clubName: "Hibernian",
    matchLabel: "Scottish Premiership Match",
    lockedAt: now,
  },
  {
    brandKey: "tax assist",
    clubName: "Hibernian",
    matchLabel: "Premier League Match",
    lockedAt: now,
  },
  {
    brandKey: "top cellar",
    clubName: "Hibernian",
    matchLabel: "Scottish Premiership Match",
    lockedAt: now,
  },
];
const hibsLeads = leadSponsorsForClubFromStores({
  clubName: "Hibernian",
  networks: hibsLocalNetworks,
  locks: hibsLocalLocks,
});
const hibsLocals = localBusinessSponsorsForClubFromStores({
  clubName: "Hibernian",
  networks: hibsLocalNetworks,
  locks: hibsLocalLocks,
});
assert(
  hibsLeads.map((row) => row.brandName).join(",") === "American Express",
  "Hibernian Lead Climate Sponsor is only American Express"
);

const budweiserEurope: GoalSponsorshipNetwork = {
  brandKey: "budweiser europe",
  brandName: "Budweiser Europe",
  email: "bud@bud.test",
  clubNames: ["Hibernian"],
  leagues: ["Scottish Premiership"],
};
const pumaHibs: GoalSponsorshipNetwork = {
  brandKey: "puma",
  brandName: "Puma",
  email: "puma@puma.test",
  clubNames: ["Hibernian"],
  leagues: ["Scottish Premiership"],
};
const hibsFirstLock: MatchDayClubLock = {
  brandKey: "budweiser europe",
  clubName: "Hibernian",
  matchLabel: "Scottish Premiership Match",
  fixtureName: "Hibernian v Celtic",
  lockedAt: "2026-09-01T10:00:00.000Z",
};
const hibsSecondLock: MatchDayClubLock = {
  brandKey: "puma",
  clubName: "Hibernian",
  matchLabel: "Scottish Premiership Match",
  fixtureName: "Hibernian v Celtic",
  lockedAt: "2026-10-01T10:00:00.000Z",
};
const hibsDuplicateLeads = leadSponsorsForClubFromStores({
  clubName: "Hibernian",
  networks: [budweiserEurope, pumaHibs],
  locks: [hibsFirstLock, hibsSecondLock],
});
assert(
  hibsDuplicateLeads.length === 1 &&
    hibsDuplicateLeads[0].brandName === "Puma",
  "Hibernian Our Lead Climate Sponsor never lists Budweiser Europe and Puma together"
);
assert(
  occupyingLeadClimateSponsor({
    clubName: "Hibernian",
    networks: [budweiserEurope, pumaHibs],
    locks: [hibsFirstLock, hibsSecondLock],
  })?.brandName === "Puma",
  "Budweiser is deleted from Hibernian so Puma is the Lead Climate Sponsor"
);
assert(
  !canClaimLeadClimateSponsor({
    clubName: "Hibernian",
    brandName: "Budweiser Europe",
    fixtureName: "Hibernian v Celtic",
    networks: [budweiserEurope, pumaHibs],
    locks: [hibsFirstLock, hibsSecondLock],
  }),
  "Budweiser cannot claim Hibernian as a Lead Climate Sponsor"
);
assert(
  canClaimLeadClimateSponsor({
    clubName: "Hibernian",
    brandName: "Puma",
    fixtureName: "Hibernian v Celtic",
    networks: [budweiserEurope, pumaHibs],
    locks: [hibsFirstLock, hibsSecondLock],
  }),
  "Puma remains Hibernian's Lead Climate Sponsor"
);
assert(
  leadSponsorBrandForFixture({
    clubName: "Hibernian",
    fixtureName: "Hibernian v Celtic",
    networks: [budweiserEurope, pumaHibs],
    locks: [hibsFirstLock, hibsSecondLock],
  }) === "Puma",
  "Hibernian v Celtic names Puma, not Budweiser"
);
assert(
  isSponsorBlockedFromClub("Budweiser Europe", "Hibernian") &&
    isSponsorBlockedFromClub("Budweiser", "Hibernian FC") &&
    !isSponsorBlockedFromClub("Puma", "Hibernian") &&
    !isSponsorBlockedFromClub("Budweiser Europe", "Arsenal"),
  "Budweiser is deleted from Hibernian only"
);
assert(
  /rejected/i.test(
    secondLeadClimateSponsorRejectedMessage("Hibernian", "Puma")
  ) && SECOND_LEAD_CLIMATE_SPONSOR_REJECTED.includes("one Lead Climate Sponsor"),
  "The rejection copy says only one Lead Climate Sponsor is allowed"
);
assert(
  hibsLocals
    .map((row) => row.brandName)
    .sort()
    .join(",") === "Interval,Kokobean Cafe,Tax Assist,Top Cellar",
  "Interval, Kokobean Cafe, Tax Assist and Top Cellar sit on Hibernian's Local tab"
);
assert(
  !hibsLeads.some((row) =>
    /interval|kokobean|tax assist|top cellar|fountain/i.test(row.brandName)
  ),
  "Hibernian never lists local businesses as Lead Climate Sponsors"
);
assert(
  leadSponsorsForClubFromStores({
    clubName: "Arsenal",
    networks: hibsLocalNetworks,
    locks: hibsLocalLocks,
  }).length === 0,
  "Hibernian's American Express does not appear for Arsenal"
);

const liverpool = leadSponsorsForClubFromStores({
  clubName: "Liverpool",
  networks: [diageo, puma],
  locks: [afterSecond, pumaLock],
});
assert(
  liverpool.map((row) => row.brandName).join(",") === "Diageo",
  "A Lead Climate Sponsor appears on Liverpool as soon as they opt in to sponsor the Club"
);

const heineken: GoalSponsorshipNetwork = {
  brandKey: "heineken",
  brandName: "Heineken",
  email: "heineken@heineken.test",
  clubNames: ["Kilmarnock"],
  leagues: ["Scottish Premiership"],
};
const kilmarnockLeads = leadSponsorsForClubFromStores({
  clubName: "Kilmarnock",
  networks: [heineken],
  locks: [],
});
const kilmarnockLocals = localBusinessSponsorsForClubFromStores({
  clubName: "Kilmarnock",
  networks: [heineken],
  locks: [],
});
assert(
  kilmarnockLeads.map((row) => row.brandName).join(",") === "Heineken",
  "A Lead Climate Sponsor who signs up for Kilmarnock appears on Our Lead Climate Sponsor immediately"
);
assert(
  !kilmarnockLocals.some((row) => row.brandName === "Heineken"),
  "Heineken is never listed as a Local Business Climate Sponsor"
);
assert(
  occupyingLeadBrandNames(kilmarnockLeads).length === 0,
  "Opting in to Kilmarnock does not occupy the Lead slot until Match Day sign-off"
);
const heinekenKillieLock: MatchDayClubLock = {
  brandKey: "heineken",
  clubName: "Kilmarnock",
  matchLabel: "Scottish Premiership Match",
  fixtureName: "Kilmarnock v Hearts",
  lockedAt: now,
};
assert(
  occupyingLeadBrandNames(
    leadSponsorsForClubFromStores({
      clubName: "Kilmarnock",
      networks: [heineken],
      locks: [heinekenKillieLock],
    })
  ).join(",") === "Heineken",
  "The first Lead to lock Kilmarnock v Hearts occupies the Match Day slot"
);
assert(
  canClaimLeadClimateSponsor({
    clubName: "Kilmarnock",
    brandName: "Heineken",
    fixtureName: "Kilmarnock v Hearts",
    networks: [heineken],
    locks: [heinekenKillieLock],
  }) &&
    !canClaimLeadClimateSponsor({
      clubName: "Kilmarnock",
      brandName: "Pepsi Cola",
      fixtureName: "Kilmarnock v Hearts",
      networks: [heineken],
      locks: [heinekenKillieLock],
    }) &&
    canClaimLeadClimateSponsor({
      clubName: "Kilmarnock",
      brandName: "Pepsi Cola",
      fixtureName: "Kilmarnock v Celtic",
      networks: [heineken],
      locks: [heinekenKillieLock],
    }),
  "Heineken's Kilmarnock v Hearts sign-off locks out other Leads for that Match Day only"
);

const local: LocalSponsorRecord = {
  brandName: "The Stadium Cafe",
  email: "cafe@local.test",
  clubName: "Arsenal",
  pledgeGbp: 1250,
  createdAt: now,
  submittedAt: now,
  source: "registered",
  matchSponsorships: [
    { fixtureName: "Arsenal v Chelsea", amountGbp: 750 },
    { fixtureName: "Arsenal v Manchester United", amountGbp: 500 },
  ],
};
assert(isSubmittedLocalSponsor(local), "Submitted local sponsorships appear for the SD");
assert(
  isClubInboundLocalSponsor(local),
  "Legacy submitted locals still appear on the club page"
);
assert(
  !isSignedOffLocalSponsor(local) &&
    !isClubInboundLocalSponsor({
      ...local,
      submittedAt: undefined,
    }),
  "A local without sign-off or SUBMIT does not appear on the club page"
);
assert(
  isSignedOffLocalSponsor({
    ...local,
    acceptedTerms: true,
    signerName: "Jamie",
    signedAt: now,
  }) &&
    isClubInboundLocalSponsor({
      ...local,
      acceptedTerms: true,
      signerName: "Jamie",
      signedAt: now,
    }),
  "Signed-off locals appear on the club Our Climate Sponsors list"
);
assert(
  !isClubInboundLocalSponsor({
    ...local,
    source: "uploaded",
    acceptedTerms: true,
    signerName: "Jamie",
    signedAt: now,
  }),
  "Club-uploaded attach-board logos never appear as inbound Local Business Climate Sponsors"
);
assert(
  localMatchLabels(local).join(",") ===
    "Arsenal v Chelsea,Arsenal v Manchester United",
  "Local tab lists the matches the business chose"
);
assert(
  totalLocalPledge(local) === 1250,
  "Local tab totals the submitted Match Day amounts"
);
assert(
  LOCAL_SPONSOR_MIN_GBP === 500,
  "Local match amounts still start from £500"
);

const fountain: LocalSponsorRecord = {
  brandName: "The Fountain",
  email: "fountain@local.test",
  clubName: "Arsenal",
  pledgeGbp: 1550,
  createdAt: now,
  submittedAt: now,
  source: "registered",
  matchSponsorships: [
    { fixtureName: "Arsenal v Leeds United", amountGbp: 800 },
  ],
};
assert(
  totalLocalPledge(fountain) === 800,
  "The Fountain's agreed Arsenal v Leeds United amount is £800, not a later wallet total"
);

const example: LocalSponsorRecord = {
  brandName: "Braidview Garage",
  email: "",
  clubName: "Arsenal",
  pledgeGbp: 1500,
  createdAt: now,
  source: "example",
};
assert(
  !isSubmittedLocalSponsor(example),
  "Example local brands do not appear as submitted Local Business Climate Sponsors"
);

assert(
  sameNamedFixture("Bournemouth v Arsenal", "Arsenal vs Bournemouth"),
  "Home and away reversed still count as the same fixture"
);

const pumaDatedLock: MatchDayClubLock = {
  brandKey: "puma",
  clubName: "Arsenal",
  matchLabel: "Premier League Match",
  fixtureName: "Arsenal v Everton",
  fixtureDate: "2026-10-18",
  kickoff: "17:30",
  lockedAt: now,
  matches: [
    {
      clubName: "Arsenal",
      fixtureName: "Bournemouth v Arsenal",
      fixtureDate: "2026-10-03",
      kickoff: "15:00",
      lockedAt: now,
    },
    {
      clubName: "Arsenal",
      fixtureName: "Arsenal v Everton",
      fixtureDate: "2026-10-18",
      kickoff: "17:30",
      lockedAt: now,
    },
  ],
};
assert(
  chosenMatchesForClub(pumaDatedLock, "Arsenal")
    .map((row) => row.fixtureName)
    .join(",") === "Bournemouth v Arsenal,Arsenal v Everton",
  "Puma's Arsenal matches are listed in chronological order"
);
assert(
  nextSignedOffFixtureForClub({
    clubName: "Arsenal",
    signedOff: chosenMatchesForClub(pumaDatedLock, "Arsenal"),
    now: "2026-10-02T09:00:00.000Z",
  })?.fixtureName === "Bournemouth v Arsenal",
  "My S4P uses the next signed-off Arsenal fixture, not a stale Arsenal v Chelsea campaign"
);
assert(
  campaignHeadline("Bournemouth v Arsenal") ===
    "Bournemouth v Arsenal Climate Campaign",
  "The My S4P headline is the next signed-off fixture plus Climate Campaign"
);

const publishedArsenal = [
  clubFixtureFromUpcoming({
    id: "list-arsenal-leeds",
    date: "2026-10-04",
    kickoff: "14:00",
    homeName: "Arsenal",
    awayName: "Leeds United",
    venue: "Emirates Stadium",
    competition: "England - Premier League",
    source: "fixtures-list",
    sourceUrl: "https://www.bbc.co.uk/sport/football/teams/arsenal/scores-fixtures",
  }),
  clubFixtureFromUpcoming({
    id: "list-bournemouth-arsenal",
    date: "2026-10-10",
    kickoff: "15:00",
    homeName: "Bournemouth",
    awayName: "Arsenal",
    venue: "Vitality Stadium",
    competition: "England - Premier League",
    source: "fixtures-list",
    sourceUrl: "https://www.bbc.co.uk/sport/football/teams/arsenal/scores-fixtures",
  }),
  clubFixtureFromUpcoming({
    id: "list-arsenal-everton",
    date: "2026-10-18",
    kickoff: "17:30",
    homeName: "Arsenal",
    awayName: "Everton",
    venue: "Emirates Stadium",
    competition: "England - Premier League",
    source: "fixtures-list",
    sourceUrl: "https://www.bbc.co.uk/sport/football/teams/arsenal/scores-fixtures",
  }),
];
assert(
  nextFanMatchForClub({
    clubName: "Arsenal",
    signedOff: chosenMatchesForClub(pumaDatedLock, "Arsenal"),
    published: publishedArsenal,
    now: "2026-10-02T09:00:00.000Z",
  })?.fixtureName === "Arsenal v Leeds United",
  "Fans see Arsenal's next published fixture, not a stale Arsenal v Chelsea campaign"
);
assert(
  nextFanMatchForClub({
    clubName: "Arsenal",
    signedOff: [
      {
        clubName: "Arsenal",
        fixtureName: "Arsenal v Leeds United",
        fixtureDate: "2026-10-04",
        kickoff: "14:00",
        lockedAt: now,
      },
    ],
    published: publishedArsenal,
    now: "2026-10-02T09:00:00.000Z",
  })?.fixtureName === "Arsenal v Leeds United",
  "When Leeds United is Arsenal's next fixture and a Lead Climate Sponsor signs it off, that is the My S4P headline"
);

const pumaLeedsLock: MatchDayClubLock = {
  brandKey: "puma",
  clubName: "Arsenal",
  matchLabel: "Premier League Match",
  fixtureName: "Arsenal v Leeds United",
  fixtureDate: "2026-10-10",
  kickoff: "12:30",
  lockedAt: now,
};
assert(
  leadSponsorBrandForFixture({
    clubName: "Arsenal",
    fixtureName: "Arsenal v Leeds United Climate Campaign",
    locks: [pumaLeedsLock, pumaDatedLock],
    networks: [puma, diageo],
  }) === "Puma",
  "Arsenal v Leeds United uses Puma, the Lead Climate Sponsor who signed that match"
);
assert(
  leadSponsorBrandForFixture({
    clubName: "Arsenal",
    fixtureName: "Arsenal v Everton",
    locks: [pumaLeedsLock, pumaDatedLock],
    networks: [puma, diageo],
  }) === "Puma",
  "Arsenal v Everton still names Puma"
);
assert(
  leadSponsorBrandForFixture({
    clubName: "Arsenal",
    fixtureName: "Arsenal v Chelsea",
    locks: [pumaLeedsLock, pumaDatedLock],
    networks: [puma, diageo],
  }) == null,
  "Arsenal v Chelsea has no Lead Climate Sponsor until a brand locks that Match Day"
);

const amexHeartsAberdeen: MatchDayClubLock = {
  brandKey: "american express",
  clubName: "Hearts",
  matchLabel: "Scottish Premiership Match",
  fixtureName: "Hearts v Aberdeen",
  fixtureDate: "2026-10-31",
  lockedAt: now,
};
const pumaHeartsRangers: MatchDayClubLock = {
  brandKey: "puma",
  clubName: "Hearts",
  matchLabel: "Scottish Premiership Match",
  fixtureName: "Hearts v Rangers",
  fixtureDate: "2026-11-07",
  lockedAt: now,
};
const pumaHeartsHibs: MatchDayClubLock = {
  brandKey: "puma",
  clubName: "Hearts",
  matchLabel: "Scottish Premiership Match",
  fixtureName: "Hearts v Hibernian",
  fixtureDate: "2026-11-14",
  lockedAt: now,
};
const pumaHibsHearts: MatchDayClubLock = {
  brandKey: "puma",
  clubName: "Hibernian",
  matchLabel: "Scottish Premiership Match",
  fixtureName: "Hearts v Hibernian",
  fixtureDate: "2026-11-14",
  lockedAt: now,
  matches: [
    {
      clubName: "Hearts",
      fixtureName: "Hearts v Hibernian",
      fixtureDate: "2026-11-14",
      lockedAt: now,
    },
    {
      clubName: "Hibernian",
      fixtureName: "Hearts v Hibernian",
      fixtureDate: "2026-11-14",
      lockedAt: now,
    },
  ],
};
assert(
  canClaimLeadClimateSponsor({
    clubName: "Hearts",
    brandName: "Puma",
    fixtureName: "Hearts v Rangers",
    networks: [],
    locks: [amexHeartsAberdeen],
  }),
  "Puma can sponsor a later Hearts Match after American Express locked Hearts v Aberdeen"
);
assert(
  !canClaimLeadClimateSponsor({
    clubName: "Hearts",
    brandName: "Puma",
    fixtureName: "Hearts v Aberdeen",
    networks: [],
    locks: [amexHeartsAberdeen],
  }),
  "Puma cannot sponsor Hearts v Aberdeen on the same Match Day as American Express"
);
assert(
  brandsMatch(
    occupyingLeadClimateSponsorForMatch({
      clubName: "Hearts",
      fixtureName: "Hearts v Aberdeen",
      networks: [],
      locks: [amexHeartsAberdeen, pumaHeartsRangers],
    })?.brandName ?? "",
    "American Express"
  ) &&
    brandsMatch(
      occupyingLeadClimateSponsorForMatch({
        clubName: "Hearts",
        fixtureName: "Hearts v Rangers",
        networks: [],
        locks: [amexHeartsAberdeen, pumaHeartsRangers],
      })?.brandName ?? "",
      "Puma"
    ),
  "Hearts Lead occupancy is per Match Day, not for the whole season"
);
assert(
  canClaimLeadClimateSponsor({
    clubName: "Hibernian",
    brandName: "Puma",
    fixtureName: "Hearts v Hibernian",
    networks: [],
    locks: [pumaHeartsHibs],
  }) &&
    brandsMatch(
      occupyingLeadClimateSponsorForMatch({
        clubName: "Hearts",
        fixtureName: "Hibernian v Hearts",
        networks: [],
        locks: [pumaHibsHearts],
      })?.brandName ?? "",
      "Puma"
    ) &&
    brandsMatch(
      occupyingLeadClimateSponsorForMatch({
        clubName: "Hibernian",
        fixtureName: "Hearts v Hibernian",
        networks: [],
        locks: [pumaHibsHearts],
      })?.brandName ?? "",
      "Puma"
    ),
  "Puma can be Lead for Hearts goals and, after a second login, Lead for Hibernian goals in the same fixture"
);
assert(
  !offerMatchesLockedMatch(
    {
      clubName: "Hearts of Midlothian",
      matchTitle: "Hearts of Midlothian FC Match",
      matchDate: "2026-09-25",
    },
    amexHeartsAberdeen
  ) &&
    offerMatchesLockedMatch(
      {
        clubName: "Hearts of Midlothian",
        matchTitle: "Hearts v Aberdeen",
        matchDate: "2026-10-31",
      },
      amexHeartsAberdeen
    ),
  "Sign-off never reuses a leftover Hearts offer from another Match Day"
);
assert(
  readFileSync("app/components/fan/FanGoalAlertBanner.tsx", "utf8").includes(
    "leadSponsorBrandForFixture"
  ) &&
    readFileSync("app/components/fan/FanGoalAlertBanner.tsx", "utf8").includes(
      "resolveVisibleFanGoalAlert"
    ),
  "The GOAL banner on My S4P uses the Lead Climate Sponsor of the current match"
);

const nextFixtures = readFileSync("app/services/next-fixtures.service.ts", "utf8");
assert(
  nextFixtures.includes("getPublishedFixturesForClub") &&
    !readFileSync("app/lib/club-fixtures.ts", "utf8").includes("FEATURED_FIXTURES"),
  "Lock-in uses published fixtures instead of a generated catalog"
);
assert(
  readFileSync("app/api/sponsor/club-fixtures/route.ts", "utf8").includes(
    "getPublishedFixturesForClub"
  ),
  "Sponsors load club fixtures from the published fixtures API"
);
assert(
  readFileSync("app/services/next-fixtures.service.ts", "utf8").includes(
    "withDemoUpcomingFixtures"
  ) &&
    !readFileSync("app/components/sponsor/MatchSponsorshipPicker.tsx", "utf8").includes(
      "DEMO_CLUB_NAMES"
    ) &&
    !readFileSync("app/components/sponsor/MatchSponsorshipPicker.tsx", "utf8").includes(
      "demoFixturesForClub"
    ) &&
    readFileSync("app/components/sponsor/MatchSponsorshipPicker.tsx", "utf8").includes(
      "calendarFixturesForClub"
    ) &&
    readFileSync("app/components/sponsor/MatchSponsorshipPicker.tsx", "utf8").includes(
      'id="fixture-lists"'
    ) &&
    readFileSync("app/components/sponsor/MatchSponsorshipPicker.tsx", "utf8").includes(
      "Choose any club on the Sporting Calendar first"
    ) &&
    !readFileSync("app/sponsor/local/register/page.tsx", "utf8").includes(
      "Fixture lists"
    ) &&
    readFileSync("app/services/club-fixtures.service.ts", "utf8").includes(
      "withDemoClubFixtures"
    ),
  "Local register waits for a Sporting Calendar club instead of painting the three demo fixture lists"
);
assert(
  !readFileSync("app/components/sponsor/MatchSponsorshipPicker.tsx", "utf8").includes(
    "bg-black/"
  ) &&
    !readFileSync("app/components/sponsor/MatchSponsorshipPicker.tsx", "utf8").includes(
      "bg-emerald-950"
    ) &&
    readFileSync("app/components/sponsor/MatchSponsorshipPicker.tsx", "utf8").includes(
      "bg-slate-900"
    ),
  "Fixture list cards sit on paper, not dark overlays"
);
assert(
  demoFixturesForClub("Arsenal").length >= 5 &&
    demoFixturesForClub("Hearts").length >= 5 &&
    demoFixturesForClub("Hibernian").length >= 5 &&
    demoFixturesForClub("Hearts of Midlothian").some((row) =>
      row.fixtureName.includes("Hibernian")
    ) &&
    demoFixturesForClub("Hibernian").some((row) =>
      row.fixtureName.includes("Hearts")
    ) &&
    demoFixturesForClub("Arsenal").some((row) =>
      row.fixtureName.includes("Leeds United")
    ),
  "Arsenal, Hearts and Hibernian each have a named upcoming fixture list"
);
assert(
  withDemoClubFixtures("Hibernian", []).map((row) => row.fixtureName).join(",") ===
    demoFixturesForClub("Hibernian").map((row) => row.fixtureName).join(","),
  "An empty live feed still shows the Hibernian fixture list"
);

const dashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(
  dashboard.includes("splitClubClimateSponsorsForTabs") &&
    dashboard.includes("leadClimateSponsorsForClub") &&
    dashboard.includes("localBusinessClimateSponsorsForClub") &&
    dashboard.slice(dashboard.indexOf("refreshSignedLive")).includes(
      "leadClimateSponsorsForClub"
    ) &&
    dashboard.includes("approvedBrandNames") &&
    dashboard.includes("clubDashboardLeadTabCount") &&
    dashboard.includes("leadTabCount") &&
    dashboard.includes("clubDashboardLookbackCopy") &&
    dashboard.includes("MATCH_DAY_FULLY_FUNDED_LABEL") &&
    dashboard.includes("lookbackProjectFunding"),
  "Club dashboard splits inbound brands so local businesses never stay on the Lead tab, and refreshes that Lead list after sign-off"
);
const preview = readFileSync("app/preview/club-sponsors/page.tsx", "utf8");
assert(
  preview.includes("leadClimateSponsorsForClub") &&
    preview.includes("localBusinessClimateSponsorsForClub") &&
    preview.includes(
      "A second Lead Climate Sponsor on the same Hibernian Match Day must be rejected"
    ) &&
    preview.includes("Heineken") &&
    preview.includes("Kilmarnock") &&
    preview.includes("approvedBrandNames") &&
    preview.includes("leadTabCount={1}") &&
    preview.includes("clubDashboardLookbackCopy") &&
    preview.includes("MATCH_DAY_FULLY_FUNDED_LABEL"),
  "The club-sponsors preview uses the same inbound Lead and Local lists as the dashboard"
);

const tabs = readFileSync("app/components/club/ClubClimateSponsorTabs.tsx", "utf8");
assert(
  tabs.includes("Our Lead Climate Sponsor") &&
    tabs.includes("Our Local Businesses Sponsor") &&
    tabs.includes("Local Businesses Climate Sponsors") &&
    tabs.includes("CLUB_DASHBOARD_SPONSORS_INTRO") &&
    tabs.includes(
      "Interested Lead Climate Sponsors & Local Business Climate Sponsors who signed up to sponsor your Club will automatically appear here. Only one Lead Climate Sponsor is allowed on each Match Day. Four Local Business Climate Sponsors are accepted each Match Day."
    ) &&
    !tabs.includes("Any second Lead Climate") &&
    !tabs.includes("head-to-head Match") &&
    !tabs.includes("A different Lead can sponsor a later") &&
    !tabs.includes("When a Lead Climate Sponsor registers") &&
    !tabs.includes("Local businesses never") &&
    tabs.includes("Signed off by") &&
    tabs.includes("splitClubClimateSponsorsForTabs") &&
    tabs.includes("approvedBrandNames") &&
    tabs.includes("leadTabCount") &&
    tabs.includes("isSignedOffLocalSponsor") &&
    tabs.includes('setTab("lead")') &&
    tabs.includes("aria-pressed") &&
    tabs.includes("s4pTabClass") &&
    !tabs.includes("border-slate-600 bg-slate-950") &&
    !tabs.includes("bg-amber-400"),
  "The two tabs are Our Lead Climate Sponsor and Our Local Businesses Sponsor, in S4P green"
);
assert(
  readFileSync("app/club/projects/select/page.tsx", "utf8").includes(
    "FeaturedGssPicker"
  ) &&
    readFileSync("app/components/club/FeaturedGssPicker.tsx", "utf8").includes(
      "There can never be two Featured projects"
    ) &&
    readFileSync("app/preview/featured-gss/page.tsx", "utf8").includes(
      "FeaturedGssPicker"
    ),
  "Climate Projects force a choice of one Featured GSS"
);
assert(
  !dashboard.includes("MatchDayLocalSponsorBoard") &&
    !dashboard.includes("Attach registered local logos"),
  "Club dashboard lists locals once under Our Climate Sponsors, not again on an attach-logos board"
);

const votesService = readFileSync("app/services/votes.service.ts", "utf8");
assert(
  votesService.includes("nextFanMatchForClub") &&
    votesService.includes("applyNextFanMatchHeadline"),
  "My S4P replaces a stale campaign title with the next signed-off fixture"
);
assert(
  readFileSync("app/components/fan/FanCampaignWorkspace.tsx", "utf8").includes(
    "campaignHeadline(campaign.matchTitle)"
  ),
  "My S4P prints the resolved fixture as the Climate Campaign headline"
);

const sponsorDash = readFileSync("app/sponsor/dashboard/page.tsx", "utf8");
assert(
  sponsorDash.includes("MatchDayLockIn") &&
    readFileSync("app/components/sponsor/MatchDayLockIn.tsx", "utf8").includes(
      "SeeMatchDetails"
    ) &&
    readFileSync("app/components/sponsor/ClubMatchCalendar.tsx", "utf8").includes(
      "Select the Match"
    ),
  "Lead Climate Sponsors pick a published fixture and can See Match details"
);

const localPage = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
assert(
  localPage.includes("MatchSponsorshipPicker") &&
    localPage.includes("Sign & SUBMIT") &&
    localPage.includes("matchSponsorships") &&
    localPage.includes("LOCAL_SPONSOR_TERMS") &&
    localPage.includes("acceptedTerms") &&
    localPage.includes("signerName") &&
    localPage.includes("BrandLogoField") &&
    localPage.includes("signedAt"),
  "Local Business Climate Sponsors can upload a logo, agree T&Cs, sign off, then SUBMIT"
);
assert(
  preview.includes("SEEDED_ARSENAL_LOCALS") &&
    preview.includes("Piazza Italiana") &&
    preview.includes("signerName: \"Jamie\"") &&
    preview.includes('initialTab="local"'),
  "The club-sponsors preview shows signed-off locals once, on the Local tab"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Club dashboard Lead and Local Business Climate Sponsor tabs list opted-in brands and named fixtures."
);
