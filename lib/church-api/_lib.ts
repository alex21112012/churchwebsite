import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import { readFileSync } from "fs";
import path from "path";
import type { IncomingMessage } from "http";

export function getDB() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "StMichael2024!";

export function isAdmin(headers: Record<string, string | string[] | undefined>): boolean {
  return headers["x-admin-key"] === ADMIN_PASSWORD;
}

export async function uploadToStorage(
  buffer: Buffer,
  mimetype: string,
  ext: string
): Promise<string> {
  const db = getDB();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await db.storage
    .from("church-uploads")
    .upload(filename, buffer, { contentType: mimetype });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return db.storage.from("church-uploads").getPublicUrl(filename).data.publicUrl;
}

export interface ParsedForm {
  fields: Record<string, string>;
  file?: { buffer: Buffer; mimetype: string; ext: string };
  files?: Array<{ buffer: Buffer; mimetype: string; ext: string }>;
}
export async function parseMultipart(
  req: IncomingMessage,
  multiFile = false
): Promise<ParsedForm> {
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: multiFile ? 9 : 1,
    allowEmptyFiles: true,
    minFileSize: 0,
  });

  const [rawFields, rawFiles] = await form.parse(req);

  const fields: Record<string, string> = {};

  for (const [key, val] of Object.entries(rawFields)) {
    fields[key] = Array.isArray(val) ? val[0] ?? "" : val ?? "";
  }

  const toArray = (fileOrFiles: unknown) => {
    if (!fileOrFiles) return [];
    return Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
  };

  if (multiFile) {
    const imgFiles = toArray(rawFiles["images"])
      .filter((f) => f && typeof f === "object" && "filepath" in f && "size" in f)
      .filter((f) => Number((f as { size?: number }).size ?? 0) > 0)
      .slice(0, 9);

    const files = imgFiles.map((f) => {
      const file = f as {
        filepath: string;
        mimetype?: string | null;
        originalFilename?: string | null;
      };

      return {
        buffer: readFileSync(file.filepath),
        mimetype: file.mimetype ?? "image/jpeg",
        ext:
          path.extname(file.originalFilename ?? "file.jpg").replace(".", "") ||
          "jpg",
      };
    });

    return { fields, files };
  }

  const imgFiles = toArray(rawFiles["image"])
    .filter((f) => f && typeof f === "object" && "filepath" in f && "size" in f)
    .filter((f) => Number((f as { size?: number }).size ?? 0) > 0);

  const imgFile = imgFiles[0] as
    | {
        filepath: string;
        mimetype?: string | null;
        originalFilename?: string | null;
      }
    | undefined;

  if (!imgFile) {
    return { fields };
  }

  return {
    fields,
    file: {
      buffer: readFileSync(imgFile.filepath),
      mimetype: imgFile.mimetype ?? "image/jpeg",
      ext:
        path.extname(imgFile.originalFilename ?? "file.jpg").replace(".", "") ||
        "jpg",
    },
  };
}

export function mapEvent(row: Record<string, unknown>) {
  const image = (row["image"] as string) || "";

  let images: string[] = [];

  if (Array.isArray(row["images"])) {
    images = row["images"] as string[];
  }

  if (images.length === 0 && image) {
    images = [image];
  }

  return {
    id: row["id"],
    title: row["title"],
    titleSr: row["title_sr"],
    date: row["date"],
    description: row["description"],
    descriptionSr: row["description_sr"],
    image,
    images,
    createdAt: row["created_at"],
  };
}

export function mapOrg(row: Record<string, unknown>) {
  return {
    id: row["id"],
    name: row["name"],
    nameSr: row["name_sr"],
    description: row["description"],
    descriptionSr: row["description_sr"],
    image: row["image"],
    contact: row["contact"],
    createdAt: row["created_at"],
  };
}

export function mapNews(row: Record<string, unknown>) {
  return {
    id: row["id"],
    title: row["title"],
    titleSr: row["title_sr"],
    body: row["body"],
    bodySr: row["body_sr"],
    date: row["date"],
    image: row["image"],
    pinned: row["pinned"],
    createdAt: row["created_at"],
  };
}
