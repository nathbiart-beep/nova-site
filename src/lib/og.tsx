import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const ogSize = { width: 1200, height: 630 };

const MINT = "#eef6ee";
const GREEN = "#55ff22";
const INK = "#111111";

function StarSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path
        fill={GREEN}
        fillRule="evenodd"
        d="M50 4C52.6 31 63 45 94 50C63 55 52.6 69 50 96C47.4 69 37 55 6 50C37 45 47.4 31 50 4ZM50 29C47.8 41 43 46.5 32 50C43 53.5 47.8 59 50 71C52.2 59 57 53.5 68 50C57 46.5 52.2 41 50 29Z"
      />
      <path d="M22 22L30 31M78 22L70 31M22 78L30 69M78 78L70 69" stroke={GREEN} strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

/** Branded share image: mint background, N✦VA wordmark, title, small label. */
export async function ogImage({ title, label }: { title: string; label?: string }) {
  const [black, semi] = await Promise.all([
    readFile(path.join(process.cwd(), "src/fonts/montserrat-latin-900-normal.woff")),
    readFile(path.join(process.cwd(), "src/fonts/montserrat-latin-600-normal.woff")),
  ]);
  const fontSize = title.length > 70 ? 54 : title.length > 40 ? 66 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: MINT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily: "Montserrat",
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 72, fontWeight: 900, letterSpacing: -2 }}>
            <span>N</span>
            <StarSvg size={84} />
            <span>VA</span>
          </div>
          {label ? (
            <div
              style={{
                display: "flex",
                background: GREEN,
                borderRadius: 999,
                padding: "12px 28px",
                fontSize: 28,
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            background: "#ffffff",
            borderRadius: 32,
            padding: "40px 48px",
            boxShadow: `14px 14px 0 ${GREEN}`,
            border: `3px solid ${INK}`,
            fontSize,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 600 }}>Bruxelles · Namur · Louvain-la-Neuve · @nova.bxl</div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Montserrat", data: black, weight: 900, style: "normal" },
        { name: "Montserrat", data: semi, weight: 600, style: "normal" },
      ],
    },
  );
}
