import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch {}

const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const ORGS_FILE = path.join(DATA_DIR, "organizations.json");
const SCHEDULE_FILE = path.join(DATA_DIR, "schedule.json");
const NEWS_FILE = path.join(DATA_DIR, "news.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");
const MISSION_NEWS_FILE = path.join(DATA_DIR, "mission_news.json");

function readJSON<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
    }
  } catch {}
  return defaultValue;
}

function writeJSON(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function hasSupabase(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getDB() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function uploadToSupabase(file: Express.Multer.File): Promise<string> {
  const db = getDB();
  const ext = path.extname(file.originalname).slice(1) || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await db.storage
    .from("church-uploads")
    .upload(filename, file.buffer, { contentType: file.mimetype });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return db.storage.from("church-uploads").getPublicUrl(filename).data.publicUrl;
}

const memStorage = multer.memoryStorage();
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: hasSupabase() ? memStorage : diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "StMichael2024!";

function checkAdmin(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction
): void {
  const auth = req.headers["x-admin-key"];
  if (auth !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

function mapEvent(row: Record<string, unknown>) {
  return { id: row.id, title: row.title, titleSr: row.title_sr, date: row.date, description: row.description, descriptionSr: row.description_sr, image: row.image, createdAt: row.created_at };
}
function mapOrg(row: Record<string, unknown>) {
  return { id: row.id, name: row.name, nameSr: row.name_sr, description: row.description, descriptionSr: row.description_sr, image: row.image, contact: row.contact, createdAt: row.created_at };
}
function mapNews(row: Record<string, unknown>) {
  return { id: row.id, title: row.title, titleSr: row.title_sr, body: row.body, bodySr: row.body_sr, date: row.date, image: row.image, pinned: row.pinned, createdAt: row.created_at };
}

interface Event {
  id: string;
  title: string;
  titleSr: string;
  date: string;
  description: string;
  descriptionSr: string;
  image: string;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  nameSr: string;
  description: string;
  descriptionSr: string;
  image: string;
  contact: string;
  createdAt: string;
}

const defaultOrgs: Organization[] = [
  {
    id: "folklore",
    name: "Serbian Folklore Group",
    nameSr: "Српска Фолклорна Група",
    description:
      "Our folklore ensemble keeps the rich tradition of Serbian folk dance and music alive in Utah. Members of all ages are welcome to join and perform at parish events, cultural festivals, and community gatherings throughout the year.",
    descriptionSr:
      "Наш фолклорни ансамбл чува богату традицију српске народне игре и музике у Јути. Чланови свих узраста су добродошли да се придруже и наступају на парохијским приредбама, културним фестивалима и окупљањима током целе године.",
    image: "",
    contact: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "choir",
    name: "Parish Choir",
    nameSr: "Парохијски Хор",
    description:
      "The parish choir sings the Divine Liturgy and other services in the Serbian Orthodox musical tradition. Our singers are the voice of the congregation in worship, lifting hearts and minds toward God with sacred song. New voices are always welcome.",
    descriptionSr:
      "Парохијски хор пева Свету Литургију и друге службе у српској православној музичкој традицији. Наши певачи су глас парохије у богослужењу, подижући срца и умове ка Богу светом песмом. Нови гласови су увек добродошли.",
    image: "",
    contact: "",
    createdAt: new Date().toISOString(),
  },
];

interface ServiceEntry {
  day: string;
  dowEn: string;
  dowSr: string;
  time: string;
  titleEn: string;
  titleSr: string;
}
interface Schedule {
  monthEn: string;
  monthSr: string;
  gofundmeUrl?: string;
  services: ServiceEntry[];
}

const defaultSchedule: Schedule = {
  monthEn: "Every Sunday",
  monthSr: "Сваке Недеље",
  gofundmeUrl: "",
  services: [{ day: "Every Sunday", dowEn: "Sunday", dowSr: "Недеља", time: "10:00 AM", titleEn: "Divine Liturgy", titleSr: "Света Литургија" }],
};

interface NewsItem {
  id: string;
  title: string;
  titleSr: string;
  body: string;
  bodySr: string;
  date: string;
  image: string;
  pinned: boolean;
  createdAt: string;
}

interface HistoryTimeline { year: string; yearSr: string; textEn: string; textSr: string; }
interface HistoryData {
  introEn: string;
  introSr: string;
  images: string[];
  timeline: HistoryTimeline[];
}

const defaultHistory: HistoryData = { introEn: "", introSr: "", images: [], timeline: [] };

const CHURCH_EMAIL = "serbianorthodoxchurchslc@gmail.com";

function createMailTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: CHURCH_EMAIL, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

const router: IRouter = Router();

/* ============================================================
   ADMIN LOGIN
   ============================================================ */
router.post("/admin/login", (req, res) => {
  const { password } = req.body as { password: string };
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, key: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

/* ============================================================
   CONTACT FORM EMAIL
   ============================================================ */
router.post("/contact", async (req, res) => {
  const { name, contact, message } = req.body as { name?: string; contact?: string; message?: string };
  if (!name || !contact || !message) { res.status(400).json({ error: "Missing fields" }); return; }
  if (!process.env.GMAIL_APP_PASSWORD) { res.status(500).json({ error: "Email not configured" }); return; }
  try {
    await createMailTransport().sendMail({
      from: `"St. Archangel Michael Website" <${CHURCH_EMAIL}>`,
      to: CHURCH_EMAIL,
      subject: `Website Contact Form — ${name}`,
      text: `Name: ${name}\nContact: ${contact}\n\nMessage:\n${message}`,
      html: `<div style="font-family:Georgia,serif;max-width:600px;padding:24px;border:1px solid #c9a84c;border-radius:4px"><h2 style="border-bottom:2px solid #c9a84c;padding-bottom:12px">New Contact Form Submission</h2><p><strong>Name:</strong> ${name}</p><p><strong>Contact:</strong> ${contact}</p><h3>Message:</h3><p style="background:#f9f5ec;padding:16px;border-radius:4px;white-space:pre-wrap">${message}</p></div>`,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Contact email error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

/* ============================================================
   MEMBERSHIP FORM EMAIL
   ============================================================ */
router.post("/membership", async (req, res) => {
  const b = req.body as Record<string, string>;
  if (!b.surname || !b.name || !b.dob || !b.pob || !b.tel || !b.email || !b.address) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  if (!process.env.GMAIL_APP_PASSWORD) { res.status(500).json({ error: "Email not configured" }); return; }
  const r = (label: string, val?: string) => val ? `<tr><td style="padding:7px 0;color:#555;width:200px"><strong>${label}</strong></td><td>${val}</td></tr>` : "";
  try {
    await createMailTransport().sendMail({
      from: `"St. Archangel Michael Website" <${CHURCH_EMAIL}>`,
      to: CHURCH_EMAIL,
      subject: `Membership Application — ${b.surname}, ${b.name}`,
      text: `MEMBERSHIP APPLICATION\n\nSurname: ${b.surname}\nName: ${b.name}\nDOB: ${b.dob}\nPOB: ${b.pob}\nDOBaptism: ${b.dobaptism||""}\nPOBaptism: ${b.pobaptism||""}\nMarital: ${b.marital||""}\nSpouse: ${b.spouse||""}\nChildren: ${b.children||""}\nChildren Names: ${b.childrenNames||""}\nTel: ${b.tel}\nEmail: ${b.email}\nAddress: ${b.address}\nSlava: ${b.slava||""}\nPrevious Parish: ${b.fromParish||""}`,
      html: `<div style="font-family:Georgia,serif;max-width:640px;padding:24px;border:1px solid #c9a84c;border-radius:4px"><h2 style="border-bottom:2px solid #c9a84c;padding-bottom:12px">New Membership Application — ${b.surname}, ${b.name}</h2><h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #e0d5c0;padding-bottom:6px">Personal Information</h3><table style="width:100%;border-collapse:collapse">${r("Surname",b.surname)}${r("Name",b.name)}${r("Date of Birth",b.dob)}${r("Place of Birth",b.pob)}${r("Date of Baptism",b.dobaptism)}${r("Place of Baptism",b.pobaptism)}${r("Marital Status",b.marital)}${r("Spouse",b.spouse)}${r("Children",b.children)}${r("Children Names",b.childrenNames)}</table><h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #e0d5c0;padding-bottom:6px;margin-top:20px">Contact Information</h3><table style="width:100%;border-collapse:collapse">${r("Telephone",b.tel)}${r("Email",b.email)}${r("Address",b.address)}</table><h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #e0d5c0;padding-bottom:6px;margin-top:20px">Church Information</h3><table style="width:100%;border-collapse:collapse">${r("Patron Saint",b.slava)}${r("Previous Parish",b.fromParish)}</table></div>`,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Membership email error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

/* ============================================================
   STATIC UPLOADS (local dev fallback)
   ============================================================ */
router.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

/* ============================================================
   EVENTS
   ============================================================ */
router.get("/events", async (_req, res) => {
  if (hasSupabase()) {
    const db = getDB();
    const { data, error } = await db.from("church_events").select("*").order("created_at", { ascending: false });
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json((data || []).map(mapEvent));
  } else {
    res.json(readJSON<Event[]>(EVENTS_FILE, []));
  }
});

router.post("/events", checkAdmin, upload.single("image"), async (req, res) => {
  const b = req.body as Record<string, string>;
  if (hasSupabase()) {
    const db = getDB();
    let imageUrl = "";
    if (req.file) imageUrl = await uploadToSupabase(req.file);
    const { data, error } = await db.from("church_events").insert({
      id: Date.now().toString(),
      title: b.title || "",
      title_sr: b.titleSr || "",
      date: b.date || "",
      description: b.description || "",
      description_sr: b.descriptionSr || "",
      image: imageUrl,
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(mapEvent(data as Record<string, unknown>));
  } else {
    const events = readJSON<Event[]>(EVENTS_FILE, []);
    const event: Event = {
      id: Date.now().toString(),
      title: b.title || "",
      titleSr: b.titleSr || "",
      date: b.date || "",
      description: b.description || "",
      descriptionSr: b.descriptionSr || "",
      image: req.file ? `/api/church/uploads/${req.file.filename}` : "",
      createdAt: new Date().toISOString(),
    };
    events.unshift(event);
    writeJSON(EVENTS_FILE, events);
    res.json(event);
  }
});

router.put("/events/:id", checkAdmin, upload.single("image"), async (req, res) => {
  const b = req.body as Record<string, string>;
  if (hasSupabase()) {
    const db = getDB();
    const { data: existing } = await db.from("church_events").select("*").eq("id", req.params.id).single();
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    let imageUrl = (existing as Record<string, unknown>).image as string;
    if (req.file) imageUrl = await uploadToSupabase(req.file);
    const { data, error } = await db.from("church_events").update({
      title: b.title ?? (existing as Record<string, unknown>).title,
      title_sr: b.titleSr ?? (existing as Record<string, unknown>).title_sr,
      date: b.date ?? (existing as Record<string, unknown>).date,
      description: b.description ?? (existing as Record<string, unknown>).description,
      description_sr: b.descriptionSr ?? (existing as Record<string, unknown>).description_sr,
      image: imageUrl,
    }).eq("id", req.params.id).select().single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(mapEvent(data as Record<string, unknown>));
  } else {
    const events = readJSON<Event[]>(EVENTS_FILE, []);
    const idx = events.findIndex((e) => e.id === req.params.id);
    if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
    events[idx] = {
      ...events[idx],
      title: b.title ?? events[idx].title,
      titleSr: b.titleSr ?? events[idx].titleSr,
      date: b.date ?? events[idx].date,
      description: b.description ?? events[idx].description,
      descriptionSr: b.descriptionSr ?? events[idx].descriptionSr,
      image: req.file ? `/api/church/uploads/${req.file.filename}` : events[idx].image,
    };
    writeJSON(EVENTS_FILE, events);
    res.json(events[idx]);
  }
});

router.delete("/events/:id", checkAdmin, async (req, res) => {
  if (hasSupabase()) {
    const db = getDB();
    const { error } = await db.from("church_events").delete().eq("id", req.params.id);
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json({ success: true });
  } else {
    const events = readJSON<Event[]>(EVENTS_FILE, []);
    writeJSON(EVENTS_FILE, events.filter((e) => e.id !== req.params.id));
    res.json({ success: true });
  }
});

/* ============================================================
   ORGANIZATIONS
   ============================================================ */
router.get("/organizations", async (_req, res) => {
  if (hasSupabase()) {
    const db = getDB();
    const { data, error } = await db.from("church_organizations").select("*").order("created_at", { ascending: true });
    if (error) { res.status(500).json({ error: error.message }); return; }
    const rows = data || [];
    if (rows.length === 0) {
      const seedRows = defaultOrgs.map(o => ({
        id: o.id,
        name: o.name,
        name_sr: o.nameSr,
        description: o.description,
        description_sr: o.descriptionSr,
        image: o.image,
        contact: o.contact,
        created_at: new Date().toISOString(),
      }));
      const { data: inserted } = await db.from("church_organizations").insert(seedRows).select();
      res.json((inserted || []).map(mapOrg));
      return;
    }
    res.json(rows.map(mapOrg));
  } else {
    res.json(readJSON<Organization[]>(ORGS_FILE, defaultOrgs));
  }
});

router.post("/organizations", checkAdmin, upload.single("image"), async (req, res) => {
  const b = req.body as Record<string, string>;
  if (hasSupabase()) {
    const db = getDB();
    let imageUrl = "";
    if (req.file) imageUrl = await uploadToSupabase(req.file);
    const { data, error } = await db.from("church_organizations").insert({
      id: Date.now().toString(),
      name: b.name || "",
      name_sr: b.nameSr || "",
      description: b.description || "",
      description_sr: b.descriptionSr || "",
      image: imageUrl,
      contact: b.contact || "",
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(mapOrg(data as Record<string, unknown>));
  } else {
    const orgs = readJSON<Organization[]>(ORGS_FILE, defaultOrgs);
    const org: Organization = {
      id: Date.now().toString(),
      name: b.name || "",
      nameSr: b.nameSr || "",
      description: b.description || "",
      descriptionSr: b.descriptionSr || "",
      image: req.file ? `/api/church/uploads/${req.file.filename}` : "",
      contact: b.contact || "",
      createdAt: new Date().toISOString(),
    };
    orgs.push(org);
    writeJSON(ORGS_FILE, orgs);
    res.json(org);
  }
});

router.put("/organizations/:id", checkAdmin, upload.single("image"), async (req, res) => {
  const b = req.body as Record<string, string>;
  if (hasSupabase()) {
    const db = getDB();
    const { data: existing } = await db.from("church_organizations").select("*").eq("id", req.params.id).single();
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    const ex = existing as Record<string, unknown>;
    let imageUrl = ex.image as string;
    if (req.file) imageUrl = await uploadToSupabase(req.file);
    const { data, error } = await db.from("church_organizations").update({
      name: b.name ?? ex.name,
      name_sr: b.nameSr ?? ex.name_sr,
      description: b.description ?? ex.description,
      description_sr: b.descriptionSr ?? ex.description_sr,
      image: imageUrl,
      contact: b.contact ?? ex.contact,
    }).eq("id", req.params.id).select().single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(mapOrg(data as Record<string, unknown>));
  } else {
    const orgs = readJSON<Organization[]>(ORGS_FILE, defaultOrgs);
    const idx = orgs.findIndex((o) => o.id === req.params.id);
    if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
    orgs[idx] = {
      ...orgs[idx],
      name: b.name ?? orgs[idx].name,
      nameSr: b.nameSr ?? orgs[idx].nameSr,
      description: b.description ?? orgs[idx].description,
      descriptionSr: b.descriptionSr ?? orgs[idx].descriptionSr,
      image: req.file ? `/api/church/uploads/${req.file.filename}` : orgs[idx].image,
      contact: b.contact ?? orgs[idx].contact,
    };
    writeJSON(ORGS_FILE, orgs);
    res.json(orgs[idx]);
  }
});

router.delete("/organizations/:id", checkAdmin, async (req, res) => {
  if (hasSupabase()) {
    const db = getDB();
    const { error } = await db.from("church_organizations").delete().eq("id", req.params.id);
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json({ success: true });
  } else {
    const orgs = readJSON<Organization[]>(ORGS_FILE, defaultOrgs);
    writeJSON(ORGS_FILE, orgs.filter((o) => o.id !== req.params.id));
    res.json({ success: true });
  }
});

/* ============================================================
   SCHEDULE
   ============================================================ */
router.get("/schedule", async (_req, res) => {
  if (hasSupabase()) {
    const db = getDB();
    const { data, error } = await db.from("church_schedule").select("*").eq("id", 1).single();
    if (error || !data) { res.json(defaultSchedule); return; }
    const row = data as Record<string, unknown>;
    res.json({
      monthEn: row.month_en ?? "",
      monthSr: row.month_sr ?? "",
      gofundmeUrl: row.gofundme_url ?? "",
      services: row.services ?? [],
    });
  } else {
    res.json(readJSON<Schedule>(SCHEDULE_FILE, defaultSchedule));
  }
});

router.put("/schedule", checkAdmin, async (req, res) => {
  const body = req.body as Schedule;
  if (!Array.isArray(body.services)) {
    res.status(400).json({ error: "Invalid schedule data: services must be an array" });
    return;
  }
  if (hasSupabase()) {
    const db = getDB();
    const { error } = await db.from("church_schedule").upsert({
      id: 1,
      month_en: body.monthEn ?? "",
      month_sr: body.monthSr ?? "",
      gofundme_url: body.gofundmeUrl ?? "",
      services: body.services,
    });
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(body);
  } else {
    writeJSON(SCHEDULE_FILE, body);
    res.json(body);
  }
});

/* ============================================================
   NEWS
   ============================================================ */
router.get("/news", async (_req, res) => {
  if (hasSupabase()) {
    const db = getDB();
    const { data, error } = await db.from("church_news").select("*").order("created_at", { ascending: false });
    if (error) { res.status(500).json({ error: error.message }); return; }
    const items = (data || []).map(mapNews);
    res.json(items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)));
  } else {
    const items = readJSON<NewsItem[]>(NEWS_FILE, []);
    res.json(items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)));
  }
});

router.post("/news", checkAdmin, upload.single("image"), async (req, res) => {
  const b = req.body as Record<string, string>;
  if (hasSupabase()) {
    const db = getDB();
    let imageUrl = "";
    if (req.file) imageUrl = await uploadToSupabase(req.file);
    const { data, error } = await db.from("church_news").insert({
      id: Date.now().toString(),
      title: b.title || "",
      title_sr: b.titleSr || "",
      body: b.body || "",
      body_sr: b.bodySr || "",
      date: b.date || "",
      image: imageUrl,
      pinned: b.pinned === "true",
      created_at: new Date().toISOString(),
    }).select().single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(mapNews(data as Record<string, unknown>));
  } else {
    const items = readJSON<NewsItem[]>(NEWS_FILE, []);
    const item: NewsItem = {
      id: Date.now().toString(),
      title: b.title || "",
      titleSr: b.titleSr || "",
      body: b.body || "",
      bodySr: b.bodySr || "",
      date: b.date || "",
      image: req.file ? `/api/church/uploads/${req.file.filename}` : "",
      pinned: b.pinned === "true",
      createdAt: new Date().toISOString(),
    };
    items.unshift(item);
    writeJSON(NEWS_FILE, items);
    res.json(item);
  }
});

router.put("/news/:id", checkAdmin, upload.single("image"), async (req, res) => {
  const b = req.body as Record<string, string>;
  if (hasSupabase()) {
    const db = getDB();
    const { data: existing } = await db.from("church_news").select("*").eq("id", req.params.id).single();
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    const ex = existing as Record<string, unknown>;
    let imageUrl = ex.image as string;
    if (req.file) imageUrl = await uploadToSupabase(req.file);
    const { data, error } = await db.from("church_news").update({
      title: b.title ?? ex.title,
      title_sr: b.titleSr ?? ex.title_sr,
      body: b.body ?? ex.body,
      body_sr: b.bodySr ?? ex.body_sr,
      date: b.date ?? ex.date,
      image: imageUrl,
      pinned: b.pinned !== undefined ? b.pinned === "true" : ex.pinned,
    }).eq("id", req.params.id).select().single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(mapNews(data as Record<string, unknown>));
  } else {
    const items = readJSON<NewsItem[]>(NEWS_FILE, []);
    const idx = items.findIndex((n) => n.id === req.params.id);
    if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
    items[idx] = {
      ...items[idx],
      title: b.title ?? items[idx].title,
      titleSr: b.titleSr ?? items[idx].titleSr,
      body: b.body ?? items[idx].body,
      bodySr: b.bodySr ?? items[idx].bodySr,
      date: b.date ?? items[idx].date,
      image: req.file ? `/api/church/uploads/${req.file.filename}` : items[idx].image,
      pinned: b.pinned !== undefined ? b.pinned === "true" : items[idx].pinned,
    };
    writeJSON(NEWS_FILE, items);
    res.json(items[idx]);
  }
});

router.delete("/news/:id", checkAdmin, async (req, res) => {
  if (hasSupabase()) {
    const db = getDB();
    const { error } = await db.from("church_news").delete().eq("id", req.params.id);
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json({ success: true });
  } else {
    const items = readJSON<NewsItem[]>(NEWS_FILE, []);
    writeJSON(NEWS_FILE, items.filter((n) => n.id !== req.params.id));
    res.json({ success: true });
  }
});

/* ============================================================
   HISTORY
   ============================================================ */
router.get("/history", async (_req, res) => {
  if (hasSupabase()) {
    const db = getDB();
    const { data, error } = await db.from("church_history").select("*").eq("id", 1).single();
    if (error || !data) { res.json(defaultHistory); return; }
    const row = data as Record<string, unknown>;
    res.json({ introEn: row.intro_en, introSr: row.intro_sr, images: row.images, timeline: row.timeline });
  } else {
    res.json(readJSON<HistoryData>(HISTORY_FILE, defaultHistory));
  }
});

router.put("/history", checkAdmin, upload.array("images", 6), async (req, res) => {
  const b = req.body as Record<string, string>;
  if (hasSupabase()) {
    const db = getDB();
    const { data: existing } = await db.from("church_history").select("*").eq("id", 1).single();
    const ex = (existing as Record<string, unknown> | null) ?? { intro_en: "", intro_sr: "", images: [], timeline: [] };
    const newImages: string[] = await Promise.all(
      ((req.files as Express.Multer.File[] | undefined) ?? []).map(f => uploadToSupabase(f))
    );
    const keepImages: string[] = b.keepImages ? JSON.parse(b.keepImages) : (ex.images as string[]);
    let timeline: HistoryTimeline[] = [];
    try { timeline = JSON.parse(b.timeline || "[]"); } catch {}
    const historyData = {
      id: 1,
      intro_en: b.introEn ?? (ex.intro_en as string),
      intro_sr: b.introSr ?? (ex.intro_sr as string),
      images: [...keepImages, ...newImages],
      timeline,
    };
    const { error } = await db.from("church_history").upsert(historyData);
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json({ introEn: historyData.intro_en, introSr: historyData.intro_sr, images: historyData.images, timeline: historyData.timeline });
  } else {
    const existing = readJSON<HistoryData>(HISTORY_FILE, defaultHistory);
    const newImages: string[] = (req.files as Express.Multer.File[] | undefined ?? [])
      .map(f => `/api/church/uploads/${f.filename}`);
    const keepImages: string[] = b.keepImages ? JSON.parse(b.keepImages) : existing.images;
    let timeline: HistoryTimeline[] = [];
    try { timeline = JSON.parse(b.timeline || "[]"); } catch {}
    const data: HistoryData = {
      introEn: b.introEn ?? existing.introEn,
      introSr: b.introSr ?? existing.introSr,
      images: [...keepImages, ...newImages],
      timeline,
    };
    writeJSON(HISTORY_FILE, data);
    res.json(data);
  }
});

/* ============================================================
   MISSION NEWS
   ============================================================ */
router.get("/mission-news", async (_req, res) => {
  if (hasSupabase()) {
    const db = getDB();
    const { data, error } = await db.from("mission_news").select("*").order("created_at", { ascending: false });
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json((data || []).map(mapNews));
  } else {
    res.json(readJSON<NewsItem[]>(MISSION_NEWS_FILE, []));
  }
});

router.post("/mission-news", checkAdmin, upload.single("image"), async (req, res) => {
  const b = req.body as Record<string, string>;
  if (hasSupabase()) {
    const db = getDB();
    let imageUrl = "";
    if (req.file) imageUrl = await uploadToSupabase(req.file);
    const { data, error } = await db.from("mission_news").insert({
      id: Date.now().toString(), title: b.title || "", title_sr: b.titleSr || "",
      body: b.body || "", body_sr: b.bodySr || "", date: b.date || "",
      image: imageUrl, pinned: b.pinned === "true", created_at: new Date().toISOString(),
    }).select().single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(mapNews(data as Record<string, unknown>));
  } else {
    const items = readJSON<NewsItem[]>(MISSION_NEWS_FILE, []);
    const item: NewsItem = {
      id: Date.now().toString(), title: b.title || "", titleSr: b.titleSr || "",
      body: b.body || "", bodySr: b.bodySr || "", date: b.date || "",
      image: req.file ? `/api/church/uploads/${req.file.filename}` : "",
      pinned: b.pinned === "true", createdAt: new Date().toISOString(),
    };
    items.unshift(item); writeJSON(MISSION_NEWS_FILE, items); res.json(item);
  }
});

router.put("/mission-news/:id", checkAdmin, upload.single("image"), async (req, res) => {
  const b = req.body as Record<string, string>;
  if (hasSupabase()) {
    const db = getDB();
    const { data: existing } = await db.from("mission_news").select("*").eq("id", req.params.id).single();
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    const ex = existing as Record<string, unknown>;
    let imageUrl = ex.image as string;
    if (req.file) imageUrl = await uploadToSupabase(req.file);
    const { data, error } = await db.from("mission_news").update({
      title: b.title ?? ex.title, title_sr: b.titleSr ?? ex.title_sr,
      body: b.body ?? ex.body, body_sr: b.bodySr ?? ex.body_sr,
      date: b.date ?? ex.date, image: imageUrl,
      pinned: b.pinned !== undefined ? b.pinned === "true" : ex.pinned,
    }).eq("id", req.params.id).select().single();
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(mapNews(data as Record<string, unknown>));
  } else {
    const items = readJSON<NewsItem[]>(MISSION_NEWS_FILE, []);
    const idx = items.findIndex((n) => n.id === req.params.id);
    if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
    items[idx] = {
      ...items[idx],
      title: b.title ?? items[idx].title, titleSr: b.titleSr ?? items[idx].titleSr,
      body: b.body ?? items[idx].body, bodySr: b.bodySr ?? items[idx].bodySr,
      date: b.date ?? items[idx].date,
      image: req.file ? `/api/church/uploads/${req.file.filename}` : items[idx].image,
      pinned: b.pinned !== undefined ? b.pinned === "true" : items[idx].pinned,
    };
    writeJSON(MISSION_NEWS_FILE, items); res.json(items[idx]);
  }
});

router.delete("/mission-news/:id", checkAdmin, async (req, res) => {
  if (hasSupabase()) {
    const db = getDB();
    const { error } = await db.from("mission_news").delete().eq("id", req.params.id);
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json({ success: true });
  } else {
    const items = readJSON<NewsItem[]>(MISSION_NEWS_FILE, []);
    writeJSON(MISSION_NEWS_FILE, items.filter((n) => n.id !== req.params.id));
    res.json({ success: true });
  }
});

export default router;