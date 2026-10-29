"use client";

import dynamic from "next/dynamic";

const FanCiftTable = dynamic(() => import("@/app/components/fan/FanCiftTable"), {
  ssr: false,
});

export default function FanCiftPage() {
  return <FanCiftTable />;
}
