import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/match-sponsorship-18f9";
const FILES = [
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "app/lib/match-day-carbon-offset.ts",
  "app/lib/sponsor-card-payment.ts",
  "app/lib/sponsor-wallet.ts",
  "app/lib/sponsor-listings.ts",
  "app/sponsor/wallet/page.tsx",
];

console.log("Folder:", process.cwd());

if (!existsSync("app/components/sponsor/ClimateSponsorshipWallet.tsx")) {
  console.error(
    "This is not the S4C-platform app folder. cd into S4C-platform (the folder that contains app\\components\\sponsor) and run this again."
  );
  process.exit(1);
}

async function pullFile(rel) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      mkdirSync(dirname(join(rel)), { recursive: true });
      writeFileSync(rel, Buffer.from(await response.arrayBuffer()));
      console.log("Pulled", rel);
      return true;
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, attempt * 400));
    }
  }
  console.error(
    `Could not pull ${rel}.`,
    lastError instanceof Error ? lastError.message : lastError
  );
  return false;
}

let failed = 0;
for (const rel of FILES) {
  const ok = await pullFile(rel);
  if (!ok) failed += 1;
}

const wallet = existsSync("app/components/sponsor/ClimateSponsorshipWallet.tsx")
  ? readFileSync("app/components/sponsor/ClimateSponsorshipWallet.tsx", "utf8")
  : "";

if (!wallet.includes("s4p-match-sponsorship-wallet-v2")) {
  failed += 1;
  console.error(
    "The wallet file did not update. You ran this in the wrong folder, or the download failed."
  );
}
if (wallet.includes("Commitment Fee (Day 1)") || wallet.includes("Sponsorship/Goal-Scored")) {
  failed += 1;
  console.error("The wallet file still has Commitment Fee / Sponsorship/Goal-Scored.");
}
if (!wallet.includes("Match-Sponsorship + 5% Platform Fee")) {
  failed += 1;
  console.error("The wallet file is missing the Match-Sponsorship heading.");
}

if (failed) process.exit(1);
console.log(
  "OK: American Express wallet file is Match-Sponsorship + 5% Platform Fee. Stop npm run dev, delete the .next folder, start npm run dev, then Ctrl+F5."
);
