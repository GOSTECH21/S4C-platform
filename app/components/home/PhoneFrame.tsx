"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

const SCREEN_CLASS =
  "relative z-20 overflow-hidden max-md:!inset-auto max-md:static max-md:w-full max-md:rounded-2xl max-md:border max-md:border-slate-200 md:absolute";

const UNFRAMED_SCREEN_CLASS =
  "relative z-20 w-full overflow-hidden rounded-2xl border border-slate-200";

export function PhoneFrame({
  src,
  alt,
  width,
  height,
  screenStyle,
  screenClassName = "",
  framed = true,
  children,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  screenStyle: CSSProperties;
  screenClassName?: string;
  framed?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {framed ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="pointer-events-none hidden h-auto w-full md:block"
          unoptimized
          data-phone-frame
        />
      ) : null}
      <div
        data-phone-screen
        data-phone-unframed={framed ? undefined : "true"}
        className={`${framed ? SCREEN_CLASS : UNFRAMED_SCREEN_CLASS} ${screenClassName}`}
        style={
          framed
            ? screenStyle
            : { backgroundColor: screenStyle.backgroundColor }
        }
      >
        {children}
      </div>
    </>
  );
}

export const PHONE_COLUMN_CLASS =
  "relative w-full max-w-none shrink-0 overflow-hidden md:max-w-[18rem] lg:max-w-[20rem]";

export const CLUB_FIXTURE_COLUMN_CLASS =
  "relative w-full max-w-xl shrink-0 overflow-hidden";
