"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ClubLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login successful!");

    router.push("/club/dashboard");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8">

        <h1 className="text-3xl font-bold mb-2">
          Club Login
        </h1>

        <p className="text-gray-400 mb-8">
          Sign in to your S4C Club Account
        </p>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
          />

          <button
            onClick={login}
            disabled={loading}
            className="w-full rounded-lg bg-green-500 py-3 font-bold text-black hover:bg-green-400"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </div>

      </div>

    </main>
  );
}