"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerSponsor } from "@/app/services/sponsor-auth.service";

export default function SponsorRegisterPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      await registerSponsor({
        companyName,
        contactName,
        email,
        password,
      });

      alert("Account created successfully!");

      router.replace("/sponsor/dashboard");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-20">
      <h1 className="text-4xl font-bold">
        Become an S4P Sponsor
      </h1>

      <p className="mt-4 text-gray-600">
        Create your organisation account to begin sponsoring sporting moments.
      </p>

      <form onSubmit={handleRegister} className="mt-10 space-y-6">

        <div>
          <label className="mb-2 block font-medium">
            Company Name
          </label>

          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Contact Name
          </label>

          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-4 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Sponsor Account"}
        </button>

      </form>
    </div>
  );
}