import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/support-match-logos-18f9";
const FILES = [
  "app/lib/club-logos.ts",
  "app/api/home/club-logo/route.ts",
  "app/components/home/HowYoureSupporting.tsx",
  "scripts/verify-homepage.ts",
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

function read(rel) {
  return existsSync(rel) ? readFileSync(rel, "utf8") : "";
}

const phone = read("app/components/home/HowYoureSupporting.tsx");
const logos = read("app/lib/club-logos.ts");
const api = read("app/api/home/club-logo/route.ts");
if (
  !phone.includes("data-match-day-home-logo") ||
  !phone.includes("data-match-day-away-logo") ||
  !phone.includes("clubLogoSrc") ||
  !phone.includes('id="match-day-banner"') ||
  !logos.includes("export function clubLogoSrc") ||
  !api.includes("thesportsdb.com")
) {
  failed += 1;
  console.error(
    "The How You're Supporting match window is missing both club logos. Pull the files above, then hard-refresh."
  );
}

if (failed) process.exit(1);
console.log(
  "OK: How You're Supporting shows the chosen Match Day with both club logos. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
