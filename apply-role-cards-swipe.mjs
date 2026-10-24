import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/role-cards-swipe-18f9";
const FILES = [
  "app/components/home/HomeRoleSection.tsx",
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

const roles = "app/components/home/HomeRoleSection.tsx";
if (existsSync(roles)) {
  const src = readFileSync(roles, "utf8");
  if (
    !src.includes("data-role-cards-scroller") ||
    !src.includes("Swipe left or right to see each role.") ||
    src.includes("xl:grid-cols-6") ||
    !src.includes("Different roles. One mission. A cleaner, greener sport.") ||
    !src.includes("/images/home/roles-forest.png")
  ) {
    failed += 1;
    console.error(
      "The six role cards are not swipeable yet. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: the six role cards swipe like How S4P Works. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
