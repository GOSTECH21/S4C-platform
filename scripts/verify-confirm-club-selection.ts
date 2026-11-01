import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const fixtures = readFileSync(
  "app/components/home/SelectMatchFixtures.tsx",
  "utf8"
);
const select = readFileSync(
  "app/components/home/HowS4pSelectMatch.tsx",
  "utf8"
);

assert(
  fixtures.includes("pendingClub") &&
    fixtures.includes("confirmClub") &&
    fixtures.includes("appliedInitialClub") &&
    fixtures.includes("value={pendingClub}") &&
    fixtures.includes("setPendingClub(event.target.value)") &&
    !fixtures.includes("defaultValue={club}") &&
    !fixtures.includes("onChange={(event) => {\n            const next = event.target.value;\n            setClub(next);\n            void load(next);") &&
    fixtures.includes("confirmClub(selectEl?.value.trim() || pendingClub)") &&
    fixtures.includes("pickerRef") &&
    fixtures.includes("ref={pickerRef}") &&
    fixtures.indexOf("appliedInitialClub.current === next") <
      fixtures.indexOf("setClub(next)"),
  "Dropdown changes stay pending until Confirm / See upcoming matches, and initialClub cannot snap the club back"
);

assert(
  select.includes('data-confirm-club-selection="confirm-club-selection-v1"') &&
    select.includes("Confirm your Selection") &&
    select.includes("<ConfirmClubSelection />") &&
    select.includes("confirmClub(pendingClub)"),
  "Confirm your Selection sits at the bottom of Select Match and honours the chosen club"
);

if (failures.length > 0) {
  console.error("verify-confirm-club-selection failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-confirm-club-selection: ok");
