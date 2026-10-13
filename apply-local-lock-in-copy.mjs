import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/local-lock-in-copy-18f9";
const FILES = [
  "app/lib/climate-sponsors.ts",
  "app/lib/sponsor-home.ts",
  "app/sponsor/dashboard/page.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/sponsor/sponsor-nav.tsx",
  "app/preview/local-wallet/page.tsx",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-climate-sponsors.ts",
  "scripts/verify-wallet-vote.ts",
  "scripts/verify-match-day-carbon-offset.ts",
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

const wallet = "app/sponsor/wallet/page.tsx";
const dashboard = "app/sponsor/dashboard/page.tsx";
if (existsSync(wallet) && existsSync(dashboard)) {
  const walletSrc = readFileSync(wallet, "utf8");
  const dashSrc = readFileSync(dashboard, "utf8");
  if (
    !walletSrc.includes("insert your Sponsorship amount") &&
    !walletSrc.includes("localLockCopy")
  ) {
    failed += 1;
    console.error(
      "Local wallet is missing the Local Business Climate Sponsor lock-in copy. Pull the files above, then hard-refresh."
    );
  }
  if (dashSrc.includes("localLockCopy()")) {
    failed += 1;
    console.error(
      "The Lead dashboard must keep Goal-Sponsorship copy. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Local Business Climate Sponsors open the Climate Sponsorship Wallet, not the Lead Goal-Sponsorship dashboard. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
