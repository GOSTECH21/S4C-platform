import {
  pairSignedSponsorships,
  unsignedMatchOffers,
  sponsorshipFolderStats,
  signedCopyPayload,
  signedCopyDownloadName,
  clubsMatch,
  proposalMatchesClub,
  sponsorshipSelectedProposals,
  sponsorshipFundedProposals,
  bestClubMatch,
  normalizeClubName,
} from "../app/lib/sponsor-dashboard";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const offer = {
  id: "offer-1",
  clubId: "club-united",
  clubName: "Manchester United",
  headline: "Manchester United Match Day — Goal Sponsor",
  matchTitle: "Manchester United Match Day",
  matchDate: "2026-09-20T15:00:00.000Z",
  projectIds: ["gss", "local-1", "local-2", "int-1", "int-2"],
  projects: [
    { id: "gss", name: "Global Schools Solar", estimated_co2: 120 },
    { id: "local-1", name: "Local One", estimated_co2: 40 },
    { id: "local-2", name: "Local Two", estimated_co2: 10 },
    { id: "int-1", name: "Ugandan Cookstove", estimated_co2: 80 },
    { id: "int-2", name: "International Two", estimated_co2: 5 },
  ],
  postedAt: "2026-09-13T10:00:00.000Z",
  sponsorshipAmountGbp: 1000,
};

const otherOffer = {
  ...offer,
  id: "offer-2",
  clubId: "club-arsenal",
  clubName: "Arsenal",
  headline: "Arsenal Match Day — Goal Sponsor",
  postedAt: "2026-09-14T10:00:00.000Z",
};

const signature = {
  id: "sig-1",
  offerId: "offer-1",
  sponsorId: "sponsor-1",
  signerName: "Alex Manager",
  brandName: "Carbon Warriors Limited",
  acceptedTerms: true,
  signedAt: "2026-09-14T11:00:00.000Z",
};

assert(clubsMatch("Manchester United", "Man United") === false, "Exact club helper still matches substrings only when contained");
assert(clubsMatch("Manchester United FC", "Manchester United"), "Club names match when one contains the other");

const pendingBefore = unsignedMatchOffers([offer, otherOffer], []);
assert(pendingBefore.length === 2, "Unsigned inbox shows both club offers before sign-off");

const signed = pairSignedSponsorships([offer, otherOffer], [signature]);
assert(signed.length === 1, "Folder contains only signed offers");
assert(signed[0].offer.id === "offer-1", "Signed folder lodges the United offer");
assert(
  unsignedMatchOffers([offer, otherOffer], [signature]).map((row) => row.id).join(",") ===
    "offer-2",
  "Option 1 inbox drops an offer once it is signed"
);

const stats = sponsorshipFolderStats(signed, 17);
assert(stats.projectCount === 5, "Dashboard counts the five signed Climate Projects");
assert(stats.carbonTonnes === 255, "Dashboard sums carbon impact from signed projects");
assert(stats.expenditureGbp === 1000, "Dashboard records expenditure for the signed offer");
assert(stats.fanVotes === 17, "Dashboard shows fans who voted and saw the brand");

const clubCopy = pairSignedSponsorships([offer, otherOffer], [signature], {
  clubId: "club-united",
  clubName: "Manchester United",
});
assert(clubCopy.length === 1, "Club SD receives the signed copy for their club");
assert(
  pairSignedSponsorships([offer, otherOffer], [signature], {
    clubId: "club-arsenal",
    clubName: "Arsenal",
  }).length === 0,
  "Arsenal SD does not receive United's signed copy"
);

const payload = signedCopyPayload(signed[0]);
assert(payload.brand === "Carbon Warriors Limited", "Signed copy names the brand");
assert(payload.signedBy === "Alex Manager", "Signed copy names the signer");
assert(payload.climateProjects.length === 5, "Signed copy lists the five projects");
assert(
  signedCopyDownloadName("Manchester United", "Carbon Warriors Limited").includes(
    "s4p-signed-sponsorship"
  ),
  "Club can download a named signed copy file"
);

assert(
  proposalMatchesClub(
    { clubId: "name:Arsenal", clubName: "Arsenal" },
    "club-uuid",
    "Arsenal FC"
  ),
  "Sponsor list sent to Arsenal appears on the Arsenal FC dashboard"
);
assert(
  !proposalMatchesClub(
    { clubId: "name:Arsenal", clubName: "Arsenal" },
    "other-id",
    "Manchester United"
  ),
  "Arsenal sponsor list does not appear on United's dashboard"
);

const incoming = [
  { clubName: "Arsenal", status: "sent" },
  { clubName: "Arsenal", status: "posted" },
];
assert(
  sponsorshipSelectedProposals(incoming).length === 1,
  "Unposted Option 2 lists are Sponsorship Selected Projects"
);
assert(
  sponsorshipFundedProposals(incoming).length === 1,
  "Posted Option 2 lists are Sponsorship Funded Projects"
);

assert(
  normalizeClubName("Arsenal FC") === "arsenal",
  "Arsenal FC normalizes to the same club key as Arsenal"
);
assert(
  clubsMatch("Hearts of Midlothian FC", "Hearts"),
  "Hearts picker name matches the registered club title"
);
assert(
  bestClubMatch(
    [{ name: "Arsenal Women" }, { name: "Arsenal FC" }],
    "Arsenal"
  )?.name === "Arsenal FC",
  "Arsenal picker resolves to Arsenal FC, not Arsenal Women"
);

if (failures.length > 0) {
  console.error("verify-sponsor-dashboard failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-sponsor-dashboard: ok");
