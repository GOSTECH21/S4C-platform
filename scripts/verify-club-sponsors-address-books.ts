import { readFileSync } from "fs";
import {
  CLUB_ADDRESS_BOOKS_ID,
  CLUB_ADMIN_ADDRESS_BOOKS_PATH,
  CLUB_EXISTING_SPONSORS_ID,
  CLUB_SPONSORS_ADDRESS_BOOKS_PATH,
  CLUB_SPONSORS_PATH,
} from "../app/lib/routes";
import { SEND_INVITATION_LABEL } from "../app/lib/partner-projects";
import { EXISTING_SPONSORS_HEADING } from "../app/lib/sponsor-listings";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  SEND_INVITATION_LABEL === "Send Invitation to Sponsors",
  "The green tab is Send Invitation to Sponsors"
);
assert(
  EXISTING_SPONSORS_HEADING === "Existing Sponsors" &&
    CLUB_ADDRESS_BOOKS_ID === "address-books" &&
    CLUB_EXISTING_SPONSORS_ID === "existing-sponsors" &&
    CLUB_SPONSORS_ADDRESS_BOOKS_PATH === `${CLUB_SPONSORS_PATH}#address-books` &&
    CLUB_ADMIN_ADDRESS_BOOKS_PATH === CLUB_SPONSORS_ADDRESS_BOOKS_PATH,
  "Address Books hash lives on Sponsors, with Existing Sponsors underneath"
);

const sponsors = readFileSync("app/club/sponsors/page.tsx", "utf8");
const listings = readFileSync(
  "app/components/club/ClubSponsorsListings.tsx",
  "utf8"
);
const books = readFileSync(
  "app/components/club/ClubSponsorsAddressBooks.tsx",
  "utf8"
);
const admin = readFileSync("app/club/admin/page.tsx", "utf8");
const dashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
const picker = readFileSync("app/club/projects/select/page.tsx", "utf8");
const preview = readFileSync(
  "app/preview/club-sponsors-address-books/page.tsx",
  "utf8"
);
const overlay = readFileSync("apply-club-sponsors-address-books.mjs", "utf8");

assert(
  sponsors.includes("ClubSponsorsAddressBooks") &&
    sponsors.includes("CLUB_ADDRESS_BOOKS_ID") &&
    sponsors.includes("CLUB_EXISTING_SPONSORS_ID") &&
    listings.includes("EXISTING_SPONSORS_HEADING") &&
    listings.includes("CLUB_EXISTING_SPONSORS_ID") &&
    !listings.includes("My Admin Address Books") &&
    !listings.includes("onInviteAll") &&
    listings.includes("club-sponsors-invite-counts-v1") &&
    listings.includes("meetsInviteMinimum") &&
    books.includes("club-sponsors-address-books-v1") &&
    books.includes('kind="lead"') &&
    books.includes('kind="local"') &&
    books.includes("Go to"),
  "Sponsors holds Address Book registration and Existing Sponsors for Lead and Local"
);
assert(
  !admin.includes("ClubAddressBookPanel") &&
    !admin.includes("CLUB_ADMIN_ADDRESS_BOOKS_ID") &&
    admin.includes("ClubAdminLookbackAndCilt"),
  "My Admin no longer shows Address Books"
);
assert(
  dashboard.includes("SEND_INVITATION_LABEL") &&
    dashboard.includes("CLUB_SPONSORS_ADDRESS_BOOKS_PATH") &&
    dashboard.includes("data-send-invitation-to-sponsors") &&
    picker.includes("CLUB_SPONSORS_ADDRESS_BOOKS_PATH") &&
    picker.includes("SEND_INVITATION_LABEL") &&
    picker.includes("in Sponsors") &&
    !picker.includes("in My Admin"),
  "Send Invitation to Sponsors always lands on the Sponsors Address Book"
);
assert(
  preview.includes("ClubSponsorsAddressBooks") &&
    preview.includes("ClubSponsorsListings") &&
    overlay.includes('STAMP = "club-sponsors-address-books-v1"') &&
    overlay.includes("git fetch") &&
    overlay.includes("Working folder:") &&
    overlay.includes('rmSync(".next"') &&
    overlay.includes("app/club/sponsors/page.tsx") &&
    overlay.includes("app/club/dashboard/page.tsx"),
  "Preview and PC overlay cover the Sponsors Address Book move"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Address Books sit on Sponsors with Existing Sponsors; Send Invitation to Sponsors opens that section."
);
