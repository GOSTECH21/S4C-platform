"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function SupporterLoginPage() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    async function loginSupporter() {

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
            setLoading(false);
            return;
        }

        router.push("/supporter/dashboard");
    }
    return (
  <main className="min-h-screen bg-slate-950 flex items-center justify-center p-10">

    <div className="w-full max-w-lg rounded-2xl bg-slate-900 p-10">

      <h1 className="text-4xl font-bold text-white">
        Supporter Login
      </h1>

      <p className="mt-3 text-slate-400">
        Sign in to vote for your favourite climate projects.
      </p>

      <div className="mt-8 space-y-5">

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-slate-800 p-4 text-white"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-slate-800 p-4 text-white"
        />

        <button
          onClick={loginSupporter}
          disabled={loading}
          className="w-full rounded-xl bg-green-600 py-4 text-xl font-bold text-white hover:bg-green-500"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

      </div>

    </div>

  </main>
);
}