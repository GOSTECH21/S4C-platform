/** Lime tab chips — selected is solid mark green, idle is a green outline, never black. */

export function s4pTabClass(active: boolean): string {
  return active
    ? "bg-s4p-mark text-slate-950 hover:brightness-110"
    : "border border-s4p-mark bg-s4p-mark/15 text-slate-950 hover:bg-s4p-mark/30";
}
