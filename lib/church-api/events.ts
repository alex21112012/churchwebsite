import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDB, isAdmin, uploadToStorage, parseMultipart, mapEvent } from "./_lib";

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDB();
  const id = req.query["id"] as string | undefined;

  if (req.method === "GET") {
    const { data, error } = await db
      .from("church_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    return res.json((data ?? []).map((r) => mapEvent(r as Record<string, unknown>)));
  }

  if (req.method === "POST") {
    if (!isAdmin(req.headers)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { fields, files } = await parseMultipart(req, true);

    const uploadFiles = (files ?? []).slice(0, 9);

    const imageUrls = await Promise.all(
      uploadFiles.map((f) => uploadToStorage(f.buffer, f.mimetype, f.ext))
    );

    const imageUrl = imageUrls[0] ?? "";

    const { data, error } = await db
      .from("church_events")
      .insert({
        id: Date.now().toString(),
        title: fields["title"] ?? "",
        title_sr: fields["titleSr"] ?? "",
        date: fields["date"] ?? "",
        description: fields["description"] ?? "",
        description_sr: fields["descriptionSr"] ?? "",
        image: imageUrl,
        images: imageUrls,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.json(mapEvent(data as Record<string, unknown>));
  }

  if (req.method === "PUT") {
    if (!isAdmin(req.headers)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ error: "Missing event id" });
    }

    const { data: existing, error: existingError } = await db
      .from("church_events")
      .select("*")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      return res.status(404).json({ error: "Event not found" });
    }

    const ex = existing as Record<string, unknown>;

    const { fields, files } = await parseMultipart(req, true);

    const existingImages = Array.isArray(ex["images"])
      ? (ex["images"] as string[])
      : ex["image"]
        ? [ex["image"] as string]
        : [];

    const uploadFiles = (files ?? []).slice(0, 9);

    const uploadedImages = await Promise.all(
      uploadFiles.map((f) => uploadToStorage(f.buffer, f.mimetype, f.ext))
    );

    const imageUrls = uploadedImages.length > 0 ? uploadedImages : existingImages;
    const imageUrl = imageUrls[0] ?? "";

    const { data, error } = await db
      .from("church_events")
      .update({
        title: fields["title"] ?? ex["title"],
        title_sr: fields["titleSr"] ?? ex["title_sr"],
        date: fields["date"] ?? ex["date"],
        description: fields["description"] ?? ex["description"],
        description_sr: fields["descriptionSr"] ?? ex["description_sr"],
        image: imageUrl,
        images: imageUrls,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.json(mapEvent(data as Record<string, unknown>));
  }

  if (req.method === "DELETE") {
    if (!isAdmin(req.headers)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ error: "Missing event id" });
    }

    const { error } = await db
      .from("church_events")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}