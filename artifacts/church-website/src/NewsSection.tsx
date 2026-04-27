import { useState, useEffect } from "react";

type Lang = "en" | "sr";

export interface NewsItem {
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

interface Props {
  lang: Lang;
}

const labels = {
  newsTitle: { en: "Parish News", sr: "Парохијске Вести" },
  newsSub: { en: "Latest Announcements", sr: "Најновија обавештења" },
  pinTitle: { en: "Important Notices", sr: "Важна Обавештења" },
  pinSub: {
    en: "Official Notices & Urgent Updates",
    sr: "Службена обавештења и хитне вести",
  },
  empty: { en: "No announcements at this time.", sr: "Тренутно нема обавештења." },
  readMore: { en: "Read ↓", sr: "Прочитај ↓" },
  close: { en: "Close ↑", sr: "Затвори ↑" },
};

function formatDate(dateStr: string, lang: Lang): string {
  if (!dateStr) return "";

  try {
    const cleanDate = dateStr.split("T")[0];
    const [year, month, day] = cleanDate.split("-").map(Number);

    if (!year || !month || !day) return dateStr;

    const localDate = new Date(year, month - 1, day);

    return localDate.toLocaleDateString(lang === "sr" ? "sr-RS" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function NewsSection({ lang }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/church/news")
      .then((r) => r.json())
      .then((d: NewsItem[]) => {
        setNews(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const pinned = news.filter((n) => n.pinned);
  const regular = news.filter((n) => !n.pinned);

  const toggle = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="news"
      style={{
        background: "linear-gradient(180deg, #f4f0e8 0%, var(--stone) 100%)",
        padding: "88px 40px",
        borderTop: "3px solid var(--dark-burgundy)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              color: "var(--gold-dark)",
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {lang === "en" ? "Parish Communication" : "Парохијска комуникација"}
          </div>

          <div
            style={{
              width: 56,
              height: 2,
              background: "var(--gold-dark)",
              margin: "0 auto",
            }}
          />
        </div>

        {loading ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-mid)",
              fontStyle: "italic",
            }}
          >
            {lang === "en" ? "Loading…" : "Учитавање…"}
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 48,
              alignItems: "start",
            }}
            className="responsive-grid"
          >
            <div>
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.58rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--gold-dark)",
                    marginBottom: 8,
                  }}
                >
                  {labels.newsSub[lang]}
                </div>

                <h2
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)",
                    fontWeight: 700,
                    color: "var(--dark-burgundy)",
                    marginBottom: 0,
                  }}
                >
                  {labels.newsTitle[lang]}
                </h2>

                <div
                  style={{
                    width: 40,
                    height: 2,
                    background: "var(--dark-burgundy)",
                    marginTop: 14,
                    opacity: 0.4,
                  }}
                />
              </div>

              {regular.length === 0 ? (
                <p
                  style={{
                    color: "var(--text-mid)",
                    fontStyle: "italic",
                    fontSize: "1rem",
                  }}
                >
                  {labels.empty[lang]}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {regular.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "white",
                        border: "1px solid rgba(107,26,42,0.1)",
                        borderLeft: "4px solid var(--dark-burgundy)",
                        padding: "20px 24px",
                        cursor: "pointer",
                        transition: "box-shadow 0.2s",
                      }}
                      onClick={() => toggle(item.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {item.image && expanded === item.id && (
                        <img
                          src={item.image}
                          alt=""
                          style={{
                            width: "100%",
                            height: 150,
                            objectFit: "cover",
                            display: "block",
                            marginBottom: 14,
                          }}
                        />
                      )}

                      {item.date && (
                        <div
                          style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: "0.55rem",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "var(--gold-dark)",
                            marginBottom: 6,
                          }}
                        >
                          {formatDate(item.date, lang)}
                        </div>
                      )}

                      <h3
                        style={{
                          fontFamily: "'Cinzel', serif",
                          color: "var(--dark-burgundy)",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          marginBottom: expanded === item.id ? 12 : 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {lang === "sr" ? item.titleSr || item.title : item.title}
                      </h3>

                      {expanded === item.id && (
                        <p
                          style={{
                            color: "var(--text-mid)",
                            fontSize: "1rem",
                            lineHeight: 1.85,
                          }}
                        >
                          {lang === "sr" ? item.bodySr || item.body : item.body}
                        </p>
                      )}

                      <div
                        style={{
                          color: "var(--gold-dark)",
                          fontSize: "0.58rem",
                          letterSpacing: "0.12em",
                          fontFamily: "'Cinzel', serif",
                          marginTop: 10,
                        }}
                      >
                        {expanded === item.id ? labels.close[lang] : labels.readMore[lang]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.58rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--gold-dark)",
                    marginBottom: 8,
                  }}
                >
                  {labels.pinSub[lang]}
                </div>

                <h2
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)",
                    fontWeight: 700,
                    color: "var(--dark-burgundy)",
                    marginBottom: 0,
                  }}
                >
                  {labels.pinTitle[lang]}
                </h2>

                <div
                  style={{
                    width: 40,
                    height: 2,
                    background: "var(--dark-burgundy)",
                    marginTop: 14,
                    opacity: 0.4,
                  }}
                />
              </div>

              {pinned.length === 0 ? (
                <p
                  style={{
                    color: "var(--text-mid)",
                    fontStyle: "italic",
                    fontSize: "1rem",
                  }}
                >
                  {labels.empty[lang]}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {pinned.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "linear-gradient(135deg, var(--dark-burgundy), #3d1520)",
                        border: "1px solid rgba(201,165,90,0.25)",
                        padding: "24px 28px",
                        cursor: "pointer",
                      }}
                      onClick={() => toggle(item.id)}
                    >
                      {item.image && expanded === item.id && (
                        <img
                          src={item.image}
                          alt=""
                          style={{
                            width: "100%",
                            height: 150,
                            objectFit: "cover",
                            display: "block",
                            marginBottom: 14,
                          }}
                        />
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            background: "var(--gold)",
                            color: "var(--dark-bg)",
                            fontFamily: "'Cinzel', serif",
                            fontSize: "0.5rem",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            padding: "3px 9px",
                            fontWeight: 700,
                          }}
                        >
                          📌 {lang === "en" ? "Notice" : "Обавештење"}
                        </span>

                        {item.date && (
                          <span
                            style={{
                              color: "rgba(255,255,255,0.35)",
                              fontSize: "0.82rem",
                            }}
                          >
                            {formatDate(item.date, lang)}
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontFamily: "'Cinzel', serif",
                          color: "var(--gold)",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          marginBottom: expanded === item.id ? 14 : 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {lang === "sr" ? item.titleSr || item.title : item.title}
                      </h3>

                      {expanded === item.id && (
                        <p
                          style={{
                            color: "rgba(255,255,255,0.8)",
                            fontSize: "1rem",
                            lineHeight: 1.85,
                          }}
                        >
                          {lang === "sr" ? item.bodySr || item.body : item.body}
                        </p>
                      )}

                      <div
                        style={{
                          color: "rgba(201,165,90,0.6)",
                          fontSize: "0.58rem",
                          letterSpacing: "0.12em",
                          fontFamily: "'Cinzel', serif",
                          marginTop: 12,
                        }}
                      >
                        {expanded === item.id ? labels.close[lang] : labels.readMore[lang]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}