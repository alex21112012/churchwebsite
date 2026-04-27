import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDB, isAdmin, uploadToStorage, parseMultipart, mapNews } from "../_lib";

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDB();
  const id = req.query["id"] as string;

  if (req.method === "PUT") {
    if (!isAdmin(req.headers)) return res.status(401).json({ error: "Unauthorized" });
    const { data: existing } = await db.from("church_news").select("*").eq("id", id).single();
    if (!existing) return res.status(404).json({ error: "Not found" });
    const ex = existing as Record<string, unknown>;
    const { fields, file } = await parseMultipart(req);
    let imageUrl = ex["image"] as string;
    if (file) imageUrl = await uploadToStorage(file.buffer, file.mimetype, file.ext);
    const { data, error } = await db
      .from("church_news")
      .update({
        title: fields["title"] ?? ex["title"],
        title_sr: fields["titleSr"] ?? ex["title_sr"],
        body: fields["body"] ?? ex["body"],
        body_sr: fields["bodySr"] ?? ex["body_sr"],
        date: fields["date"] ?? ex["date"],
        image: imageUrl,
        pinned: fields["pinned"] !== undefined ? fields["pinned"] === "true" : ex["pinned"],
      })
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(mapNews(data as Record<string, unknown>));
  }

  if (req.method === "DELETE") {
    if (!isAdmin(req.headers)) return res.status(401).json({ error: "Unauthorized" });
    const { error } = await db.from("church_news").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
