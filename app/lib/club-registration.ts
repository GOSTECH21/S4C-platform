/** Club account registration shown on My Admin. */

export const CLUB_REGISTRATION_STATUS_LABEL = "Club registration";
export const CLUB_REGISTRATION_PENDING_LABEL = "Pending";
export const CLUB_REGISTRATION_APPROVED_LABEL = "Approved";
export const CLUB_DETAILS_ACCORDION_STAMP = "club-admin-club-details-v1";
export const CLUB_REPRESENTATIVE_ACCORDION_STAMP =
  "club-admin-representative-v1";

export function clubRegistrationStatusCaption(): string {
  return "Pending until Score-For-Planet confirms this Club. Approved when the Club is live.";
}

export function clubRegistrationStatusLabel(
  status: string | null | undefined
): string {
  const key = String(status ?? "").trim().toLowerCase();
  if (!key || key === "pending") return CLUB_REGISTRATION_PENDING_LABEL;
  if (
    key === "approved" ||
    key === "active" ||
    key === "confirmed" ||
    key === "live"
  ) {
    return CLUB_REGISTRATION_APPROVED_LABEL;
  }
  return key.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
