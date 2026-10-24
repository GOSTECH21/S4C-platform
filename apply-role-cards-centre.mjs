import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/role-cards-centre-18f9";
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
    src.includes("roles-heading-strip.png") ||
    !src.includes("mx-auto max-w-[1400px]") ||
    !src.includes("mx-auto flex w-fit max-w-3xl") ||
    !src.includes("data-role-cards-scroller") ||
    !src.includes("Different roles. One mission. A cleaner, greener sport.")
  ) {
    failed += 1;
    console.error(
      "The role heading strip is still there or the cards are not centred. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: the sports strip is off, the role box matches How S4P Works, and Sports Clubs is centred. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
