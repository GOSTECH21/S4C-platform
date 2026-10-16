import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-register-country-league-18f9";
const FILES = [
  "app/lib/sports.ts",
  "app/lib/club-register-options.ts",
  "app/club/register/page.tsx",
  "scripts/verify-club-register-step1.ts",
  "scripts/verify-current-season.ts",
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

const page = "app/club/register/page.tsx";
if (existsSync(page)) {
  const src = readFileSync(page, "utf8");
  if (
    !src.includes("clubRegisterCountries") ||
    !src.includes("clubRegisterLeaguesFor") ||
    src.indexOf('name="country"') > src.indexOf('name="league"') ||
    src.includes("Tell us about your football club.") ||
    !src.includes("Join Score-4-Planet") ||
    src.includes("Join Score-4-Our-Planet and enable every sporting moment")
  ) {
    failed += 1;
    console.error(
      "Club Registration Step 1 did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Club Registration Sport lists Football, Rugby, NFL and NBA. Country is on the left (England, Scotland first). League fills from that Country. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
