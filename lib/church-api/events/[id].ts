import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDB, isAdmin, uploadToStorage, parseMultipart, mapEvent } from "../_lib";

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDB();
  const id = req.query["id"] as string;

  if (req.method === "PUT") {
    if (!isAdmin(req.headers)) return res.status(401).json({ error: "Unauthorized" });
    const { data: existing } = await db.from("church_events").select("*").eq("id", id).single();
    if (!existing) return res.status(404).json({ error: "Not found" });
    const ex = existing as Record<string, unknown>;
    const { fields, file } = await parseMultipart(req);
    let imageUrl = ex["image"] as string;
    if (file) imageUrl = await uploadToStorage(file.buffer, file.mimetype, file.ext);
    const { data, error } = await db
      .from("church_events")
      .update({
        title: fields["title"] ?? ex["title"],
        title_sr: fields["titleSr"] ?? ex["title_sr"],
        date: fields["date"] ?? ex["date"],
        description: fields["description"] ?? ex["description"],
        description_sr: fields["descriptionSr"] ?? ex["description_sr"],
        image: imageUrl,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(mapEvent(data as Record<string, unknown>));
  }

  if (req.method === "DELETE") {
    if (!isAdmin(req.headers)) return res.status(401).json({ error: "Unauthorized" });
    const { error } = await db.from("church_events").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
