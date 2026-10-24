import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/role-cards-grid-18f9";
const FILES = [
  "app/components/home/HomeRoleSection.tsx",
  "app/lib/home-stakeholders.ts",
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
    src.includes("data-role-cards-scroller") ||
    src.includes('aria-roledescription="carousel"') ||
    !src.includes("lg:grid-cols-3") ||
    !src.includes("sm:grid-cols-2") ||
    !src.includes("card.image") ||
    src.indexOf("{card.title}") > src.indexOf("card.image")
  ) {
    failed += 1;
    console.error(
      "The role cards are not a 3x2 grid yet. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: the six role cards are a 3x2 grid on desktop. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
