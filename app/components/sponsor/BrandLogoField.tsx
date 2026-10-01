"use client";

import { useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import { readLogoFile } from "@/app/services/climate-sponsors.service";

export function BrandLogoField({
  brandName,
  logoUrl,
  onChange,
  error,
}: {
  brandName: string;
  logoUrl: string | null;
  onChange: (logoDataUrl: string) => void;
  error?: string | null;
}) {
  const [localError, setLocalError] = useState<string | null>(null);
  return (
    <label className="block text-sm text-slate-400">
      Brand logo
      <div className="mt-2 flex items-center gap-4">
        <BrandMark name={brandName || "Brand"} logoUrl={logoUrl} large />
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setLocalError(null);
            void readLogoFile(file)
              .then(onChange)
              .catch((err) =>
                setLocalError(
                  err instanceof Error ? err.message : "Could not read that logo."
                )
              );
          }}
          className="w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-green-500 file:px-4 file:py-2 file:font-bold file:text-slate-950"
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Upload your brand mark so it appears next to Signed in as on the
        Sponsorship Dashboard.
      </p>
      {(error || localError) && (
        <p className="mt-2 text-sm text-red-300">{error || localError}</p>
      )}
    </label>
  );
}
