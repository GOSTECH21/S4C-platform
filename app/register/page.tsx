"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleRegister() {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Registration successful. Check your email to confirm your account.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-green-400">Register</h1>

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
          className="mb-4 w-full rounded-md bg-slate-800 p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="mb-6 w-full rounded-md bg-slate-800 p-3"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full rounded-md bg-green-500 py-3 font-bold text-black"
        >
          Create Account
        </button>
      </div>
    </main>
  );
}