import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/phone-match-sponsor-18f9";
const FILES = [
  "app/lib/hard-navigate.ts",
  "app/components/home/SelectMatchFixtures.tsx",
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

const phone = read("app/components/home/SelectMatchFixtures.tsx");
if (
  !phone.includes("data-phone-match-sponsor") ||
  !phone.includes("hardNavigateOnClick") ||
  !phone.includes("savePendingSponsorMatch") ||
  !phone.includes("Tap a match to lock it in") ||
  phone.includes("Tap a match to choose it for Match Day")
) {
  failed += 1;
  console.error(
    "Phone match fixtures are not opening sponsorship. Pull the files above, then hard-refresh."
  );
}

if (failed) process.exit(1);
console.log(
  "OK: tapping a How S4P Works match opens sponsorship lock-in and sign-off. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
