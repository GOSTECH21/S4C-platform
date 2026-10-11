import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/wallet-take-decrements-18f9";
const FILES = [
  "app/lib/sponsor-wallet.ts",
  "app/lib/match-day-folder.ts",
  "app/lib/climate-funding.ts",
  "app/services/sponsor-wallet.service.ts",
  "app/services/match-day-folder.service.ts",
  "app/components/fan/FanCampaignWorkspace.tsx",
  "app/components/fan/ClimateProjectSponsors.tsx",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    mkdirSync(dirname(join(rel)), { recursive: true });
    writeFileSync(rel, await response.text());
    console.log("Pulled", rel);
  } catch (err) {
    failed += 1;
    console.error(
      `Could not pull ${rel}. Stay in the S4C-platform folder and check the network.`,
      err instanceof Error ? err.message : err
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: every £0.20 FUND-IT now reduces that Carbon Wallet. Stop npm run dev, start it again, and open Climate Sponsors in Incognito."
);
