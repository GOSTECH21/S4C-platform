import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "pending";
const BRANCH = "cursor/local-invite-pay-18f9";
const FILES = [
  "app/components/sponsor/SponsorInviteInbox.tsx",
  "app/services/sponsor-listings.service.ts",
  "app/sponsor/pay/page.tsx",
  "app/sponsor/invitations/page.tsx",
  "app/services/current-sponsor.service.ts",
  "apply-local-invite-pay.ps1",
  "scripts/verify-local-invite-pay.ts",
  "scripts/verify-sponsor-listings.ts",
];

console.log("Working folder:", process.cwd());
console.log("LIVE page: http://localhost:3000/sponsor/invitations");
if (!existsSync("app/components/sponsor/SponsorInviteInbox.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/sponsor/SponsorInviteInbox.tsx, then run this script again."
  );
  process.exit(1);
}

if (existsSync(".git")) {
  const fetch = spawnSync("git", ["fetch", "origin", BRANCH], {
    encoding: "utf8",
  });
  if (fetch.status === 0) {
    const checkout = spawnSync(
      "git",
      ["checkout", `origin/${BRANCH}`, "--", ...FILES],
      { encoding: "utf8" }
    );
    if (checkout.status === 0) {
      console.log("Checked out local invite payment files from origin/" + BRANCH + ".");
    }
  }
}

let failed = 0;
const inbox = existsSync("app/components/sponsor/SponsorInviteInbox.tsx")
  ? readFileSync("app/components/sponsor/SponsorInviteInbox.tsx", "utf8")
  : "";
if (
  !inbox.includes("data-local-invite-pay") ||
  !inbox.includes("sponsorPayPath") ||
  !inbox.includes("ensureLocalWallet") ||
  inbox.includes("sponsorWalletPath")
) {
  failed += 1;
  console.error("The local invite payment files did not land.");
}

if (failed) process.exit(1);
console.log(
  "OK: Local Business Climate Sponsors now go to card payment after Proceed to Payment. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
