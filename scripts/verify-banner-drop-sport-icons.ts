import { execFileSync } from "child_process";
import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const banner = readFileSync("app/components/home/HomeTopBanner.tsx", "utf8");
const png = readFileSync("public/images/home/global-sports-cluster.png");
const apply = readFileSync("apply-banner-drop-sport-icons.mjs", "utf8");

assert(
  banner.includes('data-banner-cluster="banner-drop-sport-icons-v1"') &&
    banner.includes('src="/images/home/global-sports-cluster.png"') &&
    banner.includes('data-home-five-sports="cricket-fifth-sport-v1"') &&
    banner.includes("{sport.icon}") &&
    banner.includes("{sport.name}"),
  "Homepage keeps the labeled five-sport row and drops the duplicate icons from the cluster artwork"
);

assert(
  png[25] === 6,
  "The cluster artwork stays a transparent PNG so ivory paper shows through"
);

const pixel = execFileSync(
  "python3",
  [
    "-c",
    "from PIL import Image; p=Image.open('public/images/home/global-sports-cluster.png').getpixel((535,132)); print(p[0], p[1], p[2], p[3])",
  ],
  { encoding: "utf8" }
).trim();
const alpha = Number(pixel.split(" ")[3]);
assert(
  alpha < 20,
  `Inline football badge is gone (alpha ${alpha} at 535,132)`
);

const slogan = execFileSync(
  "python3",
  [
    "-c",
    "from PIL import Image; p=Image.open('public/images/home/global-sports-cluster.png').getpixel((720,55)); print(p[0], p[1], p[2], p[3])",
  ],
  { encoding: "utf8" }
).trim();
const [sr, sg, sb, sa] = slogan.split(" ").map(Number);
assert(
  sa > 200 && sg > 180 && sg > sr && sg > sb,
  "Green FIVE MAJOR SPORTS ribbon is still in the artwork"
);

assert(
  apply.includes("cursor/banner-drop-sport-icons-18f9") &&
    apply.includes("public/images/home/global-sports-cluster.png"),
  "PC overlay pulls the cleaned cluster artwork"
);

if (failures.length > 0) {
  console.error("verify-banner-drop-sport-icons failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-banner-drop-sport-icons: ok");
