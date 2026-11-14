/* philanthropist-register-v1 */

export const PHILANTHROPIST_STORAGE = "s4p.sponsor.philanthropist";
export const PHILANTHROPIST_JOB_TITLE = "Philanthropist";
export const PHILANTHROPIST_KICKER = "Philanthropist";
export const PHILANTHROPIST_REGISTER_HEADING = "Register as a Philanthropist";
export const PHILANTHROPIST_REGISTER_COPY =
  "Make a climate donation (any amount per match) and let fans direct your gift to club-approved climate projects that help your team climb the Climate Impact League Table (CILT).";
export const PHILANTHROPIST_REGISTER_CTA = "Register as Philanthropist";
export const PHILANTHROPIST_NAV_REGISTER = "Register as Philanthropist";
export const PHILANTHROPIST_HOME_HEADING = "Your philanthropic climate gift";
export const PHILANTHROPIST_HOME_EMPTY =
  "Register as a Philanthropist to make a climate donation. Fans of your chosen team direct that gift to club-approved climate projects.";

export type PhilanthropistRecord = {
  name: string;
  organisation: string;
  email: string;
  clubName: string;
  giftGbp: number;
  createdAt: string;
};

export function isPhilanthropistJobTitle(value: string | null | undefined): boolean {
  return /philanthropist/i.test(String(value ?? "").trim());
}

export function philanthropistDisplayName(record: PhilanthropistRecord): string {
  return record.organisation.trim() || record.name.trim();
}

export function readPhilanthropistRecord(): PhilanthropistRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PHILANTHROPIST_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PhilanthropistRecord>;
    const name = String(parsed.name ?? "").trim();
    const clubName = String(parsed.clubName ?? "").trim();
    const giftGbp = Number(parsed.giftGbp);
    if (!name || !clubName || !Number.isFinite(giftGbp) || giftGbp < 1) {
      return null;
    }
    return {
      name,
      organisation: String(parsed.organisation ?? "").trim(),
      email: String(parsed.email ?? "").trim(),
      clubName,
      giftGbp,
      createdAt: String(parsed.createdAt ?? new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

export function writePhilanthropistRecord(record: PhilanthropistRecord): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PHILANTHROPIST_STORAGE, JSON.stringify(record));
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    const previous = raw
      ? (JSON.parse(raw) as Record<string, unknown>)
      : {};
    window.localStorage.setItem(
      "s4p.sponsor.profile",
      JSON.stringify({
        ...previous,
        companyName: philanthropistDisplayName(record),
        contactName: record.name,
        jobTitle: PHILANTHROPIST_JOB_TITLE,
        email: record.email,
        clubName: record.clubName,
        pledgeGbp: record.giftGbp,
        tier: "philanthropist",
      })
    );
  } catch {
    // Browser storage can be blocked; the dedicated record is enough to route home.
  }
}

export function isPhilanthropistSponsor(
  brandName?: string | null,
  hints: { jobTitle?: string | null } = {}
): boolean {
  if (isPhilanthropistJobTitle(hints.jobTitle)) return true;
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    if (raw) {
      const parsed = JSON.parse(raw) as {
        companyName?: string;
        jobTitle?: string;
        tier?: string;
      };
      if (parsed.tier === "philanthropist") {
        const name = (brandName ?? "").trim().toLowerCase();
        if (
          !name ||
          String(parsed.companyName ?? "").trim().toLowerCase() === name
        ) {
          return true;
        }
      }
      if (
        isPhilanthropistJobTitle(parsed.jobTitle) &&
        (!brandName ||
          String(parsed.companyName ?? "").trim().toLowerCase() ===
            brandName.trim().toLowerCase())
      ) {
        return true;
      }
    }
  } catch {
    // Fall through to the dedicated record.
  }
  const record = readPhilanthropistRecord();
  if (!record) return false;
  const name = (brandName ?? "").trim().toLowerCase();
  if (!name) return true;
  return (
    philanthropistDisplayName(record).toLowerCase() === name ||
    record.name.toLowerCase() === name
  );
}

export function philanthropistGiftCopy(record: PhilanthropistRecord): string {
  const amount = `£${record.giftGbp.toLocaleString("en-GB")}`;
  return `You are supporting ${record.clubName} with ${amount} per match. Fans of ${record.clubName} direct this gift to club-approved climate projects that help the team climb the Climate Impact League Table (CILT). This is a philanthropic donation — not a Lead Climate Sponsorship.`;
}
