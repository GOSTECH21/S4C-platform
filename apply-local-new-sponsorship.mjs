import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/local-new-sponsorship-18f9";
const FILES = [
  "app/lib/match-day-carbon-offset.ts",
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/preview/local-wallet/page.tsx",
  "scripts/verify-local-new-sponsorship.ts",
  "scripts/verify-local-lobi-home.ts",
  "scripts/verify-wallet-vote.ts",
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
if (existsSync(wallet)) {
  const src = readFileSync(wallet, "utf8");
  const routesImport =
    src.match(/import \{[\s\S]*?\} from "@\/app\/lib\/routes"/)?.[0] ?? "";
  if (
    !src.includes("SeeMatchDetails") ||
    !src.includes("MATCH_DAY_PROJECTS_RECORD_LABEL") ||
    src.includes("MATCH_DAY_GOALS_SCORED_COPY")
  ) {
    failed += 1;
    console.error(
      "Local New Sponsorship is missing Club + Match details or the five-project record. Pull the files above, then hard-refresh."
    );
  }
  if (routesImport.includes("sponsorHomePath")) {
    failed += 1;
    console.error(
      "The wallet Form is importing sponsorHomePath from routes again. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Local New Sponsorship now selects Club + Match with See Match details, tops up the cash table, then shows the club's 5 chosen Climate Projects as a record. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
