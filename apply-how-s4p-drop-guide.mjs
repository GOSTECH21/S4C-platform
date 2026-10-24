import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/how-s4p-drop-guide-18f9";
const FILES = ["app/components/home/HowItWorks.tsx", "scripts/verify-homepage.ts"];

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
    src.includes("A quick guide to") ||
    src.includes("making a real difference") ||
    src.includes("-rotate-3")
  ) {
    failed += 1;
    console.error(
      "The How S4P Works quick-guide banner is still on the page. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: the How S4P Works quick-guide banner is off. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
