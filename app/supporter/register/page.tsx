"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function SupporterRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [favouriteClub, setFavouriteClub] = useState("");

  const [clubs, setClubs] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClubs();
  }, []);

  async function loadClubs() {
    const { data } = await supabase
      .from("clubs")
      .select("id, name")
      .order("name");

    setClubs(data || []);
  }

  async function registerSupporter() {
    if (!fullName || !email || !password) {
      alert("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      alert(error?.message || "Registration failed.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("supporters")
      .insert({
        full_name: fullName,
        email,
        favourite_club_id: favouriteClub || null,
        country,
        city,
      });

    if (insertError) {
      console.error(insertError);
      alert("Supporter profile could not be created.");
      setLoading(false);
      return;
    }

    alert("✅ Fan account created!");

    router.push("/supporter/login");
  }
  return (
  <main className="min-h-screen bg-slate-950 flex items-center justify-center p-10">

    <div className="w-full max-w-2xl rounded-2xl bg-slate-900 p-10">

      <h1 className="text-4xl font-bold text-white">
        Fan Registration
      </h1>

      <div className="mt-8 space-y-5">

        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg bg-slate-800 p-4 text-white"
        />

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-slate-800 p-4 text-white"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-slate-800 p-4 text-white"
        />

        <input
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg bg-slate-800 p-4 text-white"
        />

        <input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full rounded-lg bg-slate-800 p-4 text-white"
        />

        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg bg-slate-800 p-4 text-white"
        />

        <select
          value={favouriteClub}
          onChange={(e) => setFavouriteClub(e.target.value)}
          className="w-full rounded-lg bg-slate-800 p-4 text-white"
        >
          <option value="">Choose Favourite Club</option>

          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}

        </select>

        <button
          onClick={registerSupporter}
          disabled={loading}
          className="w-full rounded-xl bg-green-600 py-4 text-xl font-bold text-white hover:bg-green-500"
        >
          {loading ? "Creating Account..." : "Create Fan Account"}
        </button>

      </div>

    </div>

  </main>
);
}