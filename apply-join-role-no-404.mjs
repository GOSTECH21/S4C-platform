import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/join-role-no-404-18f9";
const FILES = [
  "app/lib/hard-navigate.ts",
  "app/components/home/HomeRoleSection.tsx",
  "app/components/home/HomeJoinMission.tsx",
  "app/components/home/HowYoureSupporting.tsx",
  "app/fan/register/page.tsx",
  "app/join/page.tsx",
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

const roles = read("app/components/home/HomeRoleSection.tsx");
const join = read("app/components/home/HomeJoinMission.tsx");
const fan = read("app/fan/register/page.tsx");
const joinPage = read("app/join/page.tsx");
if (
  !roles.includes("hardNavigateOnClick") ||
  roles.includes("Already registered? Login") ||
  !join.includes("hardNavigateOnClick") ||
  !fan.includes('"use client"') ||
  !joinPage.includes('redirect("/?join=register")')
) {
  failed += 1;
  console.error(
    "Role-card join still 404s. Pull the files above, then hard-refresh."
  );
}

if (failed) process.exit(1);
console.log(
  "OK: Create your free account → Join as a Fan (and the other role buttons) open the register pages. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
