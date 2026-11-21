import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const front = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
const how = readFileSync("app/components/home/HowItWorks.tsx", "utf8");
const banner = readFileSync("app/components/home/HomeTopBanner.tsx", "utf8");
const p4p = readFileSync(
  "app/components/home/HowS4pPredictForPlanet.tsx",
  "utf8"
);
const overlay = readFileSync("apply-how-s4p-mobile-pc.mjs", "utf8");

assert(
  front.includes('data-how-s4p-mobile-pc="how-s4p-mobile-pc-v1"') &&
    front.includes("<HowItWorks") &&
    !front.includes("hidden md:block") &&
    !front.includes('data-how-s4p-desktop="true"'),
  "Homepage How S4P Works is on mobile and PC"
);

assert(
  how.includes("how-s4p-mobile-pc-v1") &&
    how.includes("HOW_S4P_ACCESS_JOIN") &&
    how.includes("data-how-s4p-access-join") &&
    !how.includes("hidden md:block") &&
    how.includes("pointer-events-none h-auto w-full") &&
    how.includes("order-2 mx-auto max-w-[18rem] lg:order-1") &&
    how.includes("order-1 min-w-0 flex-1 lg:order-2") &&
    how.includes("text-black"),
  "Access & Join phone, copy and join buttons show on mobile and PC"
);

assert(
  banner.includes('href: "/#how-s4p-works"') &&
    banner.includes("grid-cols-5 gap-2") &&
    !banner.includes('item.label !== "How it works"'),
  "Mobile menu keeps How it works so phones can jump to Access & Join"
);

assert(
  p4p.includes("how-s4p-mobile-pc-v1") &&
    p4p.includes("data-p4p-board-first") &&
    p4p.includes("children && !showPhone") &&
    p4p.indexOf("{children && !showPhone") <
      p4p.indexOf("<PredictForPlanetPanel"),
  "Fan P4P puts the live 5-minute timer board above the intro on mobile and PC"
);

assert(
  overlay.includes('STAMP = "how-s4p-mobile-pc-v1"') &&
    overlay.includes("app/components/home/HowItWorks.tsx") &&
    overlay.includes("app/components/home/HomeFrontPage.tsx") &&
    overlay.includes("app/components/home/HomeTopBanner.tsx") &&
    overlay.includes("app/components/home/HowS4pPredictForPlanet.tsx"),
  "PC overlay pulls How S4P Works for mobile and PC"
);

if (failures.length > 0) {
  console.error("verify-how-s4p-mobile-pc failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-how-s4p-mobile-pc: ok");
