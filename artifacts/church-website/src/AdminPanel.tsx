import { useState, useEffect, useRef } from "react";

type Lang = "en" | "sr";
type TabName = "news" | "events" | "schedule" | "organizations" | "history" | "mission";

interface ChurchEvent {
  id: string;
  title: string;
  titleSr: string;
  date: string;
  description: string;
  descriptionSr: string;
  image: string;
  images?: string[];
  createdAt: string;
}
interface Organization {
  id: string; name: string; nameSr: string; description: string;
  descriptionSr: string; image: string; contact: string; createdAt: string;
}
interface NewsItem {
  id: string; title: string; titleSr: string; body: string; bodySr: string;
  date: string; image: string; pinned: boolean; createdAt: string;
}
interface ServiceEntry {
  day: string; dowEn: string; dowSr: string; time: string; titleEn: string; titleSr: string;
}
interface Schedule { gofundmeUrl?: string; monthEn: string; monthSr: string; services: ServiceEntry[]; }

interface HistoryTimeline { year: string; yearSr: string; textEn: string; textSr: string; }
interface HistoryData { introEn: string; introSr: string; images: string[]; timeline: HistoryTimeline[]; }

interface Props { lang: Lang; onClose: () => void; }

const inp: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,165,90,0.2)",
  color: "white", padding: "10px 14px", fontSize: "1rem",
  fontFamily: "'Cormorant Garamond', Georgia, serif", outline: "none", boxSizing: "border-box",
};
const ta: React.CSSProperties = { ...inp, resize: "vertical", minHeight: 90 };
const btn: React.CSSProperties = {
  background: "#6b1a2a", border: "1px solid rgba(201,165,90,0.5)", color: "#c9a55a",
  padding: "10px 24px", cursor: "pointer", fontFamily: "'Cinzel', serif",
  fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase",
};
const btnSm: React.CSSProperties = { ...btn, padding: "6px 14px", fontSize: "0.58rem" };
const btnDanger: React.CSSProperties = {
  background: "rgba(120,20,30,0.4)", border: "1px solid rgba(180,60,80,0.4)",
  color: "rgba(220,100,110,0.9)", padding: "6px 14px", cursor: "pointer",
  fontFamily: "'Cinzel', serif", fontSize: "0.58rem", letterSpacing: "0.1em",
};
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,165,90,0.15)",
  padding: "18px 22px", marginBottom: 12,
};
const lbl: React.CSSProperties = {
  display: "block", fontFamily: "'Cinzel', serif", fontSize: "0.58rem",
  letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 6,
};
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 };

function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 16 }}><label style={lbl}>{label}</label>{children}</div>;
}
function SectionHead({ text, count }: { text: string; count?: number }) {
  return (
    <div style={{ fontFamily: "'Cinzel', serif", color: "rgba(255,255,255,0.45)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
      {text}{count !== undefined ? ` (${count})` : ""}
    </div>
  );
}
function FormTitle({ text, editMode, onCancel }: { text: string; editMode: boolean; onCancel?: () => void }) {
  return (
    <div style={{ fontFamily: "'Cinzel', serif", color: "#c9a55a", fontSize: "0.85rem", marginBottom: 22, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 14 }}>
      {text}
      {editMode && onCancel && (
        <button style={{ ...btnSm, background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontSize: "0.52rem" }} onClick={onCancel}>
          Cancel Edit
        </button>
      )}
    </div>
  );
}

export default function AdminPanel({ onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [tab, setTab] = useState<TabName>("news");
  const [status, setStatus] = useState("");

  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [schedule, setSchedule] = useState<Schedule>({ monthEn: "", monthSr: "", services: [] });
  const [history, setHistory] = useState<HistoryData>({ introEn: "", introSr: "", images: [], timeline: [] });
  const [newTimeline, setNewTimeline] = useState<HistoryTimeline>({ year: "", yearSr: "", textEn: "", textSr: "" });
  const [histImgFiles, setHistImgFiles] = useState<FileList | null>(null);

  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [missionNews, setMissionNews] = useState<NewsItem[]>([]);
  const [editingMissionNews, setEditingMissionNews] = useState<NewsItem | null>(null);

  const evRef = useRef<HTMLFormElement>(null);
  const orgRef = useRef<HTMLFormElement>(null);
  const newsRef = useRef<HTMLFormElement>(null);
  const missionNewsRef = useRef<HTMLFormElement>(null);

  const showStatus = (msg: string) => { setStatus(msg); setTimeout(() => setStatus(""), 3000); };

  async function login() {
    setLoginErr("");
    const r = await fetch("/api/church/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const d = await r.json() as { success?: boolean; key?: string; error?: string };
    if (d.success && d.key) { setAdminKey(d.key); setAuthed(true); loadAll(d.key); }
    else setLoginErr("Incorrect password. Please try again.");
  }

  async function loadAll(key: string) {
    const [ev, org, nw, sc, hist, mn] = await Promise.all([
      fetch("/api/church/events").then(r => r.json()),
      fetch("/api/church/organizations").then(r => r.json()),
      fetch("/api/church/news").then(r => r.json()),
      fetch("/api/church/schedule").then(r => r.json()),
      fetch("/api/church/history").then(r => r.json()),
      fetch("/api/church/mission-news").then(r => r.json()),
    ]);
    setEvents(ev as ChurchEvent[]);
    setOrgs(org as Organization[]);
    setNews(nw as NewsItem[]);
    setSchedule(sc as Schedule);
    setHistory(hist as HistoryData);
    setMissionNews(mn as NewsItem[]);
    setAdminKey(key);
  }

  const hdr = { "x-admin-key": adminKey };

  
  /* ---- EVENTS ---- */
async function submitEvent(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  showStatus("Saving…");

  const fd = new FormData(e.currentTarget);

  const url = editingEvent
    ? `/api/church/events?id=${encodeURIComponent(editingEvent.id)}`
    : "/api/church/events";

  const response = await fetch(url, {
    method: editingEvent ? "PUT" : "POST",
    headers: hdr,
    body: fd,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Save event failed:", result);
    alert(result?.error || "Event save failed");
    showStatus("Save failed");
    return;
  }

  setEditingEvent(null);
  evRef.current?.reset();

  setEvents(
    (await fetch("/api/church/events").then((r) => r.json())) as ChurchEvent[]
  );

  showStatus("Saved ✓");
}

async function deleteEvent(id: string) {
  if (!confirm("Delete this event?")) return;

  const response = await fetch(`/api/church/events?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: hdr,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Delete event failed:", result);
    alert(result?.error || "Event delete failed");
    showStatus("Delete failed");
    return;
  }

  setEvents((prev) => prev.filter((e) => e.id !== id));
  showStatus("Deleted ✓");
}

  /* ---- ORGS ---- */
  async function submitOrg(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); showStatus("Saving…");
    const fd = new FormData(e.currentTarget);
    const url = editingOrg ? `/api/church/organizations/${editingOrg.id}` : "/api/church/organizations";
    await fetch(url, { method: editingOrg ? "PUT" : "POST", headers: hdr, body: fd });
    setEditingOrg(null); orgRef.current?.reset();
    setOrgs(await fetch("/api/church/organizations").then(r => r.json()) as Organization[]);
    showStatus("Saved ✓");
  }
  async function deleteOrg(id: string) {
    if (!confirm("Delete this organization?")) return;
    await fetch(`/api/church/organizations/${id}`, { method: "DELETE", headers: hdr });
    setOrgs(prev => prev.filter(o => o.id !== id));
  }

  /* ---- NEWS ---- */
  /* ---- NEWS ---- */
async function submitNews(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  showStatus("Saving…");

  const fd = new FormData(e.currentTarget);

  const url = editingNews
    ? `/api/church/news?id=${encodeURIComponent(editingNews.id)}`
    : "/api/church/news";

  const response = await fetch(url, {
    method: editingNews ? "PUT" : "POST",
    headers: hdr,
    body: fd,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Save news failed:", result);
    alert(result?.error || "News save failed");
    showStatus("Save failed");
    return;
  }

  setEditingNews(null);
  newsRef.current?.reset();

  setNews(
    (await fetch("/api/church/news").then((r) => r.json())) as NewsItem[]
  );

  showStatus("Saved ✓");
}

async function deleteNews(id: string) {
  if (!confirm("Delete this news item?")) return;

  const response = await fetch(`/api/church/news?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: hdr,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Delete news failed:", result);
    alert(result?.error || "News delete failed");
    showStatus("Delete failed");
    return;
  }

  setNews((prev) => prev.filter((n) => n.id !== id));
  showStatus("Deleted ✓");
}

  /* ---- MISSION NEWS ---- */
  async function submitMissionNews(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); showStatus("Saving…");
    const fd = new FormData(e.currentTarget);
    const url = editingMissionNews ? `/api/church/mission-news/${editingMissionNews.id}` : "/api/church/mission-news";
    await fetch(url, { method: editingMissionNews ? "PUT" : "POST", headers: hdr, body: fd });
    setEditingMissionNews(null); missionNewsRef.current?.reset();
    setMissionNews(await fetch("/api/church/mission-news").then(r => r.json()) as NewsItem[]);
    showStatus("Saved ✓");
  }
  async function deleteMissionNews(id: string) {
    if (!confirm("Delete this mission news item?")) return;
    await fetch(`/api/church/mission-news/${id}`, { method: "DELETE", headers: hdr });
    setMissionNews(prev => prev.filter(n => n.id !== id));
  }

  /* ---- SCHEDULE ---- */
const [newSvc, setNewSvc] = useState<ServiceEntry>({
  day: "",
  dowEn: "",
  dowSr: "",
  time: "",
  titleEn: "",
  titleSr: "",
});

async function saveSchedule() {
  console.log("SAVE SCHEDULE CLICKED");

  try {
    showStatus("Saving...");

    const hasUnsavedService =
      newSvc.day.trim() !== "" ||
      newSvc.dowEn.trim() !== "" ||
      newSvc.dowSr.trim() !== "" ||
      newSvc.time.trim() !== "" ||
      newSvc.titleEn.trim() !== "" ||
      newSvc.titleSr.trim() !== "";

    let scheduleToSave = schedule;

    if (hasUnsavedService) {
      if (!newSvc.day.trim() || !newSvc.titleEn.trim()) {
        alert("Please enter at least Day and Service Name before saving.");
        showStatus("Save failed");
        return;
      }

      scheduleToSave = {
        ...schedule,
        services: [...schedule.services, { ...newSvc }],
      };
    }

    console.log("Schedule payload:", scheduleToSave);

    const response = await fetch("/api/church/schedule", {
      method: "PUT",
      headers: {
        ...hdr,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleToSave),
    });

    console.log("Schedule response status:", response.status);

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Schedule save failed:", result);
      alert(result?.error || "Schedule save failed");
      showStatus("Save failed");
      return;
    }

    console.log("Schedule saved:", result);

    setSchedule(scheduleToSave);

    if (hasUnsavedService) {
      setNewSvc({
        day: "",
        dowEn: "",
        dowSr: "",
        time: "",
        titleEn: "",
        titleSr: "",
      });
    }

    showStatus("Schedule saved ✓");
    alert("Schedule saved");
  } catch (error) {
    console.error("Schedule save crashed before/inside fetch:", error);
    alert("Schedule save crashed. Check console.");
    showStatus("Save failed");
  }
}

function addService() {
  if (!newSvc.day.trim() || !newSvc.titleEn.trim()) {
    alert("Please enter at least Day and Service Name.");
    return;
  }

  const serviceToAdd = { ...newSvc };

  setSchedule((prev) => {
    const updated = {
      ...prev,
      services: [...prev.services, serviceToAdd],
    };

    console.log("Service added:", updated);
    return updated;
  });

  setNewSvc({
    day: "",
    dowEn: "",
    dowSr: "",
    time: "",
    titleEn: "",
    titleSr: "",
  });
}

function removeService(idx: number) {
  setSchedule((prev) => ({
    ...prev,
    services: prev.services.filter((_, i) => i !== idx),
  }));
}

  /* ---- HISTORY ---- */
  async function saveHistory() {
    showStatus("Saving…");
    const fd = new FormData();
    fd.append("introEn", history.introEn);
    fd.append("introSr", history.introSr);
    fd.append("keepImages", JSON.stringify(history.images));
    fd.append("timeline", JSON.stringify(history.timeline));
    if (histImgFiles) {
      for (let i = 0; i < histImgFiles.length; i++) fd.append("images", histImgFiles[i]);
    }
    const result = await fetch("/api/church/history", { method: "PUT", headers: hdr, body: fd });
    const data = await result.json() as HistoryData;
    setHistory(data);
    setHistImgFiles(null);
    showStatus("History saved ✓");
  }

  function addTimeline() {
    if (!newTimeline.year || !newTimeline.textEn) return;
    setHistory(prev => ({ ...prev, timeline: [...prev.timeline, { ...newTimeline }] }));
    setNewTimeline({ year: "", yearSr: "", textEn: "", textSr: "" });
  }
  function removeTimeline(idx: number) {
    setHistory(prev => ({ ...prev, timeline: prev.timeline.filter((_, i) => i !== idx) }));
  }
  function removeHistImage(url: string) {
    setHistory(prev => ({ ...prev, images: prev.images.filter(i => i !== url) }));
  }

  /* ---- LOGIN SCREEN ---- */
  if (!authed) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,4,7,0.97)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,165,90,0.2)", padding: "48px 44px", width: "100%", maxWidth: 400, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          <div style={{ fontFamily: "'Cinzel', serif", color: "#c9a55a", fontSize: "1.1rem", fontWeight: 700, textAlign: "center", marginBottom: 6 }}>Parish Admin</div>
          <div style={{ width: 36, height: 1, background: "#c9a55a", margin: "0 auto 32px", opacity: 0.5 }} />
          <FL label="Admin Password">
            <input style={inp} type="password" value={password} autoFocus
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
          </FL>
          {loginErr && <p style={{ color: "#e07070", fontSize: "0.9rem", marginBottom: 14 }}>{loginErr}</p>}
          <button style={{ ...btn, width: "100%", padding: 14 }} onClick={login}>Sign In</button>
          <button style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "10px", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.1em" }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  const TABS: { id: TabName; label: string }[] = [
    { id: "news", label: "📌 News" },
    { id: "events", label: "📅 Events" },
    { id: "schedule", label: "🕊 Schedule" },
    { id: "organizations", label: "🎭 Organizations" },
    { id: "history", label: "📖 History" },
    { id: "mission", label: "✦ Mission" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,4,7,0.97)", zIndex: 9000, overflowY: "auto", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "44px 28px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, borderBottom: "1px solid rgba(201,165,90,0.2)", paddingBottom: 20 }}>
          <div style={{ fontFamily: "'Cinzel', serif", color: "#c9a55a", fontSize: "1.3rem", fontWeight: 700 }}>Parish Administration</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {status && <span style={{ color: "#7ec87e", fontFamily: "'Cinzel', serif", fontSize: "0.68rem", letterSpacing: "0.1em" }}>{status}</span>}
            <button style={{ background: "none", border: "1px solid rgba(201,165,90,0.3)", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "8px 18px", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.1em" }} onClick={onClose}>← Back to Site</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 32, borderBottom: "1px solid rgba(201,165,90,0.2)" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none",
              borderBottom: tab === t.id ? "2px solid #c9a55a" : "2px solid transparent",
              color: tab === t.id ? "#c9a55a" : "rgba(255,255,255,0.45)",
              padding: "11px 22px", cursor: "pointer", fontFamily: "'Cinzel', serif",
              fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: -1,
            }}>{t.label}</button>
          ))}
        </div>

        {/* ===== NEWS TAB ===== */}
        {tab === "news" && (
          <div>
            {news.length > 0 && (
              <div style={{ marginBottom: 44 }}>
                <SectionHead text="Current News" count={news.length} />
                {news.map(item => (
                  <div key={item.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        {item.pinned && <span style={{ background: "#c9a55a", color: "#1a0a0e", fontFamily: "'Cinzel', serif", fontSize: "0.52rem", padding: "2px 8px", marginBottom: 8, display: "inline-block", fontWeight: 700 }}>📌 PINNED</span>}
                        <div style={{ fontFamily: "'Cinzel', serif", color: "#c9a55a", fontSize: "0.9rem", marginBottom: 4 }}>{item.title}</div>
                        {item.date && <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", marginBottom: 6 }}>{item.date}</div>}
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.5 }}>{item.body.substring(0, 100)}{item.body.length > 100 ? "…" : ""}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button style={btnSm} onClick={() => { setEditingNews(item); setTimeout(() => newsRef.current?.scrollIntoView({ behavior: "smooth" }), 80); }}>Edit</button>
                        <button style={btnDanger} onClick={() => deleteNews(item.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <FormTitle text={editingNews ? "Edit News Item" : "Add News Item"} editMode={!!editingNews} onCancel={() => { setEditingNews(null); newsRef.current?.reset(); }} />
            <form ref={newsRef} onSubmit={submitNews}>
              <div style={grid2}>
                <FL label="Title (English)"><input style={inp} name="title" required defaultValue={editingNews?.title} key={editingNews?.id + "t"} /></FL>
                <FL label="Наслов (Српски)"><input style={inp} name="titleSr" defaultValue={editingNews?.titleSr} key={editingNews?.id + "ts"} /></FL>
              </div>
              <div style={grid2}>
                <FL label="Body (English)"><textarea style={ta} name="body" required defaultValue={editingNews?.body} key={editingNews?.id + "b"} /></FL>
                <FL label="Текст (Српски)"><textarea style={ta} name="bodySr" defaultValue={editingNews?.bodySr} key={editingNews?.id + "bs"} /></FL>
              </div>
              <div style={grid2}>
                <FL label="Date">
                  <input style={inp} name="date" type="date" defaultValue={editingNews?.date} key={editingNews?.id + "d"} />
                </FL>
                <FL label="Mark as Important Notice">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10 }}>
                    <input type="checkbox" name="pinned" value="true" id="pinned" defaultChecked={editingNews?.pinned} key={editingNews?.id + "p"} style={{ width: 18, height: 18, accentColor: "#c9a55a" }} />
                    <label htmlFor="pinned" style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", cursor: "pointer" }}>Mark as Important Announcement (right column)</label>
                  </div>
                </FL>
              </div>
              <FL label="Photo (optional)">
                <input style={{ ...inp, color: "rgba(255,255,255,0.6)", padding: "8px 14px" }} name="image" type="file" accept="image/*" />
                {editingNews?.image && <img src={editingNews.image} alt="" style={{ height: 72, objectFit: "cover", marginTop: 8, display: "block", border: "1px solid rgba(201,165,90,0.2)" }} />}
              </FL>
              <button type="submit" style={btn}>{editingNews ? "Update News Item" : "Publish News Item"}</button>
            </form>
          </div>
        )}

        {/* ===== EVENTS TAB ===== */}
{tab === "events" && (
  <div>
    {events.length > 0 && (
      <div style={{ marginBottom: 44 }}>
        <SectionHead text="Current Events" count={events.length} />

        {events.map((ev) => {
          const photos =
            ev.images && ev.images.length > 0
              ? ev.images.slice(0, 9)
              : ev.image
                ? [ev.image]
                : [];

          return (
            <div key={ev.id} style={card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  {photos.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 52px)",
                        gap: 6,
                        marginBottom: 10,
                      }}
                    >
                      {photos.map((photo, index) => (
                        <img
                          key={`${photo}-${index}`}
                          src={photo}
                          alt=""
                          style={{
                            width: 52,
                            height: 52,
                            objectFit: "cover",
                            display: "block",
                            border: "1px solid rgba(201,165,90,0.2)",
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: "#c9a55a",
                      fontSize: "0.9rem",
                      marginBottom: 4,
                    }}
                  >
                    {ev.title}
                  </div>

                  {ev.date && (
                    <div
                      style={{
                        color: "rgba(255,255,255,0.35)",
                        fontSize: "0.82rem",
                      }}
                    >
                      {ev.date}
                    </div>
                  )}

                  <div
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontSize: "0.9rem",
                      marginTop: 6,
                    }}
                  >
                    {ev.description.substring(0, 100)}
                    {ev.description.length > 100 ? "…" : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    style={btnSm}
                    onClick={() => {
                      setEditingEvent(ev);
                      setTimeout(
                        () => evRef.current?.scrollIntoView({ behavior: "smooth" }),
                        80
                      );
                    }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    style={btnDanger}
                    onClick={() => deleteEvent(ev.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

    <FormTitle
      text={editingEvent ? "Edit Event" : "Add New Event"}
      editMode={!!editingEvent}
      onCancel={() => {
        setEditingEvent(null);
        evRef.current?.reset();
      }}
    />

    <form ref={evRef} onSubmit={submitEvent}>
      <div style={grid2}>
        <FL label="Title (English)">
          <input
            style={inp}
            name="title"
            required
            defaultValue={editingEvent?.title}
            key={editingEvent?.id + "t"}
          />
        </FL>

        <FL label="Наслов (Српски)">
          <input
            style={inp}
            name="titleSr"
            defaultValue={editingEvent?.titleSr}
            key={editingEvent?.id + "ts"}
          />
        </FL>
      </div>

      <FL label="Date">
        <input
          style={inp}
          name="date"
          type="date"
          defaultValue={editingEvent?.date}
          key={editingEvent?.id + "d"}
        />
      </FL>

      <div style={grid2}>
        <FL label="Description (English)">
          <textarea
            style={ta}
            name="description"
            required
            defaultValue={editingEvent?.description}
            key={editingEvent?.id + "desc"}
          />
        </FL>

        <FL label="Опис (Српски)">
          <textarea
            style={ta}
            name="descriptionSr"
            defaultValue={editingEvent?.descriptionSr}
            key={editingEvent?.id + "ds"}
          />
        </FL>
      </div>

      <FL label="Photos">
        <input
          style={{
            ...inp,
            color: "rgba(255,255,255,0.6)",
            padding: "8px 14px",
          }}
          name="images"
          type="file"
          accept="image/*"
          multiple
        />

        <small
          style={{
            display: "block",
            marginTop: 8,
            color: "rgba(255,255,255,0.45)",
            fontSize: "0.8rem",
          }}
        >
          Upload up to 9 photos. They will display as a 3 × 3 grid.
        </small>

        {editingEvent && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 72px)",
              gap: 8,
              marginTop: 10,
            }}
          >
            {(
              editingEvent.images && editingEvent.images.length > 0
                ? editingEvent.images.slice(0, 9)
                : editingEvent.image
                  ? [editingEvent.image]
                  : []
            ).map((photo, index) => (
              <img
                key={`${photo}-${index}`}
                src={photo}
                alt=""
                style={{
                  width: 72,
                  height: 72,
                  objectFit: "cover",
                  display: "block",
                  border: "1px solid rgba(201,165,90,0.2)",
                }}
              />
            ))}
          </div>
        )}
      </FL>

      <button type="submit" style={btn}>
        {editingEvent ? "Update Event" : "Add Event"}
      </button>
    </form>
  </div>
)}

        {/* ===== SCHEDULE TAB ===== */}
{tab === "schedule" && (
  <div>
    <div style={{ marginBottom: 32 }}>
      <SectionHead text="GoFundMe Campaign" />
      <FL label="GoFundMe URL (leave blank to hide the donation button)">
        <input
          style={inp}
          value={schedule.gofundmeUrl ?? ""}
          placeholder="https://www.gofundme.com/f/..."
          onChange={(e) =>
            setSchedule((p) => ({ ...p, gofundmeUrl: e.target.value }))
          }
        />
      </FL>
    </div>

    <div style={{ marginBottom: 32 }}>
      <SectionHead text="Month & Year" />
      <div style={grid2}>
        <FL label="Month (English, e.g. June 2026)">
          <input
            style={inp}
            value={schedule.monthEn}
            onChange={(e) =>
              setSchedule((p) => ({ ...p, monthEn: e.target.value }))
            }
          />
        </FL>

        <FL label="Месец (Српски, нпр. Јун 2026)">
          <input
            style={inp}
            value={schedule.monthSr}
            onChange={(e) =>
              setSchedule((p) => ({ ...p, monthSr: e.target.value }))
            }
          />
        </FL>
      </div>
    </div>

    {/* Existing services */}
    {schedule.services.length > 0 && (
      <div style={{ marginBottom: 32 }}>
        <SectionHead text="Services This Month" count={schedule.services.length} />

        {schedule.services.map((svc, i) => (
          <div
            key={i}
            style={{
              ...card,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "#c9a55a",
                  fontSize: "0.85rem",
                }}
              >
                {svc.day} {svc.dowEn} — {svc.time}
              </span>

              <span
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.9rem",
                  marginLeft: 16,
                }}
              >
                {svc.titleEn}
              </span>

              {svc.titleSr && (
                <span
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "0.85rem",
                    marginLeft: 10,
                  }}
                >
                  / {svc.titleSr}
                </span>
              )}
            </div>

            <button
              type="button"
              style={btnDanger}
              onClick={(e) => {
                e.preventDefault();
                removeService(i);
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    )}

    {/* Add service row */}
    <SectionHead text="Add Service" />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr 80px 1.5fr 1.5fr",
        gap: 10,
        marginBottom: 16,
        alignItems: "end",
      }}
    >
      <FL label="Day">
        <input
          style={inp}
          value={newSvc.day}
          placeholder="3"
          onChange={(e) =>
            setNewSvc((p) => ({ ...p, day: e.target.value }))
          }
        />
      </FL>

      <FL label="Day of Week (EN)">
        <input
          style={inp}
          value={newSvc.dowEn}
          placeholder="Sunday"
          onChange={(e) =>
            setNewSvc((p) => ({ ...p, dowEn: e.target.value }))
          }
        />
      </FL>

      <FL label="Time">
        <input
          style={inp}
          value={newSvc.time}
          placeholder="10:00 AM"
          onChange={(e) =>
            setNewSvc((p) => ({ ...p, time: e.target.value }))
          }
        />
      </FL>

      <FL label="Service Name (English)">
        <input
          style={inp}
          value={newSvc.titleEn}
          placeholder="Divine Liturgy"
          onChange={(e) =>
            setNewSvc((p) => ({ ...p, titleEn: e.target.value }))
          }
        />
      </FL>

      <FL label="Назив Службе (Српски)">
        <input
          style={inp}
          value={newSvc.titleSr}
          placeholder="Света Литургија"
          onChange={(e) =>
            setNewSvc((p) => ({ ...p, titleSr: e.target.value }))
          }
        />
      </FL>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 80px",
        gap: 10,
        marginBottom: 28,
      }}
    >
      <FL label="Day of Week (Српски)">
        <input
          style={inp}
          value={newSvc.dowSr}
          placeholder="Недеља"
          onChange={(e) =>
            setNewSvc((p) => ({ ...p, dowSr: e.target.value }))
          }
        />
      </FL>

      <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 0 }}>
        <button
          type="button"
          style={{ ...btnSm, width: "100%", padding: "11px 0" }}
          onClick={(e) => {
            e.preventDefault();
            console.log("ADD SERVICE CLICKED");
            addService();
          }}
        >
          + Add
        </button>
      </div>
    </div>

    <div
      style={{
        borderTop: "1px solid rgba(201,165,90,0.15)",
        paddingTop: 24,
      }}
    >
      <button
        type="button"
        style={{ ...btn, fontSize: "0.75rem", padding: "13px 36px" }}
        onClick={(e) => {
          e.preventDefault();
          console.log("SAVE SCHEDULE CLICKED");
          saveSchedule();
        }}
      >
        Save Schedule
      </button>
    </div>
  </div>
)}

        {/* ===== ORGANIZATIONS TAB ===== */}
        {tab === "organizations" && (
          <div>
            {orgs.length > 0 && (
              <div style={{ marginBottom: 44 }}>
                <SectionHead text="Current Organizations" count={orgs.length} />
                {orgs.map(org => (
                  <div key={org.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        {org.image && <img src={org.image} alt="" style={{ height: 52, objectFit: "cover", marginBottom: 8, display: "block" }} />}
                        <div style={{ fontFamily: "'Cinzel', serif", color: "#c9a55a", fontSize: "0.9rem", marginBottom: 2 }}>{org.name}</div>
                        {org.nameSr && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", fontStyle: "italic", marginBottom: 6 }}>{org.nameSr}</div>}
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem" }}>{org.description.substring(0, 100)}{org.description.length > 100 ? "…" : ""}</div>
                        {org.contact && <div style={{ color: "#c9a55a", fontSize: "0.8rem", marginTop: 6 }}>Contact: {org.contact}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button style={btnSm} onClick={() => { setEditingOrg(org); setTimeout(() => orgRef.current?.scrollIntoView({ behavior: "smooth" }), 80); }}>Edit</button>
                        <button style={btnDanger} onClick={() => deleteOrg(org.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <FormTitle text={editingOrg ? "Edit Organization" : "Add Organization"} editMode={!!editingOrg} onCancel={() => { setEditingOrg(null); orgRef.current?.reset(); }} />
            <form ref={orgRef} onSubmit={submitOrg}>
              <div style={grid2}>
                <FL label="Name (English)"><input style={inp} name="name" required defaultValue={editingOrg?.name} key={editingOrg?.id + "n"} /></FL>
                <FL label="Назив (Српски)"><input style={inp} name="nameSr" defaultValue={editingOrg?.nameSr} key={editingOrg?.id + "ns"} /></FL>
              </div>
              <div style={grid2}>
                <FL label="Description (English)"><textarea style={ta} name="description" required defaultValue={editingOrg?.description} key={editingOrg?.id + "d"} /></FL>
                <FL label="Опис (Српски)"><textarea style={ta} name="descriptionSr" defaultValue={editingOrg?.descriptionSr} key={editingOrg?.id + "ds"} /></FL>
              </div>
              <FL label="Contact (email, phone, or name)">
                <input style={inp} name="contact" defaultValue={editingOrg?.contact} key={editingOrg?.id + "c"} />
              </FL>
              <FL label="Photo">
                <input style={{ ...inp, color: "rgba(255,255,255,0.6)", padding: "8px 14px" }} name="image" type="file" accept="image/*" />
                {editingOrg?.image && <img src={editingOrg.image} alt="" style={{ height: 72, objectFit: "cover", marginTop: 8, display: "block", border: "1px solid rgba(201,165,90,0.2)" }} />}
              </FL>
              <button type="submit" style={btn}>{editingOrg ? "Update Organization" : "Add Organization"}</button>
            </form>
          </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {tab === "history" && (
          <div>
            <SectionHead text="Main History Text" />
            <div style={grid2}>
              <FL label="Introduction (English)">
                <textarea style={{ ...ta, minHeight: 160 }} value={history.introEn} onChange={e => setHistory(p => ({ ...p, introEn: e.target.value }))} />
              </FL>
              <FL label="Увод (Српски)">
                <textarea style={{ ...ta, minHeight: 160 }} value={history.introSr} onChange={e => setHistory(p => ({ ...p, introSr: e.target.value }))} />
              </FL>
            </div>

            {/* Current images */}
            {history.images.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <SectionHead text="Current Photos" count={history.images.length} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {history.images.map(url => (
                    <div key={url} style={{ position: "relative" }}>
                      <img src={url} alt="" style={{ width: 120, height: 90, objectFit: "cover", display: "block", border: "1px solid rgba(201,165,90,0.2)" }} />
                      <button onClick={() => removeHistImage(url)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(120,20,30,0.85)", border: "none", color: "white", cursor: "pointer", width: 22, height: 22, fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FL label="Add Photos (up to 6)">
              <input style={{ ...inp, color: "rgba(255,255,255,0.6)", padding: "8px 14px" }} type="file" accept="image/*" multiple onChange={e => setHistImgFiles(e.target.files)} />
            </FL>

            {/* Timeline */}
            <div style={{ marginTop: 32, marginBottom: 20 }}>
              <SectionHead text="Timeline Entries" count={history.timeline.length} />
              {history.timeline.map((item, i) => (
                <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: "'Cinzel', serif", color: "#c9a55a", fontSize: "0.85rem", marginRight: 10 }}>{item.year}</span>
                    {item.yearSr && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", marginRight: 14 }}>/ {item.yearSr}</span>}
                    <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem" }}>{item.textEn.substring(0, 80)}{item.textEn.length > 80 ? "…" : ""}</span>
                  </div>
                  <button style={btnDanger} onClick={() => removeTimeline(i)}>Remove</button>
                </div>
              ))}

              <div style={{ marginTop: 18 }}>
                <SectionHead text="Add Timeline Entry" />
                <div style={grid2}>
                  <FL label="Year / Label (English, e.g. Early 1900s)"><input style={inp} value={newTimeline.year} onChange={e => setNewTimeline(p => ({ ...p, year: e.target.value }))} /></FL>
                  <FL label="Година (Српски, нпр. Почетак 20. века)"><input style={inp} value={newTimeline.yearSr} onChange={e => setNewTimeline(p => ({ ...p, yearSr: e.target.value }))} /></FL>
                </div>
                <div style={grid2}>
                  <FL label="Description (English)"><textarea style={ta} value={newTimeline.textEn} onChange={e => setNewTimeline(p => ({ ...p, textEn: e.target.value }))} /></FL>
                  <FL label="Опис (Српски)"><textarea style={ta} value={newTimeline.textSr} onChange={e => setNewTimeline(p => ({ ...p, textSr: e.target.value }))} /></FL>
                </div>
                <button style={btnSm} onClick={addTimeline}>+ Add Entry</button>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(201,165,90,0.15)", paddingTop: 24, marginTop: 12 }}>
              <button style={{ ...btn, fontSize: "0.75rem", padding: "13px 36px" }} onClick={saveHistory}>
                Save History
              </button>
            </div>
          </div>
        )}

        {/* ===== MISSION TAB ===== */}
        {tab === "mission" && (
          <div>
            <div style={{ marginBottom: 32, padding: "20px 24px", background: "rgba(201,165,90,0.06)", border: "1px solid rgba(201,165,90,0.15)" }}>
              <div style={{ fontFamily: "'Cinzel', serif", color: "#c9a55a", fontSize: "0.8rem", marginBottom: 8, fontWeight: 600 }}>
                Holy Resurrection Serbian Orthodox Mission
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                Mailing: 1606 South 1000 West, Salt Lake City, UT 84104 &nbsp;|&nbsp; Physical: 2618 W Bannock Street, Boise, ID 83702
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginTop: 6 }}>
                News added here appears on the Mission page of the website.
              </div>
            </div>
            {missionNews.length > 0 && (
              <div style={{ marginBottom: 44 }}>
                <SectionHead text="Mission News" count={missionNews.length} />
                {missionNews.map(item => (
                  <div key={item.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        {item.pinned && <span style={{ background: "#c9a55a", color: "#1a0a0e", fontFamily: "'Cinzel', serif", fontSize: "0.52rem", padding: "2px 8px", marginBottom: 8, display: "inline-block", fontWeight: 700 }}>📌 PINNED</span>}
                        <div style={{ fontFamily: "'Cinzel', serif", color: "#c9a55a", fontSize: "0.9rem", marginBottom: 4 }}>{item.title}</div>
                        {item.date && <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", marginBottom: 6 }}>{item.date}</div>}
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.5 }}>{item.body.substring(0, 100)}{item.body.length > 100 ? "…" : ""}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button style={btnSm} onClick={() => { setEditingMissionNews(item); setTimeout(() => missionNewsRef.current?.scrollIntoView({ behavior: "smooth" }), 80); }}>Edit</button>
                        <button style={btnDanger} onClick={() => deleteMissionNews(item.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <FormTitle text={editingMissionNews ? "Edit Mission News Item" : "Add Mission News Item"} editMode={!!editingMissionNews} onCancel={() => { setEditingMissionNews(null); missionNewsRef.current?.reset(); }} />
            <form ref={missionNewsRef} onSubmit={submitMissionNews}>
              <div style={grid2}>
                <FL label="Title (English)"><input style={inp} name="title" required defaultValue={editingMissionNews?.title} key={editingMissionNews?.id + "t"} /></FL>
                <FL label="Наслов (Српски)"><input style={inp} name="titleSr" defaultValue={editingMissionNews?.titleSr} key={editingMissionNews?.id + "ts"} /></FL>
              </div>
              <div style={grid2}>
                <FL label="Body (English)"><textarea style={ta} name="body" required defaultValue={editingMissionNews?.body} key={editingMissionNews?.id + "b"} /></FL>
                <FL label="Текст (Српски)"><textarea style={ta} name="bodySr" defaultValue={editingMissionNews?.bodySr} key={editingMissionNews?.id + "bs"} /></FL>
              </div>
              <div style={grid2}>
                <FL label="Date">
                  <input style={inp} name="date" type="date" defaultValue={editingMissionNews?.date} key={editingMissionNews?.id + "d"} />
                </FL>
                <FL label="Mark as Important Notice">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10 }}>
                    <input type="checkbox" name="pinned" value="true" id="m-pinned" defaultChecked={editingMissionNews?.pinned} key={editingMissionNews?.id + "p"} style={{ width: 18, height: 18, accentColor: "#c9a55a" }} />
                    <label htmlFor="m-pinned" style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", cursor: "pointer" }}>Pin to top of mission news</label>
                  </div>
                </FL>
              </div>
              <FL label="Photo (optional)">
                <input style={{ ...inp, color: "rgba(255,255,255,0.6)", padding: "8px 14px" }} name="image" type="file" accept="image/*" />
                {editingMissionNews?.image && <img src={editingMissionNews.image} alt="" style={{ height: 72, objectFit: "cover", marginTop: 8, display: "block", border: "1px solid rgba(201,165,90,0.2)" }} />}
              </FL>
              <button type="submit" style={btn}>{editingMissionNews ? "Update Mission News Item" : "Publish Mission News Item"}</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
