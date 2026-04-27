import type { VercelRequest, VercelResponse } from "@vercel/node";

import contactHandler from "../../lib/church-api/contact";
import eventsHandler from "../../lib/church-api/events";
import eventIdHandler from "../../lib/church-api/events/[id]";
import historyHandler from "../../lib/church-api/history";
import membershipHandler from "../../lib/church-api/membership";
import missionNewsHandler from "../../lib/church-api/mission-news";
import missionNewsIdHandler from "../../lib/church-api/mission-news/[id]";
import newsHandler from "../../lib/church-api/news";
import newsIdHandler from "../../lib/church-api/news/[id]";
import organizationsHandler from "../../lib/church-api/organizations";
import organizationIdHandler from "../../lib/church-api/organizations/[id]";
import scheduleHandler from "../../lib/church-api/schedule";
import adminLoginHandler from "../../lib/church-api/admin/login";

export const config = { api: { bodyParser: false } };

type ApiHandler = (
  req: VercelRequest,
  res: VercelResponse
) => unknown | Promise<unknown>;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const url = req.url || "";
    const path = url.replace(/^\/api\/church\/?/, "").split("?")[0];
    const segments = path.split("/").filter(Boolean);

    if (!segments.length) {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    let selectedHandler: ApiHandler | undefined;

    if (segments[0] === "events" && segments[1]) {
      req.query = { ...req.query, id: segments[1] };
      selectedHandler = eventIdHandler;
    } else if (segments[0] === "news" && segments[1]) {
      req.query = { ...req.query, id: segments[1] };
      selectedHandler = newsIdHandler;
    } else if (segments[0] === "mission-news" && segments[1]) {
      req.query = { ...req.query, id: segments[1] };
      selectedHandler = missionNewsIdHandler;
    } else if (segments[0] === "organizations" && segments[1]) {
      req.query = { ...req.query, id: segments[1] };
      selectedHandler = organizationIdHandler;
    } else if (segments[0] === "admin" && segments[1] === "login") {
      selectedHandler = adminLoginHandler;
    } else {
      switch (segments[0]) {
        case "contact":
          selectedHandler = contactHandler;
          break;

        case "events":
          selectedHandler = eventsHandler;
          break;

        case "history":
          selectedHandler = historyHandler;
          break;

        case "membership":
          selectedHandler = membershipHandler;
          break;

        case "mission-news":
          selectedHandler = missionNewsHandler;
          break;

        case "news":
          selectedHandler = newsHandler;
          break;

        case "organizations":
          selectedHandler = organizationsHandler;
          break;

        case "schedule":
          selectedHandler = scheduleHandler;
          break;

        default:
          return res.status(404).json({
            error: "Endpoint not found",
            path: segments[0],
          });
      }
    }

    if (!selectedHandler) {
      return res.status(500).json({ error: "Handler not found" });
    }

    return selectedHandler(req, res);
  } catch (error) {
    console.error("API Error:", error);

    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}