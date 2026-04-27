import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDB, isAdmin } from "./_lib";

const defaultSchedule = {
  monthEn: "Every Sunday",
  monthSr: "Сваке Недеље",
  gofundmeUrl: "",
  services: [
    {
      day: "Every Sunday",
      dowEn: "Sunday",
      dowSr: "Недеља",
      time: "10:00 AM",
      titleEn: "Divine Liturgy",
      titleSr: "Света Литургија",
    },
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDB();

  if (req.method === "GET") {
    const { data, error } = await db
      .from("church_schedule")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !data) {
      return res.json(defaultSchedule);
    }

    const row = data as Record<string, unknown>;

    return res.json({
      monthEn: row["month_en"],
      monthSr: row["month_sr"],
      services: row["services"],
      gofundmeUrl: row["gofundme_url"] ?? "",
    });
  }

  if (req.method === "PUT") {
    if (!isAdmin(req.headers)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const body = req.body as {
      monthEn?: string;
      monthSr?: string;
      services?: unknown[];
      gofundmeUrl?: string;
    };

    if (!Array.isArray(body.services)) {
      return res.status(400).json({ error: "Invalid schedule data" });
    }

    const { error } = await db.from("church_schedule").upsert({
      id: 1,
      month_en: body.monthEn,
      month_sr: body.monthSr ?? "",
      services: body.services,
      gofundme_url: body.gofundmeUrl ?? "",
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      monthEn: body.monthEn,
      monthSr: body.monthSr ?? "",
      services: body.services,
      gofundmeUrl: body.gofundmeUrl ?? "",
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}