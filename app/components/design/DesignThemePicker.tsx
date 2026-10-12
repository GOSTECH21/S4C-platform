"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_S4P_THEME,
  S4P_THEME_CHANGE_EVENT,
  S4P_THEMES,
  applyS4pTheme,
  readStoredS4pTheme,
  restoreDefaultTheme,
  type S4pThemeId,
} from "@/app/lib/s4p-themes";

const SWATCH: Record<S4pThemeId, string> = {
  "quiet-wave":
    "linear-gradient(168deg, rgb(8 42 70 / 0.62), rgb(11 74 74 / 0.45), rgb(23 107 74 / 0.5)), url('/images/themes/quiet-wave.png')",
  "vivid-wave":
    "linear-gradient(168deg, rgb(8 42 70 / 0.22), rgb(11 74 74 / 0.14), rgb(23 107 74 / 0.18)), url('/images/themes/vivid-wave.png')",
  "navy-night": "linear-gradient(168deg, #051525 0%, #082a46 52%, #0a3040 100%)",
  "forest-dusk":
    "linear-gradient(168deg, rgb(6 40 24 / 0.62), rgb(11 74 50 / 0.48), rgb(26 122 72 / 0.42)), url('/images/themes/quiet-wave.png')",
  "ivory-canvas": "linear-gradient(180deg, #f7f4e8, #efe8d4)",
};

export default function DesignThemePicker() {
  const [active, setActive] = useState<S4pThemeId>(DEFAULT_S4P_THEME);

  useEffect(() => {
    function sync() {
      setActive(readStoredS4pTheme());
    }
    sync();
    window.addEventListener(S4P_THEME_CHANGE_EVENT, sync);
    return () => window.removeEventListener(S4P_THEME_CHANGE_EVENT, sync);
  }, []);

  function choose(id: S4pThemeId) {
    applyS4pTheme(id);
    setActive(id);
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="rounded-lg bg-s4p-mark px-5 py-3 font-semibold text-slate-950"
          onClick={() => {
            restoreDefaultTheme();
            setActive(DEFAULT_S4P_THEME);
          }}
        >
          Restore current design
        </button>
        <Link href="/" className="text-s4p-mint underline-offset-2 hover:underline">
          Open the homepage in this look
        </Link>
      </div>

      <ul className="grid gap-6 md:grid-cols-2">
        {S4P_THEMES.map((theme) => {
          const selected = active === theme.id;
          return (
            <li
              key={theme.id}
              className={`overflow-hidden rounded-2xl border ${
                selected ? "border-s4p-mark ring-2 ring-s4p-mark" : "border-emerald-400/25"
              } bg-slate-950/70`}
            >
              <div
                className="h-36 bg-cover bg-center"
                style={{ backgroundImage: SWATCH[theme.id] }}
                aria-hidden
              />
              <div className="space-y-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-s4p-mint">
                  {theme.restore ? "Backup / restore" : "Trial"}
                </p>
                <h2 className="text-2xl font-black text-s4p-ivory">{theme.name}</h2>
                <p className="text-sm text-s4p-mint">{theme.tagline}</p>
                <p className="text-sm leading-6 text-slate-300">{theme.description}</p>
                <button
                  type="button"
                  className={`rounded-lg px-4 py-2 font-semibold ${
                    selected
                      ? "bg-s4p-mark text-slate-950"
                      : "border border-emerald-400/40 text-s4p-ivory"
                  }`}
                  onClick={() => choose(theme.id)}
                >
                  {selected ? "Using this look" : "Try this look"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
