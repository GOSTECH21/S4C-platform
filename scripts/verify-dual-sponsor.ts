import { readFileSync } from "fs";
import {
  LEAD_CLIMATE_SPONSOR_LABEL,
  LEAD_CLIMATE_SPONSOR_SHARE,
  LOCAL_BUSINESS_SPONSOR_LABEL,
  LOCAL_BUSINESS_SPONSOR_SHARE,
} from "../app/lib/dual-sponsor";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(LEAD_CLIMATE_SPONSOR_SHARE === 65, "Lead Climate Sponsor occupies 65%");
assert(
  LOCAL_BUSINESS_SPONSOR_SHARE === 35,
  "Local Business Climate Sponsor occupies 35%"
);
assert(
  LEAD_CLIMATE_SPONSOR_SHARE + LOCAL_BUSINESS_SPONSOR_SHARE === 100,
  "Sponsor shares fill the climate project card strip"
);

const strip = readFileSync("app/components/fan/DualSponsorStrip.tsx", "utf8");
assert(
  strip.includes("LEAD_CLIMATE_SPONSOR_SHARE"),
  "Fan vote cards use the 65% lead sponsor share"
);
assert(
  strip.includes("LOCAL_BUSINESS_SPONSOR_SHARE"),
  "Fan vote cards use the 35% local sponsor share"
);
assert(
  strip.includes("LEAD_CLIMATE_SPONSOR_LABEL") &&
    LEAD_CLIMATE_SPONSOR_LABEL === "Lead Climate Sponsor",
  "Lead Climate Sponsor is labelled on the card"
);
assert(
  strip.includes("LOCAL_BUSINESS_SPONSOR_LABEL") &&
    LOCAL_BUSINESS_SPONSOR_LABEL === "Local Business Climate Sponsor",
  "Local Business Climate Sponsor is labelled on the card"
);

const vote = readFileSync("app/supporter/dashboard/page.tsx", "utf8");
assert(vote.includes("DualSponsorStrip"), "My S4P vote cards show both sponsors");
assert(
  !vote.includes("leftoverSponsor"),
  "Local sponsor is on every vote card, not only leftover projects"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Fan vote cards: Lead Climate Sponsor 65% and Local Business Climate Sponsor 35%."
);
