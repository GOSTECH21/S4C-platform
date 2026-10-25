import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/how-s4p-arrow-green-18f9";
const FILE = "app/components/home/HowItWorks.tsx";
const OLD =
  "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-400/40 bg-s4p-paper shadow-sm hover:bg-s4p-mark disabled:pointer-events-none disabled:opacity-30 lg:inline-flex";
const NEXT =
  "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-s4p-mark text-black shadow-sm hover:brightness-110 disabled:pointer-events-none disabled:opacity-50 lg:inline-flex";

let failed = 0;
const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${FILE}`;
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  mkdirSync(dirname(join(FILE)), { recursive: true });
  writeFileSync(FILE, Buffer.from(await response.arrayBuffer()));
  console.log("Pulled", FILE);
} catch (err) {
  console.error(
    "Could not pull from GitHub. Patching the local file instead.",
    err instanceof Error ? err.message : err
  );
}

if (existsSync(FILE)) {
  const before = readFileSync(FILE, "utf8");
  const after = before.replaceAll(OLD, NEXT);
  if (after !== before) {
    writeFileSync(FILE, after);
    console.log("Patched", FILE);
  }
  const src = readFileSync(FILE, "utf8");
  if (
    !src.includes("bg-s4p-mark text-black shadow-sm hover:brightness-110") ||
    src.includes("hover:bg-s4p-mark")
  ) {
    failed += 1;
    console.error(
      "How S4P Works arrows are not constantly green. Stay in the S4C-platform folder and run the curl/git command, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error(`${FILE} is missing.`);
}

if (failed) process.exit(1);
console.log(
  "OK: How S4P Works previous and next arrows stay green. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
