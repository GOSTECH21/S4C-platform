import { existsSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const ROOT = resolve(".");
const FORBIDDEN = [
  "app/lib/sporting-calendar.ts",
  "app/data/published-fixtures.json",
  "app/services/next-fixtures.service.ts",
];

function resolveImport(fromFile: string, spec: string): string | null {
  let base: string | null = null;
  if (spec.startsWith("@/")) {
    base = join(ROOT, spec.slice(2));
  } else if (spec.startsWith(".")) {
    base = join(dirname(fromFile), spec);
  } else {
    return null;
  }
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.json`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  return (
    candidates.find((path) => existsSync(path) && statSync(path).isFile()) ??
    null
  );
}

function valueImports(source: string): string[] {
  const specs: string[] = [];
  const fromRe =
    /(?:^|\n)(?:import|export)\s+(?!type\s)[\s\S]*?from\s+["']([^"']+)["']/g;
  const sideRe = /(?:^|\n)import\s+["']([^"']+)["']/g;
  const dynRe = /import\(\s*["']([^"']+)["']\s*\)/g;
  for (const re of [fromRe, sideRe, dynRe]) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(source))) {
      specs.push(match[1]);
    }
  }
  return specs;
}

function walk(entry: string): string[] {
  const seen = new Set<string>();
  const queue = [resolve(ROOT, entry)];
  while (queue.length > 0) {
    const file = queue.pop();
    if (!file || seen.has(file)) continue;
    seen.add(file);
    if (!/\.(ts|tsx|js)$/.test(file)) continue;
    const source = readFileSync(file, "utf8");
    for (const spec of valueImports(source)) {
      const next = resolveImport(file, spec);
      if (next && !seen.has(next)) queue.push(next);
    }
  }
  return [...seen].map((path) => path.slice(ROOT.length + 1));
}

const predict = readFileSync(
  "app/supporter/dashboard/predict/page.tsx",
  "utf8"
);
const fanNav = readFileSync(
  "app/dashboard/supporter/components/FanNav.tsx",
  "utf8"
);
const votes = readFileSync("app/services/votes.service.ts", "utf8");
const session = readFileSync("app/services/fan-session.service.ts", "utf8");
const clubMatchDay = readFileSync(
  "app/services/club-match-day.service.ts",
  "utf8"
);

assert(
  predict.includes("@/app/services/fan-session.service") &&
    !predict.includes("votes.service"),
  "P4P loads getOrCreateSupporter from the thin fan session helper"
);
assert(
  fanNav.includes("@/app/services/fan-session.service") &&
    !fanNav.includes("votes.service"),
  "Fan nav loads the supporter name without the votes/fixtures module"
);
assert(
  session.includes("getOrCreateSupporter") &&
    session.includes("resolvedFullName") &&
    !session.includes("next-fixtures") &&
    !session.includes("sporting-calendar") &&
    !session.includes("published-fixtures"),
  "Fan session helper does not import the published fixture catalogue"
);
assert(
  votes.includes("/api/sponsor/club-fixtures") &&
    !votes.includes("next-fixtures.service") &&
    !votes.includes("sporting-calendar") &&
    !votes.includes("published-fixtures"),
  "My S4P headlines fetch club fixtures from the API instead of bundling them"
);
assert(
  readFileSync("app/services/climate-sponsors.service.ts", "utf8").includes(
    "global-match-picks"
  ) &&
    !readFileSync("app/services/climate-sponsors.service.ts", "utf8").includes(
      "global-match-day"
    ),
  "Climate sponsor logos do not import the published fixture catalogue"
);
assert(
  !readFileSync("app/components/home/SelectMatchFixtures.tsx", "utf8").includes(
    'from "@/app/services/club-match-day.service"'
  ),
  "Select Match does not statically import the club match-day module"
);
assert(
  /import type \{ ClimateProject \} from ["']\.\/votes\.service["']/.test(
    clubMatchDay
  ) && clubMatchDay.includes("isFeaturedClimateProject"),
  "Select Match does not value-import votes.service"
);

const reachable = new Set([
  ...walk("app/supporter/dashboard/predict/page.tsx"),
  ...walk("app/dashboard/supporter/components/FanNav.tsx"),
]);
for (const forbidden of FORBIDDEN) {
  assert(
    !reachable.has(forbidden),
    `Fan login / P4P must not import ${forbidden}`
  );
}

if (failures.length > 0) {
  console.error("verify-fan-login-bundle failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-fan-login-bundle: ok");
