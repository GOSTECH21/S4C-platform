import { HOME_STAKEHOLDERS } from "../app/lib/home-stakeholders";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const local = HOME_STAKEHOLDERS.find((card) => card.title === "Local Businesses");
const copy =
  "Fund climate projects through Match-Day sponsorship and attract sports fans as customers.";

assert(
  local?.tabDescription === copy &&
    local?.shortDescription === copy &&
    local?.description.includes(
      "fund climate projects through Match-Day sponsorship and attract sports fans as customers"
    ) &&
    !local?.tabDescription.includes("through match-day sponsorship.") &&
    local.shortDescription.length < local.description.length,
  "Local Businesses card uses Match-Day sponsorship and attract sports fans copy"
);

if (failures.length > 0) {
  console.error("verify-local-sponsor-fans-copy failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-local-sponsor-fans-copy: ok");
