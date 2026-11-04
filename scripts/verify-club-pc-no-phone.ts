import { readFileSync } from "fs";
import { howS4pSelectMatchCopy } from "../app/lib/how-s4p-works";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const frame = readFileSync("app/components/home/PhoneFrame.tsx", "utf8");
const fixtures = readFileSync(
  "app/components/home/SelectMatchFixtures.tsx",
  "utf8"
);
const select = readFileSync(
  "app/components/home/HowS4pSelectMatch.tsx",
  "utf8"
);
const preview = readFileSync(
  "app/preview/club-select-match/page.tsx",
  "utf8"
);
const overlay = readFileSync("apply-club-pc-no-phone.mjs", "utf8");
const clubCopy = howS4pSelectMatchCopy("club");

assert(
  frame.includes("framed = true") &&
    frame.includes("data-phone-unframed") &&
    frame.includes("UNFRAMED_SCREEN_CLASS") &&
    frame.includes("CLUB_FIXTURE_COLUMN_CLASS") &&
    frame.includes("data-phone-frame"),
  "PhoneFrame can drop the handset and keep a static fixture card"
);
assert(
  fixtures.includes('framed={mode !== "club"}') &&
    fixtures.includes("club-pc-no-phone-frame-v1") &&
    fixtures.includes("data-select-this-match") &&
    fixtures.includes("sm:text-base md:text-lg") &&
    fixtures.includes("max-md:h-[28rem]") &&
    fixtures.includes("are in this list.") &&
    fixtures.includes("are on the phone.") &&
    !fixtures.includes('className="mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[10px]'),
  "Club Select Match drops the phone bezel and enlarges Select this Match"
);
assert(
  select.includes("CLUB_FIXTURE_COLUMN_CLASS") &&
    select.includes("PHONE_COLUMN_CLASS") &&
    select.includes("club-pc-no-phone-frame-v1") &&
    select.includes('audience === "club"'),
  "Club Select Match uses a wider unframed column; fan/sponsor keep the handset"
);
assert(
  clubCopy.title === "Select the Match" &&
    clubCopy.caption.includes("fixtures are in this list") &&
    !clubCopy.caption.includes("on this phone") &&
    clubCopy.points[0] === "This Club's next Matches are listed here",
  "Club copy no longer tells a PC user the fixtures are on a phone"
);
assert(
  preview.includes('audience="club"') &&
    preview.includes("HowS4pSelectMatch") &&
    preview.includes('initialClub="Hearts"'),
  "Club Select Match preview is the unframed Hearts fixture list"
);
assert(
  overlay.includes("club-pc-no-phone-frame-v1") &&
    overlay.includes('BUST = "club-pc-no-phone-pc-2"') &&
    overlay.includes("git fetch") &&
    overlay.includes("Working folder:") &&
    overlay.includes('rmSync(".next"') &&
    overlay.includes("apply-club-pc-no-phone.ps1") &&
    overlay.includes("s4-c-platform.vercel.app/preview/club-select-match") &&
    overlay.includes("app/components/home/PhoneFrame.tsx") &&
    overlay.includes("app/components/home/SelectMatchFixtures.tsx") &&
    overlay.includes("app/components/home/HowS4pSelectMatch.tsx") &&
    readFileSync("apply-club-pc-no-phone.ps1", "utf8").includes(
      "git checkout origin/main"
    ),
  "PC overlay pulls the unframed Club fixture list and clears Next.js cache"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Club Select Match on PC is an unframed fixture list with a larger Select this Match tab."
);
