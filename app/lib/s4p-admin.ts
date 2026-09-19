export function storedFullName(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, " ").trim();
}

function compactName(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function looksLikeEmailLocalPart(
  fullName: string | null | undefined,
  email: string | null | undefined
) {
  const name = String(fullName ?? "").trim();
  const local = String(email ?? "").split("@")[0]?.trim() ?? "";
  if (!name || !local) return false;
  return compactName(name) === compactName(local);
}

const EMAIL_NAME_SUFFIXES = [
  "villafc",
  "fulham",
  "gillette",
  "budweiser",
  "diageo",
  "villa",
  "ful",
  "gill",
  "bud",
  "dia",
  "okey",
];

const EMAIL_FIRST_NAMES = [
  "christopher",
  "alexander",
  "godwin",
  "jacob",
  "jason",
  "james",
  "jerry",
  "clive",
  "john",
  "paul",
  "owen",
];

function titleCaseWord(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function compactIdentity(value: string | null | undefined) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function emailKey(email: string | null | undefined) {
  return String(email ?? "").trim().toLowerCase();
}

export function guessPersonNameFromEmailLocal(localPart: string | null | undefined) {
  let token = compactIdentity(localPart).replace(/\d+$/, "");
  if (!token) return null;
  for (const suffix of [...EMAIL_NAME_SUFFIXES].sort((a, b) => b.length - a.length)) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 4) {
      token = token.slice(0, -suffix.length);
      break;
    }
  }
  for (const first of [...EMAIL_FIRST_NAMES].sort((a, b) => b.length - a.length)) {
    if (token.startsWith(first) && token.length - first.length >= 3) {
      return `${titleCaseWord(first)} ${titleCaseWord(token.slice(first.length))}`;
    }
  }
  return null;
}

export function adminDisplayName(
  storedName: string | null | undefined,
  email: string | null | undefined
) {
  const stored = String(storedName ?? "").replace(/\s+/g, " ").trim();
  if (stored && !looksLikeEmailLocalPart(stored, email) && /\s/.test(stored)) {
    return stored;
  }
  return (
    guessPersonNameFromEmailLocal(String(email ?? "").split("@")[0]) ||
    stored ||
    "Unnamed fan"
  );
}

export function resolvedFullName(
  storedName: string | null | undefined,
  email: string | null | undefined,
  metadataName: string | null | undefined
) {
  const stored = String(storedName ?? "").replace(/\s+/g, " ").trim();
  const meta = String(metadataName ?? "").replace(/\s+/g, " ").trim();
  if (looksLikeEmailLocalPart(stored, email)) {
    if (meta && !looksLikeEmailLocalPart(meta, email)) return meta;
    const guessed = guessPersonNameFromEmailLocal(
      String(email ?? "").split("@")[0]
    );
    if (guessed) return guessed;
  }
  return stored || meta || "";
}

export function personKey(fullName: string, email: string) {
  const display = adminDisplayName(fullName, email).toLowerCase().replace(/\s+/g, " ").trim();
  if (display.includes(" ")) return display;
  return emailKey(email) || display;
}

export function isStaffExcludedFan(
  fan: { email: string; authUserId?: string | null; fullName?: string },
  excluded: {
    emails: string[];
    authUserIds: string[];
    contactKeys: string[];
  }
) {
  const email = emailKey(fan.email);
  if (email && excluded.emails.includes(email)) return true;
  if (fan.authUserId && excluded.authUserIds.includes(fan.authUserId)) return true;
  const local = compactIdentity(email.split("@")[0] ?? "");
  return excluded.contactKeys.some(
    (key) => key.length >= 6 && (local === key || local.startsWith(key))
  );
}

function fanRecordQuality(fan: RegisteredFan) {
  const local = fan.email.split("@")[0] ?? "";
  let score = 0;
  if (
    /\s/.test(fan.fullName) &&
    !looksLikeEmailLocalPart(fan.fullName, fan.email)
  ) {
    score += 5;
  }
  if (fan.clubName.trim() && fan.clubName !== "No club selected") score += 1;
  if (/\d/.test(local)) score -= 2;
  if (
    EMAIL_NAME_SUFFIXES.some((suffix) =>
      compactIdentity(local).endsWith(suffix)
    )
  ) {
    score -= 1;
  }
  return score;
}

export function uniqueFansByPerson(fans: RegisteredFan[]): RegisteredFan[] {
  const byPerson = new Map<string, RegisteredFan>();
  for (const fan of fans) {
    const key = personKey(fan.fullName, fan.email);
    const existing = byPerson.get(key);
    if (!existing || fanRecordQuality(fan) > fanRecordQuality(existing)) {
      byPerson.set(key, fan);
    }
  }
  return [...byPerson.values()];
}

export function staffFanRoster(
  fans: RegisteredFan[],
  excluded: {
    emails: string[];
    authUserIds: string[];
    contactKeys: string[];
  }
): RegisteredFan[] {
  return uniqueFansByPerson(
    fans.filter((fan) => !isStaffExcludedFan(fan, excluded))
  ).map((fan) => ({
    ...fan,
    fullName: adminDisplayName(fan.fullName, fan.email),
  }));
}

export function uniqueClubNames(clubNames: string[]): string[] {
  const seen = new Map<string, string>();
  for (const name of clubNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const key = compactIdentity(trimmed);
    if (!key || seen.has(key)) continue;
    seen.set(key, trimmed);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

export function welcomeFirstName(fullName: string | null | undefined) {
  const cleaned = String(fullName ?? "").replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  const first = cleaned.split(" ")[0];
  if (!first) return null;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function welcomeBackMessage(fullName: string | null | undefined) {
  const first = welcomeFirstName(fullName);
  return first ? `Welcome back ${first}` : null;
}

export type RegisteredFan = {
  id: string;
  fullName: string;
  email: string;
  clubName: string;
  authUserId?: string | null;
};

export type FanClubGroup = {
  clubName: string;
  count: number;
  members: RegisteredFan[];
};

export function groupFansByClub(fans: RegisteredFan[]): FanClubGroup[] {
  const byClub = new Map<string, RegisteredFan[]>();
  for (const fan of fans) {
    const clubName = fan.clubName.trim() || "No club selected";
    const members = byClub.get(clubName) ?? [];
    members.push(fan);
    byClub.set(clubName, members);
  }
  return [...byClub.entries()]
    .map(([clubName, members]) => ({
      clubName,
      count: members.length,
      members: [...members].sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
      ),
    }))
    .sort(
      (a, b) =>
        b.count - a.count || a.clubName.localeCompare(b.clubName)
    );
}
