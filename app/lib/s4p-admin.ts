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

export function resolvedFullName(
  storedName: string | null | undefined,
  email: string | null | undefined,
  metadataName: string | null | undefined
) {
  const stored = String(storedName ?? "").replace(/\s+/g, " ").trim();
  const meta = String(metadataName ?? "").replace(/\s+/g, " ").trim();
  if (looksLikeEmailLocalPart(stored, email) && meta) return meta;
  return stored || meta || "";
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
