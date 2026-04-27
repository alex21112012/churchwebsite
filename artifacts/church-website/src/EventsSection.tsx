import { useState, useEffect } from "react";

type Lang = "en" | "sr";

interface Event {
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

interface Props {
  lang: Lang;
}

const labels = {
  title: { en: "Parish Events", sr: "Парохијска Дешавања" },
  subtitle: { en: "News & Upcoming Events", sr: "Вести и предстојећи догађаји" },
  empty: {
    en: "No upcoming events at this time. Please check back soon or contact the parish for information.",
    sr: "Тренутно нема предстојећих догађаја. Проверите ускоро или контактирајте парохију за информације.",
  },
  loading: { en: "Loading events…", sr: "Учитавање…" },
};

function formatDate(dateStr: string, lang: Lang): string {
  if (!dateStr) return "";

  try {
    const dateOnly = dateStr.slice(0, 10);
    const [year, month, day] = dateOnly.split("-").map(Number);

    if (!year || !month || !day) {
      return dateStr;
    }

    const d = new Date(year, month - 1, day);

    return d.toLocaleDateString(lang === "sr" ? "sr-RS" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function EventsSection({ lang }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/church/events")
      .then((r) => r.json())
      .then((data: Event[]) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section
      id="events"
      style={{
        background: "linear-gradient(180deg, var(--dark-bg) 0%, #1f0d13 100%)",
        padding: "96px 40px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              color: "var(--gold-dark)",
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            {labels.subtitle[lang]}
          </div>

          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--gold)",
              marginBottom: 20,
            }}
          >
            {labels.title[lang]}
          </h2>

          <div
            style={{
              width: 60,
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
              color: "rgba(255,255,255,0.5)",
              fontStyle: "italic",
            }}
          >
            {labels.loading[lang]}
          </p>
        ) : events.length === 0 ? (
          <div
            style={{
              border: "1px solid rgba(201,165,90,0.15)",
              padding: "56px 40px",
              textAlign: "center",
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: 16, opacity: 0.5 }}>
              ✦
            </div>

            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "1.05rem",
                lineHeight: 1.8,
                fontStyle: "italic",
              }}
            >
              {labels.empty[lang]}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 36,
              width: "100%",
            }}
          >
            {events.map((ev) => {
              const isOpen = expanded === ev.id;

              const photos =
                ev.images && ev.images.length > 0
                  ? ev.images.slice(0, 9)
                  : ev.image
                    ? [ev.image]
                    : [];

              return (
                <article
                  key={ev.id}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,165,90,0.18)",
                    overflow: "hidden",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpanded(isOpen ? null : ev.id)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(201,165,90,0.45)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(201,165,90,0.18)")
                  }
                >
                  {photos.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 6,
                        width: "100%",
                        padding: 6,
                        boxSizing: "border-box",
                        background: "rgba(0,0,0,0.18)",
                      }}
                    >
                      {photos.map((photo, index) => (
                        <div
                          key={`${photo}-${index}`}
                          style={{
                            width: "100%",
                            aspectRatio: "1 / 1",
                            overflow: "hidden",
                            background: "rgba(255,255,255,0.04)",
                          }}
                        >
                          <img
                            src={photo}
                            alt={`${lang === "sr" ? ev.titleSr || ev.title : ev.title} ${
                              index + 1
                            }`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length === 0 && (
                    <div
                      style={{
                        height: 80,
                        background:
                          "linear-gradient(135deg, var(--dark-burgundy), #2a0f17)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderBottom: "1px solid rgba(201,165,90,0.2)",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--gold)",
                          fontSize: "1.5rem",
                          opacity: 0.6,
                        }}
                      >
                        ✦
                      </span>
                    </div>
                  )}

                  <div style={{ padding: "24px 28px 28px" }}>
                    {ev.date && (
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "0.6rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "var(--gold-dark)",
                          marginBottom: 10,
                        }}
                      >
                        {formatDate(ev.date, lang)}
                      </div>
                    )}

                    <h3
                      style={{
                        fontFamily: "'Cinzel', serif",
                        color: "var(--gold-light)",
                        fontSize: "1rem",
                        fontWeight: 600,
                        marginBottom: isOpen ? 16 : 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {lang === "sr" ? ev.titleSr || ev.title : ev.title}
                    </h3>

                    {isOpen && (
                      <p
                        style={{
                          color: "rgba(255,255,255,0.72)",
                          fontSize: "1rem",
                          lineHeight: 1.8,
                          margin: 0,
                        }}
                      >
                        {lang === "sr"
                          ? ev.descriptionSr || ev.description
                          : ev.description}
                      </p>
                    )}

                    <div
                      style={{
                        marginTop: 16,
                        fontSize: "0.7rem",
                        color: "var(--gold-dark)",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        fontFamily: "'Cinzel', serif",
                      }}
                    >
                      {isOpen
                        ? lang === "sr"
                          ? "Затвори ↑"
                          : "Close ↑"
                        : lang === "sr"
                          ? "Прочитај више ↓"
                          : "Read more ↓"}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
