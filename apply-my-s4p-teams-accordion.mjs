import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { spawnSync } from "child_process";

const REFS = ["main", "cursor/my-s4p-teams-accordion-18f9"];
const BUST = "my-s4p-teams-accordion-2";
const SELF = "apply-my-s4p-teams-accordion.mjs";
const FILES = [
  "app/components/fan/TeamPicker.tsx",
  "app/components/fan/FanMyTeamsPanel.tsx",
  "app/supporter/dashboard/page.tsx",
  "app/preview/my-s4p-teams/page.tsx",
  "scripts/verify-my-s4p-teams-accordion.ts",
  "scripts/verify-sport-category-accordion.ts",
];

if (process.env.S4P_OVERLAY_SELF !== "1") {
  let refreshed = false;
  for (const ref of REFS) {
    const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${ref}/${SELF}?v=${BUST}`;
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      const buf = Buffer.from(await response.arrayBuffer());
      const current = existsSync(SELF) ? readFileSync(SELF) : Buffer.alloc(0);
      if (current.equals(buf)) {
        refreshed = true;
        break;
      }
      writeFileSync(SELF, buf);
      console.log("Updated", SELF, "from", ref);
      const rerun = spawnSync(process.execPath, [SELF], {
        stdio: "inherit",
        env: { ...process.env, S4P_OVERLAY_SELF: "1" },
      });
      process.exit(rerun.status ?? 1);
    } catch {
      // try the next ref
    }
  }
  if (!refreshed) {
    console.log("Could not refresh", SELF, "from GitHub; using the local copy.");
  }
}

async function pull(rel) {
  let lastError = "not found";
  for (const ref of REFS) {
    const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${ref}/${rel}?v=${BUST}`;
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        lastError = `HTTP ${response.status}`;
        continue;
      }
      mkdirSync(dirname(join(rel)), { recursive: true });
      writeFileSync(rel, Buffer.from(await response.arrayBuffer()));
      console.log("Pulled", rel);
      return true;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  console.error(
    `Could not pull ${rel}. Stay in the S4C-platform folder and check the network.`,
    lastError
  );
  return false;
}

let failed = 0;
for (const rel of FILES) {
  if (!(await pull(rel))) failed += 1;
}

const picker = "app/components/fan/TeamPicker.tsx";
const panel = "app/components/fan/FanMyTeamsPanel.tsx";
if (existsSync(picker) && existsSync(panel)) {
  const pickerSrc = readFileSync(picker, "utf8");
  const panelSrc = readFileSync(panel, "utf8");
  if (
    !pickerSrc.includes("my-s4p-teams-accordion-v1") ||
    !pickerSrc.includes("Choose a team") ||
    !panelSrc.includes("catalogAccordion") ||
    !panelSrc.includes("useState(true)") ||
    panelSrc.includes("setEditing(teams.length === 0)")
  ) {
    failed += 1;
    console.error(
      "My S4P sport list is still always open. Re-download apply-my-s4p-teams-accordion.mjs, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("My S4P team accordion files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: My S4P keeps the intro and current teams visible, and hides Football, Rugby, NFL, NBA and Cricket until you open Choose a team. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
