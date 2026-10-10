import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/local-wallet-remaining-18f9";
const FILES = [
  "app/lib/match-day-folder.ts",
  "app/services/match-day-folder.service.ts",
  "app/components/fan/FanCampaignWorkspace.tsx",
];

if (!FILES.every((rel) => rel.startsWith("app/"))) {
  console.error("Run this from the S4C-platform folder.");
  process.exit(1);
}

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (!text.includes("withLiveWalletRemaining") && rel.includes("match-day-folder")) {
      throw new Error("Downloaded file is missing withLiveWalletRemaining");
    }
    mkdirSync(dirname(join(rel)), { recursive: true });
    writeFileSync(rel, text);
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
  "OK: local FUND-IT remaining now comes from the Carbon Wallet. Stop npm run dev, start it again, and open My S4P in Incognito."
);
