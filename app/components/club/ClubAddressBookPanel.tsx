"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  clubAddressBookPrompt,
  clubAddressBookSubtitle,
  clubAddressBookTitle,
  deleteClubAddressBookContact,
  saveClubAddressBookContact,
  type ClubAddressBookContact,
  type ClubAddressBookKind,
} from "@/app/lib/club-address-book";

const EMPTY_FORM = {
  name: "",
  email: "",
  businessName: "",
  phone: "",
};

export default function ClubAddressBookPanel({
  clubId,
  kind,
  contacts,
  onChange,
}: {
  clubId: string;
  kind: ClubAddressBookKind;
  contacts: ClubAddressBookContact[];
  onChange: (contacts: ClubAddressBookContact[]) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const title = useMemo(() => clubAddressBookTitle(kind), [kind]);
  const subtitle = useMemo(() => clubAddressBookSubtitle(kind), [kind]);
  const prompt = useMemo(() => clubAddressBookPrompt(kind), [kind]);

  function update<K extends keyof typeof EMPTY_FORM>(
    field: K,
    value: (typeof EMPTY_FORM)[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const saved = saveClubAddressBookContact(clubId, kind, form);
      onChange(
        contacts.some((row) => row.id === saved.id)
          ? contacts.map((row) => (row.id === saved.id ? saved : row))
          : [...contacts, saved]
      );
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this contact.");
    }
  }

  function remove(contactId: string) {
    deleteClubAddressBookContact(clubId, kind, contactId);
    onChange(contacts.filter((row) => row.id !== contactId));
  }

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
        {title}
      </p>
      <h2 className="mt-2 text-2xl font-black">{subtitle}</h2>
      <p className="mt-2 text-sm text-slate-400">{prompt}</p>

      {contacts.length === 0 ? null : (
        <ul className="mt-6 space-y-3">
          {contacts.map((contact) => (
            <li
              key={contact.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <p className="text-lg font-bold">{contact.name}</p>
                <p className="text-sm text-slate-300">{contact.businessName}</p>
                <p className="mt-1 text-sm text-slate-400">{contact.email}</p>
                {contact.phone ? (
                  <p className="text-sm text-slate-400">{contact.phone}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => remove(contact.id)}
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-red-400 hover:text-red-200"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-300">
          Name
          <input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            autoComplete="name"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-300">
          Business name
          <input
            value={form.businessName}
            onChange={(event) => update("businessName", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-300">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            autoComplete="email"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-300">
          Telephone
          <input
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            autoComplete="tel"
          />
        </label>
        {error ? (
          <p className="sm:col-span-2 text-sm text-red-300">{error}</p>
        ) : null}
        <button
          type="submit"
          className="sm:col-span-2 rounded-xl bg-s4p-mark py-3 font-black text-slate-950"
        >
          Add to {title}
        </button>
      </form>
    </section>
  );
}
