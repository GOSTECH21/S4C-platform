import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const fan = readFileSync("app/supporter/dashboard/predict/page.tsx", "utf8");
const section = readFileSync(
  "app/components/home/HowS4pPredictForPlanet.tsx",
  "utf8"
);
const play = readFileSync(
  "app/components/fan/PredictForPlanetPlay.tsx",
  "utf8"
);
const preview = readFileSync("app/preview/fan-p4p/page.tsx", "utf8");
const designPreview = readFileSync(
  "app/preview/predict-for-planet/page.tsx",
  "utf8"
);

assert(
  fan.includes("showPhone={false}") &&
    fan.includes("PredictForPlanetPlay") &&
    fan.includes("HowS4pPredictForPlanet") &&
    fan.includes("p4p-fan-drop-overlay-v1") &&
    !fan.includes("PredictForPlanetPhone"),
  "Logged-in fan P4P drops the duplicate demo phone overlay"
);
assert(
  preview.includes("showPhone={false}") &&
    preview.includes("PredictForPlanetPlay") &&
    preview.includes("p4p-fan-drop-overlay-v1") &&
    preview.includes("seedWallet") &&
    !preview.includes("PredictForPlanetPhone"),
  "Fan P4P preview is the logged-in tab without the demo phone"
);
assert(
  !designPreview.includes("showPhone={false}") &&
    designPreview.includes("HowS4pPredictForPlanet") &&
    designPreview.includes("PredictForPlanetPlay"),
  "Design preview still shows the demo phone beside the live board"
);

assert(
  section.includes("showPhone = true") &&
    section.includes("{showPhone ? (") &&
    section.includes("PredictForPlanetPhone") &&
    section.includes("PredictForPlanetPanel") &&
    section.includes("p4p-fan-drop-overlay-v1"),
  "The P4P intro panel can still show a demo phone where the live board is not present"
);

assert(
  play.includes("P4P_LIVE_CHALLENGE_LABEL") &&
    play.includes("P4P_MAKE_PREDICTION_LABEL") &&
    play.includes("P4P_CHOOSE_PROJECT_LABEL") &&
    play.includes("FAN_CARBON_WALLET_LABEL"),
  "The live P4P challenge, predictions, climate project and fan wallet stay on the fan tab"
);

if (failures.length > 0) {
  console.error("verify-fan-p4p-drop-overlay failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-fan-p4p-drop-overlay: ok");
