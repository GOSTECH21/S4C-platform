import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fan-default-p4p-18f9";
const BUST = "fan-default-p4p-1";
const FILES = [
  "app/lib/routes.ts",
  "app/lib/signed-in-role.ts",
  "app/fan/login/page.tsx",
  "app/supporter/login/page.tsx",
  "app/register/page.tsx",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "app/components/home/PredictForPlanet.tsx",
  "app/components/home/HowS4pPredictForPlanet.tsx",
  "app/supporter/dashboard/predict/page.tsx",
  "app/preview/fan-p4p/page.tsx",
  "scripts/verify-fan-default-p4p.ts",
  "scripts/verify-p4p-wallet-full-time.ts",
  "scripts/verify-predict-for-planet.ts",
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

const fanLogin = "app/fan/login/page.tsx";
const play = "app/components/fan/PredictForPlanetPlay.tsx";
if (existsSync(fanLogin) && existsSync(play)) {
  const loginSrc = readFileSync(fanLogin, "utf8");
  const playSrc = readFileSync(play, "utf8");
  if (
    !loginSrc.includes("SUPPORTER_HOME_PATH") ||
    playSrc.includes("location.assign")
  ) {
    failed += 1;
    console.error(
      "Fan login is not landing on P4P, or P4P still jumps to Climate Projects. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Fan P4P login files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Supporters now land on P4P after login, and P4P no longer jumps to Climate Projects. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
