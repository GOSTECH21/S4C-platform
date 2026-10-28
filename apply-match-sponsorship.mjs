import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/match-sponsorship-18f9";
const MARKERS = new Set([
  "ClimateSponsorshipWallet.tsx",
  "SponsorInviteInbox.tsx",
]);
const FILES = [
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/components/sponsor/SponsorInviteInbox.tsx",
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "app/components/club/ClubSponsorsListings.tsx",
  "app/sponsor/invitations/page.tsx",
  "app/sponsor/register/page.tsx",
  "app/sponsor/offers/OfferSignOff.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/club/projects/select/page.tsx",
  "app/lib/match-day-carbon-offset.ts",
  "app/lib/sponsor-card-payment.ts",
  "app/lib/sponsor-wallet.ts",
  "app/lib/sponsor-listings.ts",
  "app/lib/sponsorship-auction.ts",
  "app/lib/sports.ts",
];

console.log("Folder:", process.cwd());

function findMarkerFiles(dir, depth, found) {
  if (depth > 6) return;
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git"
    ) {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) findMarkerFiles(path, depth + 1, found);
    else if (MARKERS.has(entry.name)) found.push(path);
  }
}

function appRootFromMarker(file) {
  return dirname(dirname(dirname(dirname(file))));
}

const markers = [];
findMarkerFiles(process.cwd(), 0, markers);
if (markers.length === 0) {
  console.error(
    "Could not find SponsorInviteInbox.tsx or ClimateSponsorshipWallet.tsx under this folder. In the SAME terminal where you run npm run dev, cd to S4C-platform and run this again."
  );
  process.exit(1);
}

const roots = [...new Set(markers.map(appRootFromMarker))];
console.log("Updating app roots:");
for (const root of roots) console.log(" ", root);

for (const root of roots) {
  const p4p = join(root, "app/lib/predict-for-planet.ts");
  const how = join(root, "app/components/home/HowItWorks.tsx");
  const p4pText = existsSync(p4p) ? readFileSync(p4p, "utf8") : "";
  const howText = existsSync(how) ? readFileSync(how, "utf8") : "";
  if (
    p4pText.includes("s4p-predict-for-planet-v1") ||
    howText.includes("s4p-predict-for-planet-v1")
  ) {
    console.error(
      "STOP: Predict-For Planet is already applied. Re-running Match-Sponsorship would drop Game-Time. Use apply-predict-for-planet.mjs instead."
    );
    process.exit(1);
  }
}

async function pullFile(root, rel) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const dest = join(root, rel);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, Buffer.from(await response.arrayBuffer()));
      console.log("Pulled", dest);
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
for (const root of roots) {
  for (const rel of FILES) {
    const ok = await pullFile(root, rel);
    if (!ok) failed += 1;
  }
}

for (const root of roots) {
  const wallet = join(root, "app/components/sponsor/ClimateSponsorshipWallet.tsx");
  const inbox = join(root, "app/components/sponsor/SponsorInviteInbox.tsx");
  const walletText = existsSync(wallet) ? readFileSync(wallet, "utf8") : "";
  const inboxText = existsSync(inbox) ? readFileSync(inbox, "utf8") : "";
  if (!walletText.includes("s4p-match-sponsorship-wallet-v2")) {
    failed += 1;
    console.error("Still old wallet:", wallet);
  } else {
    console.log("Updated wallet:", wallet);
  }
  if (
    !inboxText.includes("s4p-match-sponsorship-inbox-v2") ||
    inboxText.includes("Commitment Fee") ||
    inboxText.includes("Sponsorship/Goal") ||
    inboxText.includes("Commit sponsorship amounts")
  ) {
    failed += 1;
    console.error("Still old invitations inbox:", inbox);
  } else {
    console.log("Updated invitations inbox:", inbox);
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Invitations and wallet now use one Match-Sponsorship amount. In the npm run dev terminal: Ctrl+C, then rmdir /s /q .next && npm run dev, then Ctrl+F5 on Invitations."
);
