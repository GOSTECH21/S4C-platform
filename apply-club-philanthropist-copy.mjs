import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-philanthropist-copy-18f9";
const FILE = "app/lib/home-stakeholders.ts";
const PATCHES = [
  [
    "Measure match-day emissions, engage your fans, unlock sponsor funding and deliver verified climate projects.",
    "Mobilize your fans to unlock sponsored funding to deliver approved climate projects & offset your Match Day carbon footprint.",
  ],
  [
    "Measure match-day emissions and deliver verified climate projects.",
    "Mobilize fans to unlock sponsored funding and offset your Match Day carbon footprint.",
  ],
  [
    "Make a transformational contribution (e.g. £10,000 per match) and let fans direct your gift to the climate projects that matter most.",
    "Make a climate donation (any amount per match) and let fans direct your gift to the climate projects that helps your Team climb our Climate Impact League Table (CILT).",
  ],
  [
    "Give a match-day gift and let fans direct it to climate projects.",
    "Make a climate donation and let fans help your team climb the Climate Impact League Table.",
  ],
];

function patch(src) {
  let next = src;
  for (const [from, to] of PATCHES) next = next.replaceAll(from, to);
  return next;
}

function hasNewCopy(src) {
  return (
    src.includes(
      "Mobilize your fans to unlock sponsored funding to deliver approved climate projects & offset your Match Day carbon footprint"
    ) &&
    src.includes("any amount per match") &&
    src.includes("Climate Impact League Table (CILT)") &&
    !src.includes("Measure match-day emissions, engage your fans") &&
    !src.includes("£10,000 per match")
  );
}

let failed = 0;
const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${FILE}`;
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  mkdirSync(dirname(join(FILE)), { recursive: true });
  writeFileSync(FILE, Buffer.from(await response.arrayBuffer()));
  console.log("Pulled", FILE);
} catch (err) {
  console.error(
    "Could not pull from GitHub. Patching the local file instead.",
    err instanceof Error ? err.message : err
  );
}

if (existsSync(FILE)) {
  const before = readFileSync(FILE, "utf8");
  const after = patch(before);
  if (after !== before) {
    writeFileSync(FILE, after);
    console.log("Patched", FILE);
  }
  const src = readFileSync(FILE, "utf8");
  if (!hasNewCopy(src)) {
    failed += 1;
    console.error(
      "Sports Clubs or Philanthropists copy is not in place. Stay in the S4C-platform folder and run the curl/git command, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error(`${FILE} is missing.`);
}

if (failed) process.exit(1);
console.log(
  "OK: Sports Clubs and Philanthropists role-card copy is in place. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
