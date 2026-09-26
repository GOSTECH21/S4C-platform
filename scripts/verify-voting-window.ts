import { readFileSync } from "fs";
import {
  VOTING_CLOSES_DAYS_AFTER_KICKOFF,
  VOTING_OPENS_DAYS_BEFORE_KICKOFF,
  VOTING_PERIOD_DAYS,
  clubVotingWindowCopy,
  fanVotingWindowCopy,
  isVotingOpen,
  parseFixtureKickoff,
  resolveVotingWindow,
  votingPhase,
  votingWindowForKickoff,
} from "../app/lib/voting-window";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(VOTING_PERIOD_DAYS === 5, "Voting lasts 5 days");
assert(VOTING_OPENS_DAYS_BEFORE_KICKOFF === 3, "Voting opens 3 days before kick-off");
assert(VOTING_CLOSES_DAYS_AFTER_KICKOFF === 2, "Voting closes 2 days after kick-off");

const saturdayKickoff = new Date("2026-09-26T15:00:00.000Z");
assert(saturdayKickoff.getUTCDay() === 6, "Example kick-off is Saturday");
const window = votingWindowForKickoff(saturdayKickoff);
assert(
  window.opensAt.toISOString() === "2026-09-23T15:00:00.000Z" &&
    window.opensAt.getUTCDay() === 3,
  "Saturday 15:00 kick-off opens voting Wednesday at 15:00"
);
assert(
  window.closesAt.toISOString() === "2026-09-28T15:00:00.000Z" &&
    window.closesAt.getUTCDay() === 1,
  "Saturday 15:00 kick-off closes voting Monday at 15:00"
);
assert(
  (window.closesAt.getTime() - window.opensAt.getTime()) / (24 * 60 * 60 * 1000) ===
    5,
  "The voting period is exactly 5 days"
);
assert(
  votingPhase(window, new Date("2026-09-23T14:59:00.000Z")) === "upcoming",
  "Voting is not open before Wednesday 15:00"
);
assert(
  isVotingOpen(window, new Date("2026-09-23T15:00:00.000Z")),
  "Voting opens at Wednesday 15:00"
);
assert(
  isVotingOpen(window, new Date("2026-09-26T15:00:00.000Z")),
  "Voting stays open through kick-off"
);
assert(
  isVotingOpen(window, new Date("2026-09-28T15:00:00.000Z")),
  "Voting is still open at Monday 15:00"
);
assert(
  votingPhase(window, new Date("2026-09-28T15:00:01.000Z")) === "closed",
  "Voting has closed just after Monday 15:00"
);

assert(
  parseFixtureKickoff({
    fixture_date: "2026-09-26",
    kickoff_time: "15:00",
  })?.toISOString() === new Date("2026-09-26T15:00:00").toISOString(),
  "Fixture date and 15:00 kick-off parse to a Saturday 15:00 kick-off"
);

const migrated = resolveVotingWindow({
  opensAt: new Date("2026-09-23T15:00:00.000Z"),
  closesAt: new Date("2026-09-26T13:00:00.000Z"),
});
assert(
  migrated.closesAt.toISOString() === "2026-09-28T15:00:00.000Z",
  "A stored 72-hour window is extended to the 5-day close"
);

assert(
  fanVotingWindowCopy().includes("Wednesday at 15:00") &&
    fanVotingWindowCopy().includes("Monday at 15:00"),
  "Fan copy uses the Saturday 15:00 example"
);
assert(
  clubVotingWindowCopy(4).includes("5 days") &&
    clubVotingWindowCopy(4).includes("3 days before kick-off"),
  "Club copy tells the SD to post 3 days before kick-off for a 5-day vote"
);
assert(
  !readFileSync("app/supporter/dashboard/page.tsx", "utf8").includes(
    "72-hour voting window"
  ) &&
    !readFileSync("app/supporter/dashboard/page.tsx", "utf8").includes(
      "brand-exposure counter"
    ) &&
    !readFileSync("app/supporter/dashboard/page.tsx", "utf8").includes(
      "Lead Climate Sponsor pays"
    ),
  "My S4P no longer shows the Lead Climate Sponsor payment and exposure copy"
);
assert(
  readFileSync("app/dashboard/supporter/vote/page.tsx", "utf8").includes(
    "fanVotingWindowCopy"
  ),
  "Climate Projects explains the 5-day voting window"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Voting opens 3 days before kick-off and closes 2 days after, for 5 days."
);
