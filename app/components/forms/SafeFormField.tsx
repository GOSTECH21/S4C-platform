"use client";

import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const MANAGER_IGNORE = {
  autoCorrect: "off" as const,
  spellCheck: false,
  "data-1p-ignore": "true",
  "data-lpignore": "true",
  "data-bwignore": "true",
  "data-form-type": "other",
};

export function SafeInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...MANAGER_IGNORE} {...props} suppressHydrationWarning />;
}

export function SafeSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} suppressHydrationWarning />;
}
