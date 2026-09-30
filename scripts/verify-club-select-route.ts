import { readFileSync } from "fs";
import {
  CLUB_SELECT_PROJECTS_ALIASES,
  CLUB_SELECT_PROJECTS_PATH,
} from "../app/lib/routes";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  CLUB_SELECT_PROJECTS_PATH === "/club/s4p-climate-projects",
  "The dashboard opens a dedicated S4P Climate Projects path"
);
assert(
  CLUB_SELECT_PROJECTS_ALIASES.includes("/club/projects/select"),
  "The previous /club/projects/select address is kept as an alias"
);

const dashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(
  dashboard.includes("href={CLUB_SELECT_PROJECTS_PATH}") &&
    dashboard.includes("next/link"),
  "The blue S4P Climate Projects bar is a real link, not only a client push"
);

const files = [
  "app/club/s4p-climate-projects/page.tsx",
  "app/club/projects/select/page.tsx",
  "app/club/[club]/select/page.tsx",
  "app/club/dashboard/s4p-climate-projects/page.tsx",
];
for (const file of files) {
  const source = readFileSync(file, "utf8");
  assert(
    source.includes("SelectMatchDayProjectsPage") ||
      source.includes("../projects/select/page") ||
      source.includes("../../projects/select/page"),
    `${file} serves the Climate Projects picker`
  );
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("S4P Climate Projects picker is reachable from the dashboard bar.");
