import type { RoleRegisterAccount } from "@/app/lib/role-login";

/** Chrome treats a text box beside Password as the username. Emails belong in Club Email. */
export function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}

export function bounceEmailOutOfPhone<T extends { email: string; phone: string }>(
  fields: T
): T {
  const phone = String(fields.phone ?? "").trim();
  if (!looksLikeEmail(phone)) return fields;
  const email = String(fields.email ?? "").trim();
  return {
    ...fields,
    phone: "",
    email: email || phone,
  };
}

export function clubRegisterStateKey(
  inputName: string,
  account: Pick<
    RoleRegisterAccount,
    "emailName" | "phoneName" | "passwordName" | "confirmName"
  >
): string {
  if (inputName === account.emailName) return "email";
  if (inputName === account.phoneName) return "phone";
  if (inputName === account.passwordName) return "password";
  if (inputName === account.confirmName) return "confirmPassword";
  return inputName;
}
