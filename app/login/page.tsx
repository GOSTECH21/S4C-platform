"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login successful");
    window.location.href = "/admin/match-centre";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-green-400">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-md bg-slate-800 p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-6 w-full rounded-md bg-slate-800 p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />

        <button
          onClick={handleLogin}
          className="w-full rounded-md bg-green-500 py-3 font-bold text-black"
        >
          Login
        </button>

        <p className="mt-4 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-green-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}