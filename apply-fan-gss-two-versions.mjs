import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fan-gss-two-versions-18f9";
const FILES = [
  "app/lib/sccan-catalog.ts",
  "app/lib/featured-gss.ts",
  "app/lib/sponsor-wallet.ts",
  "app/components/fan/ClimateProjectSponsors.tsx",
  "app/services/match-day-folder.service.ts",
  "scripts/verify-wallet-vote.ts",
  "scripts/verify-club-match-day.ts",
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

const sponsors = "app/components/fan/ClimateProjectSponsors.tsx";
const wallet = "app/lib/sponsor-wallet.ts";
const catalog = "app/lib/sccan-catalog.ts";
if (existsSync(sponsors) && existsSync(wallet) && existsSync(catalog)) {
  const ui = readFileSync(sponsors, "utf8");
  const copy = readFileSync(wallet, "utf8");
  const names = readFileSync(catalog, "utf8");
  if (
    !copy.includes("Look out for a Sponsor") ||
    !copy.includes("Each selected Project automatically receives") ||
    copy.includes("Lead Climate Sponsor: Select a Global Schools Solar version") ||
    !names.includes('Local Global Schools Solar') ||
    !names.includes('International Global Schools Solar')
  ) {
    failed += 1;
    console.error(
      "Climate Project Sponsors still use the old FUND-IT sentence or one GSS version. Pull the files above, then hard-refresh."
    );
  }
  if (ui.includes("Select a Global Schools Solar version")) {
    failed += 1;
    console.error("The Lead drop-down still says Select a Global Schools Solar version.");
  }
}

if (failed) process.exit(1);
console.log(
  "OK: fans choose Local or International Global Schools Solar and see the four FUND-IT steps. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
