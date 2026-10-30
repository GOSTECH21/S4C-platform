"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

const SCREEN_CLASS =
  "relative z-20 overflow-hidden max-md:!inset-auto max-md:static max-md:w-full max-md:rounded-2xl max-md:border max-md:border-slate-200 md:absolute";

export function PhoneFrame({
  src,
  alt,
  width,
  height,
  screenStyle,
  screenClassName = "",
  children,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  screenStyle: CSSProperties;
  screenClassName?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="pointer-events-none hidden h-auto w-full md:block"
        unoptimized
        data-phone-frame
      />
      <div
        data-phone-screen
        className={`${SCREEN_CLASS} ${screenClassName}`}
        style={screenStyle}
      >
        {children}
      </div>
    </>
  );
}

export const PHONE_COLUMN_CLASS =
  "relative w-full max-w-none shrink-0 overflow-hidden md:max-w-[18rem] lg:max-w-[20rem]";
