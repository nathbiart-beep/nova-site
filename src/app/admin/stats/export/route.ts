import { checkAdmin } from "@/lib/admin-auth";
import { PERIODS, exportRows, type Period } from "@/lib/analytics-queries";

export const dynamic = "force-dynamic";

/** Export brut de toutes les lignes de la période, à ouvrir dans Excel ou Google Sheets. */
export async function GET(req: Request) {
  const auth = await checkAdmin();
  if (!auth.ok) return new Response("Accès réservé", { status: 401 });
  const q = new URL(req.url).searchParams.get("p") || "30d";
  const p = (q in PERIODS ? q : "30d") as Period;
  const rows = await exportRows(p);
  const cols = rows[0] ? Object.keys(rows[0]) : ["date"];
  const esc = (v: string | null) => (v == null ? "" : /[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const csv = "﻿" + [cols.join(";"), ...rows.map((r) => cols.map((c) => esc(r[c])).join(";"))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nova-stats-${p}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
