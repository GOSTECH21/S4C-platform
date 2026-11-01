import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/sport-category-accordion-18f9";
const BUST = "sport-category-accordion-1";
const FILES = [
  "app/components/fan/TeamPicker.tsx",
  "scripts/verify-sport-category-accordion.ts",
  "scripts/verify-fan-register-open.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}?v=${BUST}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
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

const picker = "app/components/fan/TeamPicker.tsx";
if (existsSync(picker)) {
  const src = readFileSync(picker, "utf8");
  if (
    !src.includes("sport-accordion-v1") ||
    !src.includes("data-sport-name={group.sport}") ||
    src.includes("<section")
  ) {
    failed += 1;
    console.error(
      "Sport categories are still always expanded. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("app/components/fan/TeamPicker.tsx is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Football, Rugby, NFL, NBA and Cricket are now collapsible accordions. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
