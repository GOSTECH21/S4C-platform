import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const pagePath = join("app", "sponsor", "local", "register", "page.tsx");
const termsPath = join("app", "lib", "local-sponsor.ts");
const logoPath = join("app", "components", "sponsor", "BrandLogoField.tsx");

if (!existsSync(pagePath) || !existsSync(termsPath)) {
  console.error(
    "Run this from the S4C-platform folder (the one that contains app\\sponsor\\local\\register\\page.tsx)."
  );
  process.exit(1);
}

const NEW_INTRO = `      <ol className="mt-4 list-decimal space-y-1 pl-5 text-slate-300">
        <li>Enter all required registration info including business postcode</li>
        <li>Upload your business logo (if available)</li>
        <li>Select the Club you wish to sponsor</li>
        <li>read and agree to Score-4-Planet Terms & Conditions</li>
        <li>Sign & SUBMIT</li>
      </ol>`;

const NEW_TERMS = `export const LOCAL_SPONSOR_TERMS = \`S4P Local Business Climate Sponsor Terms and Conditions: by signing you agree to pay the Match Day amounts you entered (from a minimum of £\${LOCAL_SPONSOR_MIN_GBP} per Match), plus a 10% management fee. Fans can take £0.20 from your Climate Sponsorship Wallet and donate it to a Climate Projects of their choice. Your business name & logo will appear to Fans that takes £0.20 from your Climate Sponsorship Wallet. Your sponsorship payment must be paid for and cleared before it will appear in your Wallet\`;`;

let page = readFileSync(pagePath, "utf8");
const beforeIntro = page.includes("Choose the club") || page.includes("one of the five");

page = page.replace(
  /<h1 className="mt-3 text-4xl font-black">\s*Register as a Local Sponsor\s*<\/h1>\s*<p className="mt-4 text-slate-300">[\s\S]*?<\/p>/,
  `<h1 className="mt-3 text-4xl font-black">
        Register as a Local Sponsor
      </h1>
${NEW_INTRO}`
);

page = page.replace(
  /<p className="mt-4 text-slate-300">\s*\{`Enter all required[\s\S]*?`\}\s*<\/p>/,
  NEW_INTRO
);

if (!page.includes("Upload your business logo (if available)")) {
  console.error("Could not replace the intro. The register page layout may have changed.");
  process.exit(1);
}

page = page.replace(
  /hint="Upload your brand mark[\s\S]*?"/,
  `label="Business logo"
          hint="Upload your business logo if available. Your business name and logo appear to fans who take £0.20 from your Carbon Wallet."`
);

page = page.replace(
  /Terms and Conditions and sign-off/,
  "Score-4-Planet Terms & Conditions"
);

page = page.replace(
  /<p className="text-sm text-slate-300">\s*Terms and Conditions apply[\s\S]*?<\/p>\s*/,
  ""
);

page = page.replace(
  /I have read and agree to the Terms and Conditions\./,
  "I have read and agree to the Score-4-Planet Terms & Conditions."
);

page = page.replace(
  /\{loading \? "Submitting\.\.\." : "SUBMIT sponsorship"\}/,
  `{loading ? "Submitting..." : "Sign & SUBMIT"}`
);

page = page.replace(
  /\{loading \? "Saving\.\.\." : `Confirm from £\$\{LOCAL_SPONSOR_MIN_GBP\}`\}/,
  `{loading ? "Submitting..." : "Sign & SUBMIT"}`
);

page = page.replace(
  /disabled=\{\s*loading \|\| !acceptedTerms \|\| !signerName\.trim\(\) \|\| !logoUrl\s*\}/,
  `disabled={
            loading || !acceptedTerms || !signerName.trim()
          }`
);

page = page.replace(
  /if \(!logoUrl\) \{\s*setError\(\s*"Upload your brand logo[\s\S]*?return;\s*\}/,
  ""
);

writeFileSync(pagePath, page);

let terms = readFileSync(termsPath, "utf8");
if (/export const LOCAL_SPONSOR_TERMS = `[\s\S]*?`;/.test(terms)) {
  terms = terms.replace(/export const LOCAL_SPONSOR_TERMS = `[\s\S]*?`;/, NEW_TERMS);
} else {
  terms = terms.replace(
    /export const LOCAL_SPONSOR_MIN_GBP = 500;/,
    `export const LOCAL_SPONSOR_MIN_GBP = 500;\n\n${NEW_TERMS}`
  );
}
if (!page.includes("LOCAL_SPONSOR_TERMS") && !terms.includes("LOCAL_SPONSOR_TERMS")) {
  console.error("Could not write LOCAL_SPONSOR_TERMS.");
  process.exit(1);
}
writeFileSync(termsPath, terms);

if (existsSync(logoPath)) {
  let logo = readFileSync(logoPath, "utf8");
  if (!logo.includes("label = \"Brand logo\"")) {
    logo = logo.replace(
      /error,\n  hint,\n}: \{/,
      `error,\n  hint,\n  label = "Brand logo",\n}: {`
    );
    logo = logo.replace(
      /hint\?: string;\n\}/,
      `hint?: string;\n  label?: string;\n}`
    );
    logo = logo.replace(
      /<label className="block text-sm text-slate-400">\n      Brand logo/,
      `<label className="block text-sm text-slate-400">\n      {label}`
    );
    writeFileSync(logoPath, logo);
  }
}

const after = readFileSync(pagePath, "utf8");
console.log("Patched app/sponsor/local/register/page.tsx");
console.log("Patched app/lib/local-sponsor.ts");
console.log(
  after.includes("Sign & SUBMIT")
    ? "OK: the file now contains Sign & SUBMIT"
    : "WARNING: Sign & SUBMIT was not found after the patch"
);
console.log(
  beforeIntro
    ? "OK: the old Choose-the-club / five-card intro was present and has been replaced"
    : "The old intro was not found; the numbered steps should still be in the file"
);
