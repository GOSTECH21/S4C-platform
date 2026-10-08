/** Country options for the Climate Project Form. Scotland and England stay first. */

const PINNED_CLIMATE_PROJECT_COUNTRIES = ["Scotland", "England"] as const;
const EXTRA_HOME_NATIONS = ["Northern Ireland", "Wales"];

function isoRegionNames(): string[] {
  const display = new Intl.DisplayNames(["en"], { type: "region" });
  const names = new Set<string>();
  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = String.fromCharCode(first) + String.fromCharCode(second);
      const name = display.of(code);
      if (name && name !== code) names.add(name);
    }
  }
  for (const extra of EXTRA_HOME_NATIONS) names.add(extra);
  return [...names];
}

export function climateProjectCountries(): string[] {
  const pinned = [...PINNED_CLIMATE_PROJECT_COUNTRIES];
  const rest = isoRegionNames()
    .filter((name) => !pinned.includes(name))
    .sort((left, right) => left.localeCompare(right, "en"));
  return [...pinned, ...rest];
}

export const CLIMATE_PROJECT_COUNTRIES = climateProjectCountries();
