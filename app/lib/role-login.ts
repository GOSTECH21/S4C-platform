/** Per-title login defaults so Fan, Club, Sponsor, Partner and Staff stay separate. */

export type LoginRole = "fan" | "club" | "sponsor" | "partner" | "admin";

export type RoleLoginAccount = {
  email: string;
  password: string;
  formId: string;
  emailName: string;
  passwordName: string;
  emailAutoComplete: string;
  passwordAutoComplete: string;
};

/**
 * Emails match the login title. Passwords stay empty in code so the browser
 * can fill the saved password for that title's email — not a Fan account on
 * Club Login. Field names and autocomplete sections are unique per title so
 * password managers do not copy Fan credentials onto the other screens.
 */
const ROLE_LOGIN_EMAILS: Record<LoginRole, string> = {
  fan: "lauradaviesheartsfan@gmail.com",
  club: "lauradaviesheartssd@gmail.com",
  sponsor: "pumasponsor@gmail.com",
  partner: "climatepartner@gmail.com",
  admin: "s4pstaff@gmail.com",
};

export function roleLoginAccount(role: LoginRole): RoleLoginAccount {
  const section = `section-s4p-${role}`;
  return {
    email: ROLE_LOGIN_EMAILS[role],
    password: "",
    formId: `s4p-${role}-login`,
    emailName: `s4p-${role}-email`,
    passwordName: `s4p-${role}-password`,
    emailAutoComplete: `${section} username`,
    passwordAutoComplete: `${section} current-password`,
  };
}

export function roleLoginEmailBelongsToTitle(
  role: LoginRole,
  email: string
): boolean {
  const value = email.trim().toLowerCase();
  if (!value) return false;
  if (role === "fan") return value === ROLE_LOGIN_EMAILS.fan && value.includes("fan");
  return value === ROLE_LOGIN_EMAILS[role] && !value.includes("heartsfan");
}
