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
  firstNameName: string;
  lastNameName: string;
  emailName: string;
  phoneName: string;
  websiteName: string;
  passwordName: string;
  confirmName: string;
  emailAutoComplete: string;
  phoneAutoComplete: string;
  passwordAutoComplete: string;
};

/**
 * Registration uses a different autocomplete section from Login so a saved
 * password (including another person's browser profile) is not painted in.
 * Phone is a tel field so Chrome does not treat it as the username.
 */
export function roleRegisterAccount(role: LoginRole): RoleRegisterAccount {
  const section = `section-s4p-${role}-register`;
  return {
    formId: `s4p-${role}-register`,
    organisationName: `s4p-${role}-register-organisation`,
    contactName: `s4p-${role}-register-contact`,
    firstNameName: `s4p-${role}-register-first-name`,
    lastNameName: `s4p-${role}-register-last-name`,
    emailName: `s4p-${role}-register-email`,
    phoneName: `s4p-${role}-register-phone`,
    websiteName: `s4p-${role}-register-website`,
    passwordName: `s4p-${role}-register-password`,
    confirmName: `s4p-${role}-register-confirm`,
    emailAutoComplete: `${section} off`,
    phoneAutoComplete: `${section} tel`,
    passwordAutoComplete: `${section} new-password`,
  };
}
