import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDB, isAdmin, uploadToStorage, parseMultipart } from "./_lib";

export const config = { api: { bodyParser: false } };

const defaultHistory = { introEn: "", introSr: "", images: [], timeline: [] };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDB();

  if (req.method === "GET") {
    const { data, error } = await db.from("church_history").select("*").eq("id", 1).single();
    if (error || !data) return res.json(defaultHistory);
    const row = data as Record<string, unknown>;
    return res.json({ introEn: row["intro_en"], introSr: row["intro_sr"], images: row["images"], timeline: row["timeline"] });
  }

  if (req.method === "PUT") {
    if (!isAdmin(req.headers)) return res.status(401).json({ error: "Unauthorized" });
    const { fields, files } = await parseMultipart(req, true);

    const { data: existing } = await db.from("church_history").select("*").eq("id", 1).single();
    const ex = (existing as Record<string, unknown> | null) ?? { intro_en: "", intro_sr: "", images: [], timeline: [] };

    const newImages: string[] = await Promise.all(
      (files ?? []).map((f) => uploadToStorage(f.buffer, f.mimetype, f.ext))
    );
    const keepImages: string[] = fields["keepImages"] ? JSON.parse(fields["keepImages"]) : (ex["images"] as string[]);
    let timeline: unknown[] = [];
    try { timeline = JSON.parse(fields["timeline"] ?? "[]"); } catch {}

    const historyData = {
      id: 1,
      intro_en: fields["introEn"] ?? (ex["intro_en"] as string),
      intro_sr: fields["introSr"] ?? (ex["intro_sr"] as string),
      images: [...keepImages, ...newImages],
      timeline,
    };

    const { error } = await db.from("church_history").upsert(historyData);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({
      introEn: historyData.intro_en,
      introSr: historyData.intro_sr,
      images: historyData.images,
      timeline: historyData.timeline,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
