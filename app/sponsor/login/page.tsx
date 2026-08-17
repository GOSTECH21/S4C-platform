"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSponsor } from "@/app/services/sponsor-auth.service";

export default function SponsorLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      await loginSponsor({
        email,
        password,
      });

      router.push("/sponsor/dashboard");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-20">
      <h1 className="text-4xl font-bold">Sponsor Login</h1>

      <p className="mt-4 text-gray-600">
        Sign in to manage your S4P sponsorship campaigns.
      </p>

      <form onSubmit={handleLogin} className="mt-10 space-y-6">
        <div>
          <label className="mb-2 block font-medium">Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Password</label>

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
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}