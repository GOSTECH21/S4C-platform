import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/local-signoff-terms-18f9";
const FILES = [
  "app/lib/local-sponsor.ts",
  "app/lib/sponsorship-auction.ts",
  "app/sponsor/offers/OfferSignOff.tsx",
  "app/sponsor/offers/OfferSignOffPage.tsx",
  "app/preview/local-signoff/page.tsx",
  "scripts/verify-local-signoff-terms.ts",
  "scripts/verify-sponsorship-auction.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    mkdirSync(dirname(join(rel)), { recursive: true });
    writeFileSync(rel, Buffer.from(await response.arrayBuffer()));
    console.log("Pulled", rel);
  } catch (err) {
    failed += 1;
    console.error(
      `Could not pull ${rel}. Stay in the S4C-platform folder and check the network.`,
      err instanceof Error ? err.message : err
    );
  }
}

const formPath = "app/sponsor/offers/OfferSignOff.tsx";
if (existsSync(formPath)) {
  const src = readFileSync(formPath, "utf8");
  if (
    !src.includes("LOCAL_SIGNOFF_TERMS") ||
    !src.includes("formatLocalSponsorPayableCopy") ||
    !src.includes("localSponsor ? LOCAL_SIGNOFF_TERMS : GOAL_SPONSOR_TERMS")
  ) {
    failed += 1;
    console.error(
      "Local sign-off is still using Lead Goals T&Cs. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Local Business Climate Sponsors sign off the Match amount with Local T&Cs, not Goals. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
