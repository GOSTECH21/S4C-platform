"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DESIGN_PREVIEW_PATH } from "@/app/lib/routes";
import {
  DEFAULT_S4P_THEME,
  S4P_THEME_CHANGE_EVENT,
  readStoredS4pTheme,
  restoreQuietWave,
  themeById,
  type S4pThemeId,
} from "@/app/lib/s4p-themes";

export default function ThemeTrialBanner() {
  const [themeId, setThemeId] = useState<S4pThemeId>(DEFAULT_S4P_THEME);

  useEffect(() => {
    function sync() {
      setThemeId(readStoredS4pTheme());
    }
    sync();
    function onStorage(event: StorageEvent) {
      if (event.key === "s4p-theme") sync();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(S4P_THEME_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(S4P_THEME_CHANGE_EVENT, sync);
    };
  }, []);

  if (themeId === DEFAULT_S4P_THEME) return null;

  const theme = themeById(themeId);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-400/25 bg-slate-950/90 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-s4p-ivory">
          Trying <span className="font-semibold text-s4p-mint">{theme.name}</span>
          {" — "}
          {theme.tagline}.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={DESIGN_PREVIEW_PATH} className="text-s4p-mint underline-offset-2 hover:underline">
            All trials
          </Link>
          <button
            type="button"
            className="rounded-md bg-s4p-mark px-3 py-1.5 font-semibold text-slate-950"
            onClick={() => {
              restoreQuietWave();
              setThemeId(DEFAULT_S4P_THEME);
            }}
          >
            Restore current design
          </button>
        </div>
      </div>
    </div>
  );
}
