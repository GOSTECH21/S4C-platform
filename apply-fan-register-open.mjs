import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fan-register-open-teams-18f9";
const FILES = [
  "app/lib/fan-register-copy.ts",
  "app/register/page.tsx",
  "app/fan/register/page.tsx",
  "app/components/fan/TeamPicker.tsx",
  "app/services/teams.service.ts",
  "app/dashboard/supporter/preferences/page.tsx",
  "scripts/verify-current-season.ts",
  "scripts/verify-fan-register-open.ts",
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

const page = "app/register/page.tsx";
if (existsSync(page)) {
  const src = readFileSync(page, "utf8");
  if (
    !src.includes("FAN_REGISTER_INTRO") ||
    !src.includes("loadFanRegisterCatalog") ||
    src.includes("You've been invited")
  ) {
    failed += 1;
    console.error("The Fan registration worldwide form did not land.");
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Fan registration is the worldwide Sports Fan form. Stop npm run dev, start it again, and hard-refresh /fan/register (Ctrl+F5)."
);
