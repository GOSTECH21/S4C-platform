/** Per-title login fields so Fan, Club, Sponsor, Partner and Staff stay separate. */

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
 * Email and password start empty so you choose the account yourself.
 * Field names and autocomplete sections stay unique per title so a Fan
 * password manager entry does not appear on Club, Sponsor, Partner or Staff.
 */
export function roleLoginAccount(role: LoginRole): RoleLoginAccount {
  const section = `section-s4p-${role}`;
  return {
    email: "",
    password: "",
    formId: `s4p-${role}-login`,
    emailName: `s4p-${role}-email`,
    passwordName: `s4p-${role}-password`,
    emailAutoComplete: `${section} username`,
    passwordAutoComplete: `${section} current-password`,
  };
}

export type RoleRegisterAccount = {
  formId: string;
  organisationName: string;
  contactName: string;
  emailName: string;
  websiteName: string;
  passwordName: string;
  confirmName: string;
  emailAutoComplete: string;
  passwordAutoComplete: string;
};

/**
 * Registration uses a different autocomplete section from Login so a saved
 * password (including another person's browser profile) is not painted in.
 */
export function roleRegisterAccount(role: LoginRole): RoleRegisterAccount {
  const section = `section-s4p-${role}-register`;
  return {
    formId: `s4p-${role}-register`,
    organisationName: `s4p-${role}-register-organisation`,
    contactName: `s4p-${role}-register-contact`,
    emailName: `s4p-${role}-register-email`,
    websiteName: `s4p-${role}-register-website`,
    passwordName: `s4p-${role}-register-password`,
    confirmName: `s4p-${role}-register-confirm`,
    emailAutoComplete: `${section} off`,
    passwordAutoComplete: `${section} new-password`,
  };
}
