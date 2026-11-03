"use client";
import { useEffect, useState } from "react";
import { adminFetch, storeAdminPassword } from "@/lib/adminClient";

const ADMIN_PASSWORD = "grodan2025";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatLogType = {
  id: number;
  created_at: string;
  session_id: string;
  user_agent: string;
  messages: ChatMessage[];
  ai_response: string;
  total_tokens: number;
};

type SessionGroup = {
  session_id: string;
  logs: ChatLogType[];
  total_messages: number;
  first_message: string;
  last_message: string;
};

export default function AdminChatlog() {
  const [logs, setLogs] = useState<ChatLogType[]>([]);
  const [sessionGroups, setSessionGroups] = useState<SessionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"raw" | "grouped">("grouped");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("admin_authed") === "true") setAuthed(true);
    }
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/chatlog", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      const logsData = (json.items || []) as ChatLogType[];
      setLogs(logsData);

      const groups: { [key: string]: ChatLogType[] } = {};
      logsData.forEach((log) => {
        if (!groups[log.session_id]) {
          groups[log.session_id] = [];
        }
        groups[log.session_id].push(log);
      });

      const sessionGroupsData: SessionGroup[] = Object.entries(groups).map(([session_id, sessionLogs]) => ({
        session_id,
        logs: sessionLogs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        total_messages: sessionLogs.reduce((sum, log) => sum + (log.messages?.length || 0), 0),
        first_message: sessionLogs[0]?.created_at || "",
        last_message: sessionLogs[sessionLogs.length - 1]?.created_at || "",
      }));

      setSessionGroups(sessionGroupsData);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchLogs();
  }, [authed]);

  const deleteLog = async (id: number) => {
    if (!confirm("Är du säker på att du vill radera denna logg?")) return;

    setDeleting(true);
    try {
      const res = await adminFetch("/api/admin/chatlog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError("Kunde inte radera logg: " + (err.error || res.statusText));
      } else {
        await fetchLogs();
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch {
      setError("Ett fel uppstod vid radering");
    } finally {
      setDeleting(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Är du säker på att du vill radera hela denna session?")) return;

    setDeleting(true);
    try {
      const res = await adminFetch("/api/admin/chatlog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError("Kunde inte radera session: " + (err.error || res.statusText));
      } else {
        await fetchLogs();
        setSelectedSessions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
      }
    } catch {
      setError("Ett fel uppstod vid radering");
    } finally {
      setDeleting(false);
    }
  };

  const deleteSelected = async () => {
    if (selectedItems.size === 0 && selectedSessions.size === 0) return;

    const message =
      viewMode === "grouped"
        ? `Är du säker på att du vill radera ${selectedSessions.size} sessioner?`
        : `Är du säker på att du vill radera ${selectedItems.size} loggar?`;

    if (!confirm(message)) return;

    setDeleting(true);
    try {
      if (viewMode === "grouped" && selectedSessions.size > 0) {
        const res = await adminFetch("/api/admin/chatlog", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_ids: Array.from(selectedSessions) }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setError("Kunde inte radera sessioner: " + (err.error || res.statusText));
        } else {
          await fetchLogs();
          setSelectedSessions(new Set());
        }
      } else if (viewMode === "raw" && selectedItems.size > 0) {
        const res = await adminFetch("/api/admin/chatlog", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: Array.from(selectedItems) }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setError("Kunde inte radera loggar: " + (err.error || res.statusText));
        } else {
          await fetchLogs();
          setSelectedItems(new Set());
        }
      }
    } catch {
      setError("Ett fel uppstod vid radering");
    } finally {
      setDeleting(false);
    }
  };

  const cleanupDuplicateData = async () => {
    if (
      !confirm(
        "Detta kommer att rensa bort duplicerad konversationsdata från befintliga loggar. Endast det aktuella meddelandeutbytet kommer att behållas för varje logg. Är du säker?"
      )
    )
      return;

    setDeleting(true);
    try {
      const res = await adminFetch("/api/admin/chatlog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cleanup_duplicates" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError("Kunde inte rensa: " + (err.error || res.statusText));
        return;
      }
      await fetchLogs();
      setError("");
    } catch (err) {
      setError("Ett fel uppstod vid rensning: " + (err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectSession = (sessionId: string) => {
    setSelectedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (viewMode === "grouped") {
      setSelectedSessions(new Set(sessionGroups.map((g) => g.session_id)));
    } else {
      setSelectedItems(new Set(logs.map((l) => l.id)));
    }
  };

  const selectNone = () => {
    setSelectedItems(new Set());
    setSelectedSessions(new Set());
  };

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem("admin_authed", "true");
      storeAdminPassword(input);
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
          <button type="submit" style={{ width: "100%", padding: 10, fontSize: 16, borderRadius: 6, background: "var(--primary)", color: "white", border: "none", fontWeight: 600 }}>
            Logga in
          </button>
        </form>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: 24 }}>
      <h1>AI Chatlogg (Admin)</h1>

      <div style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => setViewMode("grouped")}
          style={{
            padding: "8px 16px",
            background: viewMode === "grouped" ? "var(--primary)" : "#e5e7eb",
            color: viewMode === "grouped" ? "white" : "black",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Grupperad vy
        </button>
        <button
          onClick={() => setViewMode("raw")}
          style={{
            padding: "8px 16px",
            background: viewMode === "raw" ? "var(--primary)" : "#e5e7eb",
            color: viewMode === "raw" ? "white" : "black",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Raw vy
        </button>
        <span style={{ fontSize: 14, color: "#666" }}>
          {viewMode === "grouped" ? `${sessionGroups.length} sessioner` : `${logs.length} meddelanden`}
        </span>

        <button
          onClick={cleanupDuplicateData}
          disabled={deleting}
          style={{
            padding: "8px 16px",
            background: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: deleting ? "not-allowed" : "pointer",
            fontSize: 14,
          }}
          title="Rensa duplicerad konversationsdata från befintliga loggar"
        >
          {deleting ? "Rensar..." : "🧹 Rensa duplicerad data"}
        </button>

        {(selectedItems.size > 0 || selectedSessions.size > 0) && (
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button
              onClick={deleteSelected}
              disabled={deleting}
              style={{
                padding: "6px 12px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: deleting ? "not-allowed" : "pointer",
                fontSize: 12,
              }}
            >
              {deleting ? "Raderar..." : `Radera valda (${viewMode === "grouped" ? selectedSessions.size : selectedItems.size})`}
            </button>
            <button
              onClick={cleanupDuplicateData}
              disabled={deleting}
              style={{
                padding: "6px 12px",
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: deleting ? "not-allowed" : "pointer",
                fontSize: 12,
              }}
            >
              {deleting ? "Rensar..." : "Rensa duplicerad data"}
            </button>
            <button
              onClick={selectNone}
              style={{
                padding: "6px 12px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Avmarkera alla
            </button>
          </div>
        )}

        {!loading && logs.length > 0 && (
          <button
            onClick={selectAll}
            style={{
              padding: "6px 12px",
              background: "var(--secondary)",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Markera alla
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 6,
            color: "#dc2626",
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {loading && <p>Laddar loggar...</p>}
      {!loading && logs.length === 0 && <p>Inga loggar hittades.</p>}

      {!loading && logs.length > 0 && viewMode === "raw" && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ padding: 8, border: "1px solid #e5e7eb", width: 30 }}>
                <input type="checkbox" checked={selectedItems.size === logs.length && logs.length > 0} onChange={selectAll} style={{ cursor: "pointer" }} />
              </th>
              <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Datum</th>
              <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Session</th>
              <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Antal meddelanden</th>
              <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>User Agent</th>
              <th style={{ padding: 8, border: "1px solid #e5e7eb" }}>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <>
                <tr key={log.id}>
                  <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>
                    <input type="checkbox" checked={selectedItems.has(log.id)} onChange={() => toggleSelectItem(log.id)} style={{ cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ padding: 8, border: "1px solid #e5e7eb", fontSize: 12 }}>{log.session_id}</td>
                  <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>{log.messages?.length || 0}</td>
                  <td style={{ padding: 8, border: "1px solid #e5e7eb", fontSize: 12 }}>{log.user_agent}</td>
                  <td style={{ padding: 8, border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setExpanded(expanded === log.session_id ? null : log.session_id)} style={{ fontSize: 14 }}>
                        {expanded === log.session_id ? "Dölj" : "Visa"}
                      </button>
                      <button
                        onClick={() => deleteLog(log.id)}
                        disabled={deleting}
                        style={{
                          fontSize: 14,
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          padding: "2px 6px",
                          cursor: deleting ? "not-allowed" : "pointer",
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === log.session_id && (
                  <tr>
                    <td colSpan={6} style={{ background: "#f9fafb", padding: 16, border: "1px solid #e5e7eb" }}>
                      <b>Konversation:</b>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {log.messages?.map((msg, idx) => (
                          <li key={idx} style={{ margin: "8px 0" }}>
                            <span style={{ fontWeight: 600 }}>{msg.role === "user" ? "Du" : "Elge"}:</span> {msg.content}
                          </li>
                        ))}
                      </ul>
                      <b>AI-svar:</b> {log.ai_response}
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>Tokens: {log.total_tokens}</div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}

      {!loading && sessionGroups.length > 0 && viewMode === "grouped" && (
        <div style={{ marginTop: 24 }}>
          {sessionGroups.map((group) => (
            <div
              key={group.session_id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                marginBottom: 16,
                background: selectedSessions.has(group.session_id) ? "#f0f9ff" : "white",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input type="checkbox" checked={selectedSessions.has(group.session_id)} onChange={() => toggleSelectSession(group.session_id)} style={{ cursor: "pointer" }} />
                  <div>
                    <strong>Session: {group.session_id}</strong>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      {group.logs.length} meddelanden • {group.total_messages} totalt •
                      {new Date(group.first_message).toLocaleString()} - {new Date(group.last_message).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => setExpanded(expanded === group.session_id ? null : group.session_id)}
                    style={{ fontSize: 14, padding: "4px 8px", background: "var(--primary)", color: "white", border: "none", borderRadius: 4 }}
                  >
                    {expanded === group.session_id ? "Dölj" : "Visa"}
                  </button>
                  <button
                    onClick={() => deleteSession(group.session_id)}
                    disabled={deleting}
                    style={{
                      fontSize: 14,
                      padding: "4px 8px",
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: deleting ? "not-allowed" : "pointer",
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {expanded === group.session_id && (
                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: 16,
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      marginBottom: 16,
                    }}
                  >
                    <h4 style={{ margin: "0 0 12px 0", color: "#374151" }}>Hela konversationen:</h4>
                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                      {group.logs.flatMap((log, logIndex) =>
                        log.messages?.map((msg, msgIndex) => (
                          <div
                            key={`${logIndex}-${msgIndex}`}
                            style={{
                              marginBottom: 8,
                              padding: "8px 12px",
                              background: msg.role === "user" ? "#dbeafe" : "#f0f9ff",
                              borderRadius: 8,
                              borderLeft: `4px solid ${msg.role === "user" ? "var(--primary)" : "var(--secondary)"}`,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 12,
                                color: "#374151",
                                marginBottom: 4,
                              }}
                            >
                              {msg.role === "user" ? "Användare" : "Elge"}
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#6b7280",
                                  marginLeft: 8,
                                  fontWeight: "normal",
                                }}
                              >
                                (meddelande {logIndex + 1})
                              </span>
                            </div>
                            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.content}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <details style={{ marginTop: 16 }}>
                    <summary style={{ cursor: "pointer", fontWeight: 600, color: "#374151" }}>Visa individuella loggar (debug)</summary>
                    {group.logs.map((log, logIndex) => (
                      <div
                        key={log.id}
                        style={{
                          marginBottom: 16,
                          padding: 12,
                          background: "#f9fafb",
                          borderRadius: 6,
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                          Logg {logIndex + 1} • {new Date(log.created_at).toLocaleString()} • Tokens: {log.total_tokens}
                        </div>
                        <div>
                          <b>Meddelanden i denna logg:</b>
                          <ul style={{ margin: "8px 0", padding: 0, listStyle: "none" }}>
                            {log.messages?.map((msg, idx) => (
                              <li key={idx} style={{ margin: "4px 0" }}>
                                <span style={{ fontWeight: 600 }}>{msg.role === "user" ? "Användare" : "Elge"}:</span> {msg.content}
                              </li>
                            ))}
                          </ul>
                          <b>AI-svar:</b> {log.ai_response}
                        </div>
                      </div>
                    ))}
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
