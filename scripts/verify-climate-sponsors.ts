import {
  MATCH_DAY_PROJECT_COUNT,
} from "../app/lib/partner-projects";
import {
  acceptInviteIntoNetwork,
  addLeagueToNetwork,
  brandInitials,
  brandsMatch,
  emptySponsor,
  lockCopy,
  networkHasClub,
  offersForLockedSponsor,
  rankSponsorsBySpend,
  selectedBrandsReadyToReceive,
  selectedSponsors,
  sponsorCanReceiveClubPost,
  toggleSelectedSponsor,
  topClimateSponsors,
  upsertSponsor,
  unlockedMatchDay,
  replaceLockedClub,
  type ClubSponsorRoster,
  type GoalSponsorshipNetwork,
} from "../app/lib/climate-sponsors";
import { CURRENT_SEASON_LEAGUES } from "../app/lib/current-season";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(brandsMatch("Diageo", "diageo"), "Brand names match case-insensitively");
assert(brandInitials("Budweiser") === "BU", "Single-word brands use two-letter initials");
assert(brandInitials("Carbon Warriors Limited") === "CW", "Two-word brands use first letters");

const ranked = rankSponsorsBySpend([
  emptySponsor({ id: "b", brandName: "Budweiser", spentGbp: 8000 }),
  emptySponsor({ id: "g", brandName: "Gillette", spentGbp: 25000 }),
  emptySponsor({ id: "p", brandName: "Puma", spentGbp: 12000 }),
  emptySponsor({ id: "d", brandName: "Diageo", spentGbp: 40000 }),
  emptySponsor({ id: "z", brandName: "Zero Spend", spentGbp: 0 }),
]);
assert(ranked[0].brandName === "Diageo", "Highest climate-project spend ranks first");
assert(
  topClimateSponsors(ranked).map((row) => row.brandName).join(",") ===
    "Diageo,Gillette,Puma",
  "Top 3 website sponsors skip zero-spend brands"
);

let roster: ClubSponsorRoster = {
  clubId: "hibs",
  clubName: "Hibernian",
  sponsors: [],
  selectedIds: [],
};
roster = upsertSponsor(
  roster,
  emptySponsor({ id: "d", brandName: "Diageo", email: "sm@diageo.test" })
);
roster = upsertSponsor(
  roster,
  emptySponsor({ id: "g", brandName: "Gillette" })
);
roster = toggleSelectedSponsor(roster, "d");
assert(roster.selectedIds.includes("d"), "SD can select Diageo before posting");
assert(!roster.selectedIds.includes("g"), "Unselected brands are not posting targets");
assert(
  selectedSponsors(roster).map((row) => row.brandName).join(",") === "Diageo",
  "Posted five target the brands the SD selected, even before lock-in"
);

const diageo: GoalSponsorshipNetwork = {
  brandKey: "diageo",
  brandName: "Diageo",
  email: "sm@diageo.test",
  clubNames: ["Arsenal"],
  leagues: [],
};
assert(
  networkHasClub(diageo, "Arsenal FC"),
  "Registration club Arsenal matches Arsenal FC"
);
assert(
  !networkHasClub(diageo, "Hibernian"),
  "Diageo does not receive Hibernian posts until invited"
);

const afterInvite = acceptInviteIntoNetwork(
  diageo,
  {
    id: "inv",
    fromClubId: "hibs",
    fromClubName: "Hibernian",
    fromDirectorName: "Hibernian Davies",
    toBrandName: "Diageo",
    toEmail: "sm@diageo.test",
    message: "Please add Hibernian FC to your Goal Sponsorship Network.",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  true
);
assert(networkHasClub(afterInvite, "Hibernian"), "Accepting the invite adds Hibernian");
assert(
  CURRENT_SEASON_LEAGUES["Scottish Premiership"].every((club) =>
    networkHasClub(afterInvite, club)
  ),
  "Accepting with the league option adds every Scottish Premiership club"
);

const leagueNet = addLeagueToNetwork(
  {
    brandKey: "puma",
    brandName: "Puma",
    email: null,
    clubNames: [],
    leagues: [],
  },
  "Premier League"
);
assert(
  networkHasClub(leagueNet, "Manchester City"),
  "A Premier League network includes Manchester City"
);

assert(
  !sponsorCanReceiveClubPost({
    network: afterInvite,
    lock: null,
    clubName: "Hibernian",
    brandName: "Diageo",
  }),
  "Without a match-day lock the sponsor does not receive posted projects"
);
assert(
  sponsorCanReceiveClubPost({
    network: afterInvite,
    lock: {
      brandKey: "diageo",
      clubName: "Hibernian",
      matchLabel: "Scottish Premiership Match",
      lockedAt: new Date().toISOString(),
    },
    clubName: "Hibernian",
    brandName: "Diageo",
    targetBrandNames: ["Diageo", "Gillette"],
  }),
  "Locked-in Diageo receives Hibernian posts the SD selected"
);
assert(
  !sponsorCanReceiveClubPost({
    network: afterInvite,
    lock: {
      brandKey: "diageo",
      clubName: "Hibernian",
      matchLabel: "Scottish Premiership Match",
      lockedAt: new Date().toISOString(),
    },
    clubName: "Arsenal",
    brandName: "Diageo",
    targetBrandNames: ["Diageo"],
  }),
  "A Hibernian lock blocks Arsenal posted climate projects"
);

const visible = offersForLockedSponsor(
  [
    { clubName: "Hibernian", targetBrandNames: ["Diageo"] },
    { clubName: "Arsenal", targetBrandNames: ["Diageo"] },
    { clubName: "Celtic", targetBrandNames: ["Diageo"] },
  ],
  {
    brandName: "Diageo",
    network: afterInvite,
    lock: {
      brandKey: "diageo",
      clubName: "Hibernian",
      matchLabel: "Scottish Premiership Match",
      lockedAt: new Date().toISOString(),
    },
  }
);
assert(
  visible.length === 1 && visible[0].clubName === "Hibernian",
  "Locked sponsor dashboards only show the locked club's posted five"
);

const ready = selectedBrandsReadyToReceive(
  {
    clubId: "ars",
    clubName: "Arsenal",
    selectedIds: ["d", "g", "b"],
    sponsors: [
      emptySponsor({ id: "d", brandName: "Diageo" }),
      emptySponsor({ id: "g", brandName: "Gillette" }),
      emptySponsor({ id: "b", brandName: "Budweiser" }),
    ],
  },
  {
    networkFor: (brand) =>
      brand === "Budweiser"
        ? null
        : {
            brandKey: brand.toLowerCase(),
            brandName: brand,
            email: null,
            clubNames: ["Arsenal"],
            leagues: ["Premier League"],
          },
    lockFor: (brand) =>
      brand === "Gillette"
        ? {
            brandKey: "gillette",
            clubName: "Chelsea",
            matchLabel: "Premier League Match",
            lockedAt: new Date().toISOString(),
          }
        : brand === "Diageo"
          ? {
              brandKey: "diageo",
              clubName: "Arsenal",
              matchLabel: "Premier League Match",
              lockedAt: new Date().toISOString(),
            }
          : null,
  }
);
assert(
  ready.map((row) => row.brandName).join(",") === "Diageo",
  "Posting an Arsenal v Man City five only delivers to selected brands that locked Arsenal"
);

const postedThenLocked = offersForLockedSponsor(
  [{ clubName: "Hibernian", targetBrandNames: ["Diageo", "Gillette", "Budweiser", "Puma"] }],
  {
    brandName: "Diageo",
    network: afterInvite,
    lock: null,
  }
);
assert(
  postedThenLocked.length === 0,
  "Selected brands do not see the posted five until they lock the club"
);
assert(
  offersForLockedSponsor(
    [{ clubName: "Hibernian", targetBrandNames: ["Diageo", "Gillette", "Budweiser", "Puma"] }],
    {
      brandName: "Diageo",
      network: afterInvite,
      lock: {
        brandKey: "diageo",
        clubName: "Hibernian",
        matchLabel: "Scottish Premiership Match",
        lockedAt: new Date().toISOString(),
      },
    }
  ).length === 1,
  "After lock-in, Diageo sees the five Hibernian posted to Diageo, Gillette, Budweiser and Puma"
);
assert(
  offersForLockedSponsor(
    [{ clubName: "Hibernian", targetBrandNames: ["Diageo", "Gillette", "Budweiser", "Puma"] }],
    {
      brandName: "Nike",
      network: {
        brandKey: "nike",
        brandName: "Nike",
        email: null,
        clubNames: ["Hibernian"],
        leagues: ["Scottish Premiership"],
      },
      lock: {
        brandKey: "nike",
        clubName: "Hibernian",
        matchLabel: "Scottish Premiership Match",
        lockedAt: new Date().toISOString(),
      },
    }
  ).length === 0,
  "A locked brand that was not selected does not receive the posted five"
);

const afterUnlock = unlockedMatchDay("Premier League Match");
assert(afterUnlock.clubName === "", "Unlock clears the club from the lock box");
assert(
  afterUnlock.matchLabel === "Premier League Match",
  "Unlock keeps the Match dropdown ready on the right"
);
assert(
  replaceLockedClub(afterUnlock.matchLabel, "Rangers").clubName === "Rangers",
  "Selecting Rangers replaces the cleared club in the lock box"
);
assert(
  replaceLockedClub("Champions League Match", "Rangers").matchLabel ===
    "Champions League Match",
  "The right-hand Match dropdown can switch to Champions League"
);

assert(
  MATCH_DAY_PROJECT_COUNT === 5,
  "Posted portfolio remains five climate projects"
);
assert(
  lockCopy().includes("72 hours"),
  "Sponsorship Managers are told to lock a club 72 hours before kick-off"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Our Climate Sponsors network, ranking and match-day lock-in passed.");
