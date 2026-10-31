import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/local-sponsor-sync-18f9";
const BUST = "local-sponsor-sync-1";
const FILES = [
  "supabase/migrations/0020_local_sponsor_records.sql",
  "app/lib/local-sponsor.ts",
  "app/lib/local-sponsor-home.ts",
  "app/lib/lobi.ts",
  "app/lib/sponsor-home.ts",
  "app/preview/local-sponsor-home/page.tsx",
  "app/services/local-sponsor.service.ts",
  "app/services/sponsor-auth.service.ts",
  "app/sponsor/local/page.tsx",
  "app/sponsor/local/register/page.tsx",
  "app/sponsor/login/page.tsx",
  "app/sponsor/sponsor-nav.tsx",
  "app/club/dashboard/page.tsx",
  "app/components/sponsor/LocalSignedSponsorHome.tsx",
  "scripts/verify-local-sponsor-sync.ts",
  "scripts/verify-local-lobi-home.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}?v=${BUST}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
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

const home = "app/sponsor/local/page.tsx";
const signed = "app/components/sponsor/LocalSignedSponsorHome.tsx";
if (existsSync(home) && existsSync(signed)) {
  const homeText = readFileSync(home, "utf8");
  const signedText = readFileSync(signed, "utf8");
  if (
    !homeText.includes("hydrateLocalSponsorRecords") ||
    !signedText.includes("Who you are sponsoring")
  ) {
    failed += 1;
    console.error(
      "Local home still keeps Club and Match on this browser only. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Local Business Club and Match records now copy between phone and PC. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
