export const S4P_THEME_STORAGE_KEY = "s4p-theme-v2";
export const S4P_THEME_CHANGE_EVENT = "s4p-theme-change";
export const DEFAULT_S4P_THEME = "ivory-canvas";

export const S4P_THEMES = [
  {
    id: "ivory-canvas",
    name: "Ivory canvas",
    restore: true,
    tagline: "Current design — paper, black and green",
    description:
      "Off-white paper across the platform. Copy is black or green only. Lime stays on buttons.",
    wallpaper: null,
  },
  {
    id: "quiet-wave",
    name: "Quiet wave",
    restore: false,
    tagline: "The previous navy–teal wave",
    description:
      "Darkened navy–teal–forest wave, ivory headlines, mint on dark blue, lime only on buttons and selected rows.",
    wallpaper: "/images/themes/quiet-wave.png",
  },
  {
    id: "vivid-wave",
    name: "Vivid wave",
    restore: false,
    tagline: "The original Image 2",
    description:
      "The brighter green–navy wave before it was quieted. Same ivory and mint copy, with more of the original colour showing through.",
    wallpaper: "/images/themes/vivid-wave.png",
  },
  {
    id: "navy-night",
    name: "Navy night",
    restore: false,
    tagline: "Deep navy, no wave",
    description:
      "A still night sky in navy and teal. No wallpaper — just atmosphere, ivory type, and lime accents.",
    wallpaper: null,
  },
  {
    id: "forest-dusk",
    name: "Forest dusk",
    restore: false,
    tagline: "Heavier emerald overlay",
    description:
      "The quiet wave with a denser forest wash. More green in the atmosphere, same readable navy glass.",
    wallpaper: "/images/themes/quiet-wave.png",
  },
] as const;

export type S4pThemeId = (typeof S4P_THEMES)[number]["id"];

const THEME_IDS: readonly S4pThemeId[] = S4P_THEMES.map((theme) => theme.id);

export function isS4pThemeId(value: string | null | undefined): value is S4pThemeId {
  return Boolean(value && (THEME_IDS as readonly string[]).includes(value));
}

export function themeById(id: S4pThemeId) {
  return S4P_THEMES.find((theme) => theme.id === id) ?? S4P_THEMES[0];
}

export function applyS4pTheme(id: S4pThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
  try {
    window.localStorage.setItem(S4P_THEME_STORAGE_KEY, id);
  } catch {
    // Private mode still shows the trial for this page load.
  }
  window.dispatchEvent(new Event(S4P_THEME_CHANGE_EVENT));
}

export function restoreDefaultTheme() {
  applyS4pTheme(DEFAULT_S4P_THEME);
}

/** @deprecated Use restoreDefaultTheme — Ivory canvas is the live restore point. */
export function restoreQuietWave() {
  restoreDefaultTheme();
}

export function readStoredS4pTheme(): S4pThemeId {
  if (typeof window === "undefined") return DEFAULT_S4P_THEME;
  try {
    const stored = window.localStorage.getItem(S4P_THEME_STORAGE_KEY);
    if (isS4pThemeId(stored)) return stored;
  } catch {
    // Fall through to the restore point.
  }
  return DEFAULT_S4P_THEME;
}

/** Inline head script: apply a saved trial before first paint, with an allowlist. */
export const S4P_THEME_BOOT_SCRIPT = `(function(){try{var a=${JSON.stringify(
  THEME_IDS
)};var t=localStorage.getItem(${JSON.stringify(
  S4P_THEME_STORAGE_KEY
)});if(t&&a.indexOf(t)!==-1)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
