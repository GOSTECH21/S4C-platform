import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/explore-six-steps-18f9";
const FILES = [
  "app/components/home/HomeJoinMission.tsx",
  "app/components/home/HomeRoleSection.tsx",
  "app/components/home/HowItWorks.tsx",
  "scripts/verify-homepage.ts",
  "scripts/verify-pitch-theme.ts",
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

const joinPath = "app/components/home/HomeJoinMission.tsx";
if (existsSync(joinPath)) {
  const patched = readFileSync(joinPath, "utf8").replaceAll(
    "Turn every match into a climate action opportunity",
    "Turn every score in a match into a sponsored climate action"
  );
  writeFileSync(joinPath, patched);
}

const join = read("app/components/home/HomeJoinMission.tsx");
const roles = read("app/components/home/HomeRoleSection.tsx");
const how = read("app/components/home/HowItWorks.tsx");
if (
  !join.includes("Turn every score in a match into a sponsored climate action") ||
  roles.includes("Already registered? Login") ||
  roles.includes("card.loginText") ||
  !how.includes("Explore the six steps below.") ||
  how.includes("Swipe left or right") ||
  !how.includes("data-how-s4p-arrow")
) {
  failed += 1;
  console.error(
    "The heading, role-card login lines, or How S4P Works arrows are not in place. Pull the files above, then hard-refresh."
  );
}

if (failed) process.exit(1);
console.log(
  "OK: club heading, role cards, and How S4P Works arrows are in place. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
