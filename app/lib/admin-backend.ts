/** Platform Admin backend: every registered club and participant, keep or delete. */

export const ADMIN_BACKEND_STAMP = "admin-backend-mobile-v1";
export const ADMIN_MOBILE_STAMP = "admin-mobile-v1";
export const ADMIN_REMOVED_STORAGE = "s4p.admin.removed";
export const ADMIN_LEDGER_STORAGE = "s4p.admin.ledger";

export type AdminRole = "club" | "supporter" | "lead" | "local";
export type AdminStatus = "on-platform" | "removed";

export type AdminClubMatch = {
  matchLabel: string;
  projectNames: string[];
  invited: string[];
  proceeded: string[];
};

export type AdminClubRecord = {
  id: string;
  clubName: string;
  directorName: string;
  email: string;
  directorId?: string;
  matches: AdminClubMatch[];
  status: AdminStatus;
};

export type AdminFundedProject = {
  clubName: string;
  projectName: string;
  gbp: number;
};

export type AdminP4pRow = {
  clubName: string;
  fixtureName: string;
  projectName: string;
};

export type AdminMatchravRow = {
  clubName: string;
  fixtureName: string;
  kg: number;
};

export type AdminSupporterRecord = {
  id: string;
  fullName: string;
  email: string;
  supporterId?: string;
  authUserId?: string | null;
  teams: string[];
  fundedProjects: AdminFundedProject[];
  p4p: AdminP4pRow[];
  matchrav: AdminMatchravRow[];
  status: AdminStatus;
};

export type AdminSponsorAccount = {
  id: string;
  role: "lead" | "local";
  brandName: string;
  contactName: string;
  email: string;
  sponsorId?: string;
  teams: string[];
  projectLog: Array<{
    clubName: string;
    matchLabel: string;
    projectNames: string[];
  }>;
  status: AdminStatus;
};

export type AdminBackendSnapshot = {
  clubs: AdminClubRecord[];
  supporters: AdminSupporterRecord[];
  lead: AdminSponsorAccount[];
  local: AdminSponsorAccount[];
  error: string | null;
};

export type AdminLedgerParticipant = {
  id: string;
  role: AdminRole;
  displayName: string;
  email: string;
  brandName?: string;
  clubName?: string;
  teams?: string[];
  registeredAt: string;
};

export type AdminLedger = {
  participants: AdminLedgerParticipant[];
  funds: Array<AdminFundedProject & { supporterKey: string; at: string }>;
  p4p: Array<AdminP4pRow & { supporterKey: string; at: string }>;
  matchrav: Array<AdminMatchravRow & { supporterKey: string; at: string }>;
};

export type AdminRemovedStore = {
  ids: string[];
  emails: string[];
  brands: string[];
};

export function compactAdminKey(value: string | null | undefined) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function adminParticipantId(role: AdminRole, key: string) {
  return `${role}:${compactAdminKey(key) || "unknown"}`;
}

export function emptyAdminLedger(): AdminLedger {
  return { participants: [], funds: [], p4p: [], matchrav: [] };
}

export function emptyAdminRemoved(): AdminRemovedStore {
  return { ids: [], emails: [], brands: [] };
}

export function emptyAdminSnapshot(): AdminBackendSnapshot {
  return { clubs: [], supporters: [], lead: [], local: [], error: null };
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const MATCHRAV_TRIPS_STORAGE = "s4p.matchrav-trips";

/** Admin reads Matchrav rows without importing the journey planner (old PCs lack stadiumSiteForVenue). */
export function readAdminMatchravTrips(): Array<{
  fanKey?: string;
  club: string;
  fixtureName: string;
  totalKg: number;
}> {
  const rows = readJson<
    Array<{
      fanKey?: string;
      club?: string;
      fixtureName?: string;
      totalKg?: number;
    }>
  >(MATCHRAV_TRIPS_STORAGE, []);
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    fanKey: String(row.fanKey ?? "").trim() || undefined,
    club: String(row.club ?? "").trim(),
    fixtureName: String(row.fixtureName ?? "").trim(),
    totalKg: Number(row.totalKg) || 0,
  }));
}

export function readAdminRemoved(): AdminRemovedStore {
  const stored = readJson<Partial<AdminRemovedStore>>(
    ADMIN_REMOVED_STORAGE,
    emptyAdminRemoved()
  );
  return {
    ids: Array.isArray(stored.ids) ? stored.ids : [],
    emails: Array.isArray(stored.emails) ? stored.emails : [],
    brands: Array.isArray(stored.brands) ? stored.brands : [],
  };
}

export function writeAdminRemoved(store: AdminRemovedStore) {
  writeJson(ADMIN_REMOVED_STORAGE, {
    ids: [...new Set(store.ids)],
    emails: [...new Set(store.emails.map((row) => row.trim().toLowerCase()).filter(Boolean))],
    brands: [...new Set(store.brands.map((row) => compactAdminKey(row)).filter(Boolean))],
  });
}

export function isAdminRemovedId(id: string) {
  return readAdminRemoved().ids.includes(id);
}

export function isAdminRemovedEmail(email: string | null | undefined) {
  const key = String(email ?? "").trim().toLowerCase();
  if (!key) return false;
  return readAdminRemoved().emails.includes(key);
}

export function isAdminRemovedBrand(name: string | null | undefined) {
  const key = compactAdminKey(name);
  if (!key) return false;
  return readAdminRemoved().brands.includes(key);
}

export function readAdminLedger(): AdminLedger {
  const stored = readJson<Partial<AdminLedger>>(
    ADMIN_LEDGER_STORAGE,
    emptyAdminLedger()
  );
  return {
    participants: Array.isArray(stored.participants) ? stored.participants : [],
    funds: Array.isArray(stored.funds) ? stored.funds : [],
    p4p: Array.isArray(stored.p4p) ? stored.p4p : [],
    matchrav: Array.isArray(stored.matchrav) ? stored.matchrav : [],
  };
}

export function writeAdminLedger(ledger: AdminLedger) {
  writeJson(ADMIN_LEDGER_STORAGE, {
    participants: ledger.participants.slice(0, 400),
    funds: ledger.funds.slice(0, 800),
    p4p: ledger.p4p.slice(0, 800),
    matchrav: ledger.matchrav.slice(0, 800),
  });
}

function upsertParticipant(
  ledger: AdminLedger,
  row: AdminLedgerParticipant
): AdminLedger {
  const next = ledger.participants.filter((item) => item.id !== row.id);
  next.unshift(row);
  return { ...ledger, participants: next };
}

export function recordAdminParticipant(row: Omit<AdminLedgerParticipant, "registeredAt"> & {
  registeredAt?: string;
}) {
  const ledger = readAdminLedger();
  writeAdminLedger(
    upsertParticipant(ledger, {
      ...row,
      registeredAt: row.registeredAt || new Date().toISOString(),
    })
  );
}

export function recordAdminFanFund(row: AdminFundedProject & { supporterKey: string }) {
  const ledger = readAdminLedger();
  writeAdminLedger({
    ...ledger,
    funds: [
      { ...row, at: new Date().toISOString() },
      ...ledger.funds.filter(
        (item) =>
          !(
            compactAdminKey(item.supporterKey) === compactAdminKey(row.supporterKey) &&
            compactAdminKey(item.projectName) === compactAdminKey(row.projectName) &&
            compactAdminKey(item.clubName) === compactAdminKey(row.clubName)
          )
      ),
    ],
  });
}

export function recordAdminP4p(row: AdminP4pRow & { supporterKey: string }) {
  const ledger = readAdminLedger();
  writeAdminLedger({
    ...ledger,
    p4p: [{ ...row, at: new Date().toISOString() }, ...ledger.p4p],
  });
}

export function recordAdminMatchrav(row: AdminMatchravRow & { supporterKey: string }) {
  const ledger = readAdminLedger();
  writeAdminLedger({
    ...ledger,
    matchrav: [{ ...row, at: new Date().toISOString() }, ...ledger.matchrav],
  });
}

export function keysMatch(left: string | null | undefined, right: string | null | undefined) {
  const a = compactAdminKey(left);
  const b = compactAdminKey(right);
  return Boolean(a && b && a === b);
}

export function uniqueAdminNames(values: Array<string | null | undefined>) {
  const seen = new Map<string, string>();
  for (const value of values) {
    const trimmed = String(value ?? "").trim();
    if (!trimmed) continue;
    const key = compactAdminKey(trimmed);
    if (!key || seen.has(key)) continue;
    seen.set(key, trimmed);
  }
  return [...seen.values()];
}

export function previewAdminBackendSnapshot(): AdminBackendSnapshot {
  return {
    clubs: [
      {
        id: adminParticipantId("club", "Hearts"),
        clubName: "Hearts",
        directorName: "Jamie Allan",
        email: "jamieallan@hearts.com",
        matches: [
          {
            matchLabel: "Hearts v Hibernian",
            projectNames: [
              "Global Schools Solar",
              "Edinburgh Building Retrofit Collective",
              "Wee Spoke Hub",
              "Porty Community Energy",
              "Gorgie Community Rooftop Solar",
            ],
            invited: ["American Express", "Mash Tun", "Top Cellar"],
            proceeded: ["American Express", "Mash Tun"],
          },
        ],
        status: "on-platform",
      },
    ],
    supporters: [
      {
        id: adminParticipantId("supporter", "laura.davies@heartsfan.com"),
        fullName: "Laura Davies",
        email: "laura.davies@heartsfan.com",
        teams: ["Hearts"],
        fundedProjects: [
          { clubName: "Hearts", projectName: "Global Schools Solar", gbp: 12.5 },
        ],
        p4p: [
          {
            clubName: "Hearts",
            fixtureName: "Hearts v Hibernian",
            projectName: "Global Schools Solar",
          },
        ],
        matchrav: [
          { clubName: "Hearts", fixtureName: "Hearts v Hibernian", kg: 4.8 },
        ],
        status: "on-platform",
      },
    ],
    lead: [
      {
        id: adminParticipantId("lead", "American Express"),
        role: "lead",
        brandName: "American Express",
        contactName: "Dominic Hart",
        email: "dominic.hart@amex.example",
        teams: ["Hearts"],
        projectLog: [
          {
            clubName: "Hearts",
            matchLabel: "Hearts v Hibernian",
            projectNames: ["Global Schools Solar", "Edinburgh Building Retrofit Collective"],
          },
        ],
        status: "on-platform",
      },
    ],
    local: [
      {
        id: adminParticipantId("local", "Mash Tun"),
        role: "local",
        brandName: "Mash Tun",
        contactName: "Alex Reid",
        email: "alex@mashtun.example",
        teams: ["Hearts"],
        projectLog: [
          {
            clubName: "Hearts",
            matchLabel: "Hearts v Hibernian",
            projectNames: ["Wee Spoke Hub"],
          },
        ],
        status: "on-platform",
      },
    ],
    error: null,
  };
}
