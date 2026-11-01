import { readFileSync } from "fs";
import { SPORT_CATEGORIES } from "../app/lib/sports";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const picker = readFileSync("app/components/fan/TeamPicker.tsx", "utf8");

assert(
  SPORT_CATEGORIES.map((sport) => sport.name).join(",") ===
    "Football,Rugby,NFL,NBA,Cricket",
  "The five sport categories are Football, Rugby, NFL, NBA and Cricket"
);

assert(
  picker.includes('data-sport-accordion="sport-accordion-v1"') &&
    picker.includes("data-sport-name={group.sport}") &&
    picker.includes("<details") &&
    picker.includes("<summary") &&
    picker.includes("{group.sport}") &&
    picker.includes("leagueCount") &&
    picker.includes("category.summary") &&
    picker.indexOf("<summary") < picker.indexOf("category.summary") &&
    picker.includes("</details>") &&
    !picker.includes("<section") ,
  "Football and every other sport category is a collapsible accordion"
);

if (failures.length > 0) {
  console.error("verify-sport-category-accordion failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-sport-category-accordion: ok");
