/** Lime tab chips — selected is solid mark green, idle is a green outline, never black. */

export const S4P_SPONSOR_MARK = "S4P SPONSOR";


export function s4pTabClass(active: boolean): string {
  return active
    ? "border border-s4p-mark bg-s4p-mark text-slate-950 hover:brightness-110"
    : "border border-s4p-mark bg-s4p-mark/15 text-slate-950 hover:bg-s4p-mark/30";
}

/** Invitations tab flashes for Lead, Local, and Philanthropist while a Match Day invite waits. */
export function inviteTabShouldFlash(count: number): boolean {
  return Math.max(0, Math.round(Number(count) || 0)) > 0;
}

export function inviteTabFlashClass(count: number): string {
  return inviteTabShouldFlash(count) ? "s4p-invite-flash" : "";
}

/** Select / Selected action bar — always lime with black copy, never a dark fill. */
export function s4pActionBarClass(disabled = false): string {
  return disabled
    ? "border border-s4p-mark bg-s4p-mark/40 text-slate-950 cursor-not-allowed"
    : "border border-s4p-mark bg-s4p-mark text-slate-950 hover:brightness-110";
}
