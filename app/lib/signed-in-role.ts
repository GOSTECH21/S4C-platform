import {
  ADMIN_PATH,
  CLUB_DASHBOARD_PATH,
  CLUB_REGISTER_PATH,
  FAN_LOGIN_PATH,
  HOME_PATH,
  PARTNER_DASHBOARD_PATH,
  SPONSOR_DASHBOARD_PATH,
  SUPPORTER_CAMPAIGN_PATH,
} from "./routes";

export type SignedInKind =
  | "admin"
  | "club"
  | "fan"
  | "sponsor"
  | "partner"
  | "unknown";

export function kindFromProfileRole(
  role: string | null | undefined
): SignedInKind {
  const value = String(role ?? "").toLowerCase();
  if (value === "admin") return "admin";
  if (value === "club") return "club";
  if (value === "sponsor") return "sponsor";
  if (value === "partner") return "partner";
  if (value === "supporter" || value === "fan") return "fan";
  return "unknown";
}

export function isFanFacingKind(kind: SignedInKind | null | undefined): boolean {
  return kind === "fan" || kind === "unknown" || kind == null;
}

export function destinationForSignedInKind(
  kind: SignedInKind | null | undefined
): string | null {
  if (kind === "club") return CLUB_DASHBOARD_PATH;
  if (kind === "sponsor") return SPONSOR_DASHBOARD_PATH;
  if (kind === "partner") return PARTNER_DASHBOARD_PATH;
  if (kind === "admin") return ADMIN_PATH;
  if (kind === "fan") return SUPPORTER_CAMPAIGN_PATH;
  return null;
}

export function fanLoginWrongRoleMessage(kind: SignedInKind) {
  if (kind === "club") {
    return "This email is a club Sustainability Director account. Use Club Login — My S4P is only for fans and supporters.";
  }
  if (kind === "sponsor") {
    return "This email is a sponsor account. Use Sponsor Login.";
  }
  if (kind === "partner") {
    return "This email is a Climate Partner account. Use Partner Login.";
  }
  if (kind === "admin") {
    return "This email is an S4P staff account. Use S4P staff login.";
  }
  return "This email is not a fan account.";
}

export function clubGateCopy(kind: SignedInKind) {
  if (kind === "fan") {
    return {
      title: "You're signed in as a fan",
      body: "You don't need a club login to vote. My S4P is the fan page. The club dashboard is only for the club's Sustainability Director.",
      primaryLabel: "Go to My S4P",
      primaryHref: SUPPORTER_CAMPAIGN_PATH,
      logoutHref: FAN_LOGIN_PATH,
    };
  }
  if (kind === "sponsor") {
    return {
      title: "You're signed in as a sponsor",
      body: "This page is the club Sustainability Director dashboard. Open your sponsor dashboard instead.",
      primaryLabel: "Go to sponsor dashboard",
      primaryHref: SPONSOR_DASHBOARD_PATH,
      logoutHref: HOME_PATH,
    };
  }
  if (kind === "partner") {
    return {
      title: "You're signed in as a Climate Partner",
      body: "This page is the club Sustainability Director dashboard. Open your partner dashboard instead.",
      primaryLabel: "Go to partner dashboard",
      primaryHref: PARTNER_DASHBOARD_PATH,
      logoutHref: HOME_PATH,
    };
  }
  if (kind === "admin") {
    return {
      title: "You're signed in as S4P staff",
      body: "This page is the club Sustainability Director dashboard. Open the S4P Admin Database instead.",
      primaryLabel: "Go to S4P Admin Database",
      primaryHref: ADMIN_PATH,
      logoutHref: HOME_PATH,
    };
  }
  return {
    title: "Club account not linked yet",
    body: "You are signed in, but this email is not attached to a club Sustainability Director profile yet. Complete club registration and you will land on the dashboard.",
    primaryLabel: "Complete club registration",
    primaryHref: CLUB_REGISTER_PATH,
    logoutHref: HOME_PATH,
  };
}

export function clubLoginWrongRoleMessage(kind: SignedInKind) {
  if (kind === "fan") {
    return "This email is a fan account. Use Fan Login — you don't need to sign in as the club to vote.";
  }
  if (kind === "sponsor") {
    return "This email is a sponsor account. Use Sponsor Login.";
  }
  if (kind === "partner") {
    return "This email is a Climate Partner account. Use Partner Login.";
  }
  if (kind === "admin") {
    return "This email is an S4P staff account. Use S4P staff login.";
  }
  return "This email is not linked to a club Sustainability Director profile.";
}
