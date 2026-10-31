import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const page = readFileSync("app/club/register/page.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

assert(
  page.includes('data-club-register-scale="club-register-mobile-scale-v1"') &&
    page.includes("px-4 py-8 sm:px-8 sm:py-20") &&
    page.includes("text-3xl font-black sm:mt-6 sm:text-6xl") &&
    page.includes("text-base leading-7") &&
    page.includes("sm:text-xl sm:leading-9") &&
    page.includes("p-4 sm:mt-16 sm:p-10") &&
    page.includes("text-xl font-bold sm:text-3xl") &&
    !page.includes('className="mx-auto max-w-5xl px-8 py-20"') &&
    !page.includes('className="mt-6 text-6xl font-black"'),
  "Club Registration shell uses phone padding and heading sizes"
);

assert(
  page.includes("CLUB_REGISTER_FIELD_CLASS") &&
    page.includes("min-w-0 max-w-full") &&
    page.includes("px-3 py-3 text-base") &&
    page.includes("CLUB_REGISTER_SELECT_CLASS") &&
    page.includes("py-3 pl-3 pr-8") &&
    page.includes("sm:py-4 sm:pl-4 sm:pr-10") &&
    page.includes("overflow-x-hidden") &&
    page.includes("min-w-0 overflow-hidden"),
  "Club Registration fields stay inside the phone width"
);

assert(
  page.includes("CLUB_REGISTER_BACK_CLASS") &&
    page.includes("CLUB_REGISTER_CONTINUE_CLASS") &&
    page.includes("mt-8 flex gap-3 sm:mt-12 sm:justify-between") &&
    page.includes("min-w-0 flex-1") &&
    page.includes("px-4 py-3 text-center") &&
    page.includes("px-3 py-3 text-center text-sm") &&
    !page.includes("mt-12 flex justify-between") &&
    !page.includes("rounded-xl border border-slate-700 px-8 py-3 hover:bg-slate-800"),
  "Back and Continue share the phone row instead of overflowing"
);

assert(
  css.includes("max-width: 100%") &&
    css.includes("min-width: 0") &&
    css.includes("box-sizing: border-box"),
  "Inputs and selects cannot grow past the phone viewport"
);

if (failures.length > 0) {
  console.error("verify-club-register-mobile-scale failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-club-register-mobile-scale: ok");
