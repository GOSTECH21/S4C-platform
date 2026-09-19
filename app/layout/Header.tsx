"use client";

import { useEffect, useState } from "react";
import { welcomeBackMessage } from "@/app/lib/s4p-admin";
import { requireS4PStaff } from "@/app/services/signed-in-role.service";

export default function Header() {
  const [welcome, setWelcome] = useState("Welcome back");

  useEffect(() => {
    requireS4PStaff().then((staff) => {
      setWelcome(welcomeBackMessage(staff?.fullName) ?? "Welcome back");
    });
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6 text-white">
      <div>
        <p className="text-sm text-slate-400">{welcome}</p>
        <h2 className="font-semibold">S4P staff</h2>
      </div>
    </header>
  );
}
