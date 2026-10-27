/** Climate Sponsorship Wallet deposit opens Stripe-style card payment. */

import { brandsMatch, clubsMatch } from "./climate-sponsors";
import { MATCH_DAY_APPROVED_LABEL } from "./partner-projects";
import { matchSponsorshipTopUp } from "./sponsor-wallet";

export const MATCH_DAY_CARD_PAYMENT_STORAGE = "s4p.match-day-card-payment";

export const PAY_WITH_CARD_LABEL = "Pay with your Credit/Debit Card";
export const STRIPE_CHECKOUT_HEADING = "Secure card payment";
export const STRIPE_POWERED_COPY = "Payments are processed with Stripe.";
export const STRIPE_TEST_CARD_COPY =
  "Use test card 4242 4242 4242 4242, any future expiry, and any 3-digit CVC.";
export const CARD_PAYMENT_CONFIRMED_COPY = `Payment confirmed. Climate Projects tagged pending approval are now ${MATCH_DAY_APPROVED_LABEL}.`;
export const CLIMATE_WALLET_CONFIRMATION_COPY =
  "This confirmation page shows your Match-Sponsorship. Your last action before Pay with your Credit/Debit Card is to click Deposit into Climate Sponsorship Wallet. Stripe then takes the Match-Sponsorship plus the 5% Platform Fee.";
export const LOCAL_WALLET_CONFIRMATION_COPY =
  "This confirmation page shows what you are committing to. Your last action before Pay with your Credit/Debit Card is to click Put into Carbon Wallet.";
export const WALLET_PROJECTS_AWAIT_PAYMENT_COPY =
  "These Climate Projects stay tagged pending approval until payment is confirmed.";
export const WALLET_PROJECTS_PAID_COPY = `Payment confirmed. These Climate Projects are now ${MATCH_DAY_APPROVED_LABEL}.`;

export type MatchDayCardPayment = {
  clubId: string;
  clubName: string;
  brandName: string;
  projectIds: string[];
  amountGbp: number;
  kind: "lead" | "local";
  paidAt: string;
};

function readAll(): MatchDayCardPayment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MATCH_DAY_CARD_PAYMENT_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MatchDayCardPayment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rows: MatchDayCardPayment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    MATCH_DAY_CARD_PAYMENT_STORAGE,
    JSON.stringify(rows.slice(0, 200))
  );
}

export function readMatchDayCardPayments(): MatchDayCardPayment[] {
  return readAll();
}

export function recordMatchDayCardPayment(
  payment: Omit<MatchDayCardPayment, "paidAt"> & { paidAt?: string }
): MatchDayCardPayment {
  const next: MatchDayCardPayment = {
    ...payment,
    clubId: String(payment.clubId ?? "").trim(),
    clubName: payment.clubName.trim(),
    brandName: payment.brandName.trim(),
    projectIds: [...new Set(payment.projectIds.filter(Boolean))],
    amountGbp: Math.max(0, Number(payment.amountGbp) || 0),
    paidAt: payment.paidAt || new Date().toISOString(),
  };
  const kept = readAll().filter(
    (row) =>
      !(
        brandsMatch(row.brandName, next.brandName) &&
        clubsMatch(row.clubName, next.clubName)
      )
  );
  writeAll([next, ...kept]);
  return next;
}

export function isMatchDayCardPaymentConfirmed({
  clubName,
  brandName,
}: {
  clubName: string;
  brandName?: string | null;
}): boolean {
  const club = clubName.trim();
  if (!club) return false;
  const brand = String(brandName ?? "").trim();
  return readAll().some(
    (row) =>
      clubsMatch(row.clubName, club) &&
      (!brand || brandsMatch(row.brandName, brand))
  );
}

export function paidProjectIdsForClub({
  clubId,
  clubName,
}: {
  clubId?: string | null;
  clubName?: string | null;
}): string[] {
  const id = String(clubId ?? "").trim();
  const name = String(clubName ?? "").trim();
  const ids: string[] = [];
  for (const row of readAll()) {
    const sameClub =
      (id && row.clubId && row.clubId === id) ||
      (name && clubsMatch(row.clubName, name));
    if (!sameClub) continue;
    ids.push(...row.projectIds);
  }
  return [...new Set(ids)];
}

export function digitsOnly(value: string): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function formatCardNumber(value: string): string {
  return digitsOnly(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export function formatCardExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function luhnOk(digits: string): boolean {
  const raw = digitsOnly(digits);
  if (raw.length < 13 || raw.length > 19) return false;
  let sum = 0;
  let doubleIt = false;
  for (let i = raw.length - 1; i >= 0; i -= 1) {
    let n = Number(raw[i]);
    if (doubleIt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    doubleIt = !doubleIt;
  }
  return sum % 10 === 0;
}

export function isCardNumberValid(value: string): boolean {
  return luhnOk(digitsOnly(value));
}

export function isCardExpiryValid(
  value: string,
  now: Date = new Date()
): boolean {
  const digits = digitsOnly(value);
  if (digits.length !== 4) return false;
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) return false;
  const exp = new Date(year, month, 1);
  return exp.getTime() > now.getTime();
}

export function isCardCvcValid(value: string): boolean {
  const digits = digitsOnly(value);
  return digits.length === 3 || digits.length === 4;
}

export function cardPaymentAmountGbp(wallet: {
  kind?: string | null;
  commitmentFeeGbp?: number | null;
  paidGbp?: number | null;
  sponsorshipGbp?: number | null;
} | null): number {
  if (!wallet) return 0;
  if (wallet.kind === "local") {
    return Math.max(
      0,
      Number(wallet.paidGbp) || Number(wallet.sponsorshipGbp) || 0
    );
  }
  return matchSponsorshipTopUp(Number(wallet.commitmentFeeGbp) || 0).paidGbp;
}
