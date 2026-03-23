"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PASSWORD = "grodan2025";

const OTOVO_SOURCE = "otovo_home";

type OtovoClick = {
  id: number;
  created_at: string;
  session_id: string | null;
  user_agent: string | null;
  referer: string | null;
  href: string | null;
  button_type: string | null;
  source: string | null;
};

export default function AdminOtovoClicks() {
  const [logs, setLogs] = useState<OtovoClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_authed") === "true") {
      setAuthed(true);
    }
  }, []);

  const getSupabase = () =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );

  const fetchLogs = async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { data, error: qErr } = await supabase
      .from("chat_clicks")
      .select("*")
      .eq("source", OTOVO_SOURCE)
      .order("created_at", { ascending: false });
    if (!qErr && data) setLogs(data as OtovoClick[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchLogs();
  }, [authed]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem("admin_authed", "true");
      setError("");
    } else {
      setError("Fel lösenord!");
    }
  }

  if (!authed) {
    return (
      <div style={{ maxWidth: 400, margin: "4rem auto", padding: 24, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <h2>Admininloggning</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Lösenord"
            style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 12, borderRadius: 6, border: "1px solid #cbd5e1" }}
            autoFocus
          />
          <button
            type="submit"
            style={{ width: "100%", padding: 10, fontSize: 16, borderRadius: 6, background: "var(--primary)", color: "white", border: "none", fontWeight: 600 }}
          >
            Logga in
          </button>
        </form>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </div>
    );
  }

  const withinDate = (dateStr: string) => {
    if (!dateFrom && !dateTo) return true;
    const d = new Date(dateStr);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
    return true;
  };

  const filtered = logs.filter((l) => withinDate(l.created_at));

  const quoteClicks = filtered.filter((l) => l.button_type === "otovo_quote").length;
  const careClicks = filtered.filter((l) => l.button_type === "otovo_care").length;
  const totalClicks = filtered.length;
  const uniqueSessions = new Set(filtered.map((l) => l.session_id).filter(Boolean)).size;

  const byDay = filtered.reduce<Record<string, number>>((acc, l) => {
    const d = new Date(l.created_at).toISOString().split("T")[0];
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  let daysToShow: [string, number][];
  if (dateFrom || dateTo) {
    daysToShow = Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0]));
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: [string, number][] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      days.push([dateStr, byDay[dateStr] || 0]);
    }
    daysToShow = days;
  }

  const maxClicks = Math.max(...daysToShow.map(([, count]) => count), 1);

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: 24, background: "white", minHeight: "100vh" }}>
      <h1 style={{ color: "#1e293b", marginBottom: 8 }}>Otovo-partner (forsiden)</h1>
      <p style={{ color: "#64748b", marginTop: 4, marginBottom: 12, fontSize: '16px' }}>
        Klikk på «Få tilbud på solceller» og «Otovo Care» på startsiden (spores i <code>chat_clicks</code>,{" "}
        <code>source={OTOVO_SOURCE}</code>).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#f8fafc", padding: 20, borderRadius: 8, border: "2px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "0.875rem", fontWeight: "600" }}>Totalt</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#0066a7" }}>{totalClicks}</div>
        </div>
        <div style={{ background: "#f8fafc", padding: 20, borderRadius: 8, border: "2px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "0.875rem", fontWeight: "600" }}>Tilbud (solceller)</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#0284c7" }}>{quoteClicks}</div>
        </div>
        <div style={{ background: "#f8fafc", padding: 20, borderRadius: 8, border: "2px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "0.875rem", fontWeight: "600" }}>Otovo Care</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#16a34a" }}>{careClicks}</div>
        </div>
        <div style={{ background: "#f8fafc", padding: 20, borderRadius: 8, border: "2px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "0.875rem", fontWeight: "600" }}>Unike sessioner</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#8b5cf6" }}>{uniqueSessions}</div>
        </div>
      </div>

      {daysToShow.length > 0 && (
        <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, border: "2px solid #e2e8f0", marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "600", color: "#1e293b" }}>
            Klikk per dag {dateFrom || dateTo ? "(filtrert)" : "(siste 30 dager)"}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "4px",
              height: "300px",
              paddingBottom: "20px",
              borderBottom: "2px solid #e2e8f0",
              marginBottom: "20px",
            }}
          >
            {daysToShow.map(([date, count], index) => {
              const heightPercent = (count / maxClicks) * 100;
              const dateObj = new Date(date);
              const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
              const isFirstOrLast = index === 0 || index === daysToShow.length - 1;
              const isFirstOfMonth = dateObj.getDate() === 1;
              return (
                <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "100%",
                      background: isWeekend
                        ? "linear-gradient(to top, #8b5cf6, #a78bfa)"
                        : "linear-gradient(to top, #0066a7, #0284c7)",
                      height: `${heightPercent}%`,
                      minHeight: count > 0 ? "4px" : "0",
                      borderRadius: "4px 4px 0 0",
                      cursor: "pointer",
                      boxShadow: count > 0 ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                    }}
                    title={`${dateObj.toLocaleDateString("no-NO", { day: "numeric", month: "short" })}: ${count} klikk`}
                  />
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", textAlign: "center", lineHeight: "1.2" }}>
                    {daysToShow.length <= 14 ? (
                      dateObj.toLocaleDateString("no-NO", { day: "numeric", month: "short" })
                    ) : (
                      <>
                        <div>{dateObj.getDate()}</div>
                        {(isFirstOrLast || isFirstOfMonth) && (
                          <div style={{ fontSize: "9px", opacity: 0.7 }}>
                            {dateObj.toLocaleDateString("no-NO", { month: "short" })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b" }}>
            <span>
              <strong style={{ color: "#1e293b" }}>Totalt: {daysToShow.reduce((s, [, c]) => s + c, 0)}</strong> over {daysToShow.length}{" "}
              dager
            </span>
            <span>
              Maks: <strong style={{ color: "#0066a7" }}>{maxClicks}</strong> / dag
            </span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <label style={{ fontSize: 14, color: "#64748b", fontWeight: "500" }}>Fra</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: "14px", color: "#1e293b" }}
        />
        <label style={{ fontSize: 14, color: "#64748b", fontWeight: "500" }}>Til</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: "14px", color: "#1e293b" }}
        />
        <button
          onClick={fetchLogs}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            background: "white",
            color: "#1e293b",
            fontWeight: "500",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Oppdater
        </button>
      </div>

      {loading && <p style={{ color: "#64748b" }}>Laster...</p>}
      {!loading && filtered.length === 0 && <p style={{ color: "#64748b" }}>Ingen klikk enna.</p>}

      {!loading && filtered.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowTable(!showTable)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: showTable ? "#0066a7" : "white",
              color: showTable ? "white" : "#1e293b",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {showTable ? "▼ Skjul detaljer" : "▶ Vis detaljliste"}
          </button>
        </div>
      )}

      {!loading && filtered.length > 0 && showTable && (
        <div style={{ overflowX: "auto", marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white", fontSize: "14px", minWidth: "800px" }}>
            <thead>
              <tr style={{ background: "#1e293b" }}>
                <th style={{ padding: "12px", border: "1px solid #334155", textAlign: "left", color: "white" }}>Tidspunkt</th>
                <th style={{ padding: "12px", border: "1px solid #334155", textAlign: "left", color: "white" }}>Knapp</th>
                <th style={{ padding: "12px", border: "1px solid #334155", textAlign: "left", color: "white" }}>Lenke</th>
                <th style={{ padding: "12px", border: "1px solid #334155", textAlign: "left", color: "white" }}>Session</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, index) => (
                <tr key={l.id} style={{ background: index % 2 === 0 ? "white" : "#f8fafc" }}>
                  <td style={{ padding: "12px", color: "#1e293b" }}>
                    {new Date(l.created_at).toLocaleString("no-NO", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        background: l.button_type === "otovo_quote" ? "#dbeafe" : "#dcfce7",
                        color: l.button_type === "otovo_quote" ? "#1e40af" : "#166534",
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      {l.button_type === "otovo_quote" ? "Tilbud" : l.button_type === "otovo_care" ? "Care" : l.button_type || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {l.href ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" style={{ color: "#0066a7" }}>
                        {l.href.length > 80 ? `${l.href.slice(0, 80)}…` : l.href}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "13px" }}>
                    {l.session_id ? `${l.session_id.slice(0, 20)}…` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
