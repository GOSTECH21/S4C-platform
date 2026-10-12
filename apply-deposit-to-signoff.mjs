import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/deposit-to-signoff-18f9";
const FILES = [
  "app/sponsor/wallet/page.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/lib/routes.ts",
  "app/services/climate-sponsors.service.ts",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-sponsor-completion-flow.ts",
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

if (failed) process.exit(1);
console.log(
  "OK: Deposit into the Climate Sponsorship Wallet now opens Terms & Conditions + sign-off. Stop npm run dev, start it again, and hard-refresh."
);
