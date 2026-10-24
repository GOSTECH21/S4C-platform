import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/how-s4p-centre-step-18f9";
const FILES = [
  "app/components/home/HowItWorks.tsx",
  "app/components/home/HowYoureSupporting.tsx",
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

const how = "app/components/home/HowItWorks.tsx";
if (existsSync(how)) {
  const src = readFileSync(how, "utf8");
  if (
    !src.includes("mx-auto max-w-3xl text-center") ||
    !src.includes("lg:items-center") ||
    !src.includes("Step ${stepIndex + 1} of ${steps.length}") ||
    src.includes("{index + 1} of 6") ||
    src.includes("how-s4p-step-index")
  ) {
    failed += 1;
    console.error(
      "How S4P Works is still the old left-aligned layout. Pull the files above, then hard-refresh."
    );
  }
}

const supporting = "app/components/home/HowYoureSupporting.tsx";
if (existsSync(supporting)) {
  const src = readFileSync(supporting, "utf8");
  if (
    !src.includes(
      "inline-flex items-center rounded-full bg-s4p-mark px-3 py-1 text-sm font-black text-black"
    )
  ) {
    failed += 1;
    console.error(
      "How You're Supporting still uses the old Step label. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: How S4P Works is centred with one Step N of 6 tab. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
