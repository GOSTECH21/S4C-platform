import { existsSync, readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  existsSync("public/images/platform-background.png"),
  "The quiet-wave wallpaper is still backed up"
);
assert(
  existsSync("public/images/home/s4p-mark.png") &&
    readFileSync("public/images/home/s4p-mark.png")[25] === 6,
  "The S4P mark is a transparent PNG so the paper shows through"
);
assert(
  existsSync("public/images/home/every-score-counts-banner.png"),
  "The Every Score Counts banner artwork is in public/images/home"
);
assert(
  existsSync("public/images/home/access-join-phone.png"),
  "The Access & Join phone artwork is in public/images/home"
);
assert(
  existsSync("public/images/home/select-match-phone.png"),
  "The Select Match phone artwork is in public/images/home"
);
assert(
  existsSync("public/images/home/how-youre-supporting-phone.png"),
  "The How You're Supporting phone artwork is in public/images/home"
);
assert(
  existsSync("public/images/home/plan-your-travel-phone.png"),
  "The Plan Your Travel phone artwork is in public/images/home"
);
assert(
  existsSync("public/images/home/match-day-climate-mission-phone.png"),
  "The Match Day Climate Mission phone artwork is in public/images/home"
);
assert(
  existsSync("public/images/home/choose-direct-impact-phone.png"),
  "The Choose & Direct Your Impact phone artwork is in public/images/home"
);
assert(
  existsSync("public/images/home/s4p-lockup.png") &&
    readFileSync("public/images/home/s4p-lockup.png")[25] === 6,
  "The default S4P lockup is a transparent PNG so the paper shows through"
);

const css = readFileSync("app/globals.css", "utf8");
assert(css.includes("--s4p-canvas: #f7f4e8"), "The live canvas is ivory paper");
assert(css.includes("--s4p-ink: #000000"), "Primary copy is true black");
assert(css.includes("--s4p-mint: #0c5c2c"), "Accent copy is a darker green on paper");
assert(css.includes("--s4p-gold: #0c5c2c"), "The old gold token is the same green");
assert(css.includes("-webkit-font-smoothing: auto"), "Ivory type uses subpixel smoothing so it stays sharp");
assert(
  !readFileSync("app/layout.tsx", "utf8").includes("antialiased"),
  "The greying antialiased class is off the live canvas"
);
assert(
  !readFileSync("app/components/home/HomeFrontPage.tsx", "utf8").includes("drop-shadow md:text-6xl"),
  "Hero headlines no longer sit in a grey drop-shadow"
);
assert(css.includes("--color-s4p-mark: #5bc662"), "S4P mark green stays for buttons");
assert(
  !css.includes("s4p-ticker 96s") &&
    readFileSync("app/components/home/HowItWorks.tsx", "utf8").includes(
      'label="Next step"'
    ) &&
    !readFileSync("app/components/home/HowItWorks.tsx", "utf8").includes(
      "s4p-ticker"
    ),
  "How S4P Works is a one-step viewer with Previous and Next, not a ticker tape"
);
assert(css.includes(".s4p-navy-panel"), "Info panels sit on paper glass");
assert(
  css.includes('[class*="bg-black/"]') &&
    css.includes('[class*="bg-emerald-950"]') &&
    css.includes('[class~="bg-green-400"]') &&
    css.includes('[class*="bg-green-950"]') &&
    css.includes('[class*="bg-zinc-900"]'),
  "Dark green, black and zinc fills remap to paper; lime stays on buttons"
);
assert(
  readFileSync("app/components/fan/MyTeamsList.tsx", "utf8").includes(
    "border-emerald-400/40 bg-slate-900"
  ) &&
    !readFileSync("app/components/fan/MyTeamsList.tsx", "utf8").includes(
      "bg-green-400 p-4"
    ),
  "My Teams club cards sit on paper, not mint-green fills"
);
assert(css.includes('url("/images/platform-background.png")'), "Quiet wave remains as a trial wallpaper");
assert(css.includes("html[data-theme=\"quiet-wave\"]"), "Quiet wave can still be tried");
assert(!css.includes("#0c3229"), "The old pitch-dusk canvas token is gone");

const home = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
const banner = readFileSync("app/components/home/HomeTopBanner.tsx", "utf8");
assert(!home.includes("#04140f") && !home.includes("#07150f"), "Home no longer uses near-black overlays");
assert(!home.includes("hero.png"), "Home no longer covers the canvas with the stadium hero photo");
assert(
  !home.includes("Turn Goals") && !home.includes('text-s4p-mint">into Action'),
  "The Turn Goals into Action hero is off the new front page"
);
assert(
  banner.includes("SCORE-FOR-PLANET") &&
    banner.includes("Every score counts") &&
    banner.includes("Every fan counts") &&
    !home.includes("Sport creates the moment."),
  "SCORE-FOR-PLANET lockup replaces the old Sport creates the moment stack"
);
assert(
  home.includes("HomeJoinMission") &&
    home.indexOf("HomeJoinMission") < home.indexOf("HowItWorks"),
  "Join your team's climate mission sits above How S4P Works"
);
assert(
  readFileSync("app/components/home/HowItWorks.tsx", "utf8").includes(
    "/images/home/access-join-phone.png"
  ) &&
    readFileSync("app/components/home/HowItWorks.tsx", "utf8").includes(
      "/images/home/select-match-phone.png"
    ) &&
    readFileSync("app/components/home/HowItWorks.tsx", "utf8").includes(
      "/images/home/how-youre-supporting-phone.png"
    ) &&
    readFileSync("app/components/home/HowItWorks.tsx", "utf8").includes(
      "/images/home/plan-your-travel-phone.png"
    ) &&
    readFileSync("app/components/home/HowItWorks.tsx", "utf8").includes(
      "/images/home/match-day-climate-mission-phone.png"
    ) &&
    readFileSync("app/components/home/HowItWorks.tsx", "utf8").includes(
      "/images/home/choose-direct-impact-phone.png"
    ) &&
    banner.includes('src="/images/home/s4p-lockup.png"') &&
    banner.includes("Every score counts") &&
    banner.includes("#5bc662") &&
    !banner.includes("every-score-counts-banner.png") &&
    !banner.includes("#041018") &&
    !banner.includes("bg-black"),
  "Home uses the S4P lockup on an ivory strip and the six How S4P Works phones"
);
assert(!home.includes("drop-shadow-2xl"), "The mark has no dark box-shadow behind it");
assert(
  readFileSync("app/components/home/HowItWorks.tsx", "utf8").includes("unoptimized"),
  "The join phone is served as the PNG, not a flattened optimized copy"
);

const tables = readFileSync("app/components/home/S4pImpactTables.tsx", "utf8");
assert(tables.includes("s4p-navy-panel"), "CILT sits on a panel");
assert(tables.includes("text-s4p-mint"), "CILT metrics are green");
assert(!tables.includes("text-amber-300"), "CILT no longer uses gold metric text");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Ivory canvas: black copy, one green, lime reserved for buttons.");
