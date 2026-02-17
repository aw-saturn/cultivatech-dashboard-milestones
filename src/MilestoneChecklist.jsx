import { useState, useRef, useEffect, useCallback } from "react";

const INITIAL_MILESTONES = {
  m0: {
    title: "Milestone 0: Infrastructure Foundation (Week 1–2)",
    color: "#0f766e",
    sections: [
      {
        title: "Deliverables",
        items: [
          { id: "m0-d1", text: "Cloud infrastructure provisioned and configured", checked: false },
          { id: "m0-d2", text: "Database schema design and multi-site isolation architecture", checked: false },
          { id: "m0-d3", text: "Data ingestion REST API for receiving CultivaTECH data", checked: false },
          { id: "m0-d4", text: "WebSocket server setup for real-time updates", checked: false },
          { id: "m0-d5", text: "JWT authentication system", checked: false },
          { id: "m0-d6", text: "React application scaffold with TypeScript", checked: false },
        ],
      },
      {
        title: "Acceptance Criteria",
        items: [
          { id: "m0-a1", text: "Test data flows from mock source through to database storage", checked: false },
          { id: "m0-a2", text: "APIs documented (Swagger/OpenAPI)", checked: false },
          { id: "m0-a3", text: "Development environment reproducible by another developer", checked: false },
        ],
      },
    ],
  },
  m1: {
    title: "Milestone 1: Core Modules (Week 3–4)",
    color: "#1d4ed8",
    sections: [
      {
        title: "Deliverables",
        items: [
          { id: "m1-d1", text: "Climate module with real-time data display and historical charts", checked: false },
          { id: "m1-d2", text: "Dosing module with solution monitoring and event tracking", checked: false },
          { id: "m1-d3", text: "WebSocket live updates integrated across modules", checked: false },
          { id: "m1-d4", text: "Responsive design implementation", checked: false },
        ],
      },
      {
        title: "Acceptance Criteria",
        items: [
          { id: "m1-a1", text: "Real-time updates with <30 second latency", checked: false },
          { id: "m1-a2", text: "Page load times <3 seconds", checked: false },
          { id: "m1-a3", text: "Mobile responsive layout functional", checked: false },
        ],
      },
    ],
  },
  m2: {
    title: "Milestone 2: Advanced Features (Week 5–6)",
    color: "#7c3aed",
    sections: [
      {
        title: "Deliverables",
        items: [
          { id: "m2-d1", text: "Irrigation module with dry-back calculations", checked: false },
          { id: "m2-d2", text: "System Overview and Alarm management interface", checked: false },
          { id: "m2-d3", text: "KPI framework with batch tracking", checked: false },
          { id: "m2-d4", text: "Cross-module integration", checked: false },
          { id: "m2-d5", text: "Data export functionality (CSV/XLSX)", checked: false },
          { id: "m2-d6", text: "CropMAP placeholder integration — sample data ingestion", checked: false },
        ],
      },
      {
        title: "Acceptance Criteria",
        items: [
          { id: "m2-a1", text: "All 5 core modules operational with live data", checked: false },
          { id: "m2-a2", text: "Export functionality working for all data types", checked: false },
          { id: "m2-a3", text: "CropMAP sample data successfully ingested", checked: false },
        ],
      },
    ],
  },
  m3: {
    title: "Milestone 3: Testing, Optimisation & Deployment (Week 7)",
    color: "#b45309",
    sections: [
      {
        title: "Deliverables",
        items: [
          { id: "m3-d1", text: "Performance optimisation and load testing", checked: false },
          { id: "m3-d2", text: "Security audit and testing", checked: false },
          { id: "m3-d3", text: "Comprehensive documentation and handover materials", checked: false },
          { id: "m3-d4", text: "Production deployment with monitoring", checked: false },
        ],
      },
      {
        title: "Acceptance Criteria",
        items: [
          { id: "m3-a1", text: "Production deployment successful", checked: false },
          { id: "m3-a2", text: "7-day stability testing passed", checked: false },
          { id: "m3-a3", text: "Monitoring and alerting live", checked: false },
          { id: "m3-a4", text: "Full code and documentation supplied", checked: false },
        ],
      },
    ],
  },
};

const MK = ["m0", "m1", "m2", "m3"];
const ML = { m0: "M0", m1: "M1", m2: "M2", m3: "M3" };
const STORAGE_KEY = "cultivatech-milestones-v2";

function ts() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default function MilestoneChecklist() {
  const [milestones, setMilestones] = useState(INITIAL_MILESTONES);
  const [changeLog, setChangeLog] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  const [dragItemId, setDragItemId] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null);
  const dragSource = useRef(null);
  const lastLogRef = useRef(null);

  // Load
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          if (parsed.milestones) setMilestones(parsed.milestones);
          if (parsed.changeLog) setChangeLog(parsed.changeLog);
          if (parsed.lastSaved) setLastSaved(parsed.lastSaved);
        }
      } catch (e) {
        // defaults
      }
      setLoaded(true);
    })();
  }, []);

  const saveState = useCallback(async (ms, log) => {
    setSaveStatus("saving");
    try {
      const now = new Date().toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      await window.storage.set(
        STORAGE_KEY,
        JSON.stringify({ milestones: ms, changeLog: log, lastSaved: now })
      );
      setLastSaved(now);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (e) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }, []);

  const addLog = useCallback((text) => {
    if (lastLogRef.current === text) return;
    lastLogRef.current = text;
    setChangeLog((prev) => [...prev, { time: ts(), text }]);
  }, []);

  const toggleCheck = (mk, sIdx, iIdx) => {
    const next = deepClone(milestones);
    const item = next[mk].sections[sIdx].items[iIdx];
    item.checked = !item.checked;
    addLog(`${item.checked ? "✓ Completed" : "○ Unchecked"}: "${item.text}" in ${ML[mk]}`);
    setMilestones(next);
  };

  const handleDragStart = (e, mk, sIdx, iIdx) => {
    const item = milestones[mk].sections[sIdx].items[iIdx];
    const sectionTitle = milestones[mk].sections[sIdx].title;
    dragSource.current = { mk, sIdx, iIdx, item, sectionTitle };
    setDragItemId(item.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.id);
  };

  const handleDragOverItem = (e, mk, sIdx, iIdx) => {
    e.preventDefault();
    if (!dragSource.current) return;
    if (milestones[mk].sections[sIdx].title !== dragSource.current.sectionTitle) return;
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientY < rect.top + rect.height / 2 ? "above" : "below";
    setDropIndicator({ mk, sIdx, itemIdx: iIdx, position });
  };

  const handleDragOverEmpty = (e, mk, sIdx) => {
    e.preventDefault();
    if (!dragSource.current) return;
    if (milestones[mk].sections[sIdx].title !== dragSource.current.sectionTitle) return;
    e.dataTransfer.dropEffect = "move";
    setDropIndicator({ mk, sIdx, itemIdx: -1, position: "empty" });
  };

  const handleDrop = (e, mk, sIdx) => {
    e.preventDefault();
    const di = dropIndicator;
    setDropIndicator(null);
    setDragItemId(null);
    const src = dragSource.current;
    if (!src) return;
    if (milestones[mk].sections[sIdx].title !== src.sectionTitle) return;

    const next = deepClone(milestones);
    const [removed] = next[src.mk].sections[src.sIdx].items.splice(src.iIdx, 1);

    let insertIdx;
    if (di && di.mk === mk && di.sIdx === sIdx && di.itemIdx >= 0) {
      let targetIdx = di.itemIdx;
      if (src.mk === mk && src.sIdx === sIdx && src.iIdx < targetIdx) targetIdx--;
      insertIdx = di.position === "below" ? targetIdx + 1 : targetIdx;
    } else {
      insertIdx = next[mk].sections[sIdx].items.length;
    }

    next[mk].sections[sIdx].items.splice(insertIdx, 0, removed);

    if (src.mk !== mk) {
      addLog(`↗ Moved "${removed.text}" from ${ML[src.mk]} → ${ML[mk]} (${src.sectionTitle})`);
    } else if (src.iIdx !== insertIdx) {
      addLog(`↕ Reordered "${removed.text}" within ${ML[mk]} ${src.sectionTitle} (#${src.iIdx + 1} → #${insertIdx + 1})`);
    }

    setMilestones(next);
    dragSource.current = null;
  };

  const handleDragEnd = () => {
    setDragItemId(null);
    setDropIndicator(null);
    dragSource.current = null;
  };

  const getStats = (mk) => {
    const all = milestones[mk].sections.flatMap((s) => s.items);
    const done = all.filter((i) => i.checked).length;
    return { total: all.length, done };
  };

  const clearLog = () => { setChangeLog([]); lastLogRef.current = null; };
  const handleSave = () => saveState(milestones, changeLog);
  const handleReset = () => {
    if (confirm("Reset to original contract milestones? This clears all ticks, moves, and logs.")) {
      const fresh = deepClone(INITIAL_MILESTONES);
      setMilestones(fresh);
      setChangeLog([]);
      lastLogRef.current = null;
      saveState(fresh, []);
    }
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", fontFamily: "sans-serif" }}>
        <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading saved state…</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
      padding: "20px 14px",
      color: "#1a1a2e",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 18, borderBottom: "2px solid #1a1a2e", paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>
                CultivaTECH Analytics — Milestone Review
              </h1>
              <span style={{
                fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
                color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 3,
              }}>Phase I · Yafet Zerihun</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {lastSaved && (
                <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'IBM Plex Mono', monospace" }}>
                  Saved: {lastSaved}
                </span>
              )}
              <button onClick={handleSave} style={{
                padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#fff",
                background: saveStatus === "saved" ? "#059669" : saveStatus === "error" ? "#dc2626" : "#1a1a2e",
                border: "none", borderRadius: 5, cursor: "pointer", transition: "background 0.2s", minWidth: 72,
              }}>
                {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "Error" : "Save"}
              </button>
              <button onClick={handleReset} style={{
                padding: "5px 10px", fontSize: 10, color: "#9ca3af", background: "transparent",
                border: "1px solid #e5e7eb", borderRadius: 5, cursor: "pointer",
              }}>Reset</button>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "6px 0 0", lineHeight: 1.5 }}>
            Tick completed items. Drag the ⠿ handle to reorder within a section or move items between milestones (same section type only). Press <strong>Save</strong> to persist your changes. The change log records every action for your weekly review with Alex.
          </p>
        </div>

        {/* 2×2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          {MK.map((mk) => {
            const ms = milestones[mk];
            const stats = getStats(mk);
            const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
            return (
              <div key={mk} style={{
                background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb",
                overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{
                  background: ms.color, padding: "8px 12px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <h2 style={{ fontSize: 12, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.4 }}>
                    {ms.title}
                  </h2>
                  <span style={{
                    fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
                    color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", marginLeft: 8,
                  }}>{stats.done}/{stats.total}</span>
                </div>
                <div style={{ height: 3, background: "#e5e7eb" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`, background: ms.color,
                    opacity: 0.5, transition: "width 0.3s ease",
                  }} />
                </div>
                <div style={{ padding: "2px 0" }}>
                  {ms.sections.map((section, sIdx) => (
                    <div
                      key={sIdx}
                      onDragOver={(e) => { if (section.items.length === 0) handleDragOverEmpty(e, mk, sIdx); }}
                      onDrop={(e) => handleDrop(e, mk, sIdx)}
                      style={{
                        padding: "5px 10px 7px",
                        borderBottom: sIdx < ms.sections.length - 1 ? "1px solid #f3f4f6" : "none",
                        minHeight: 36,
                      }}
                    >
                      <div style={{
                        fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.9px", color: "#b0b5be", marginBottom: 3,
                      }}>{section.title}</div>

                      {section.items.length === 0 && (
                        <div style={{
                          fontSize: 11, color: "#d1d5db", fontStyle: "italic", padding: "8px 0",
                          textAlign: "center",
                          border: dropIndicator?.mk === mk && dropIndicator?.sIdx === sIdx && dropIndicator?.position === "empty"
                            ? "2px dashed #86efac" : "2px dashed transparent",
                          borderRadius: 4, transition: "border-color 0.15s",
                        }}>Drop items here</div>
                      )}

                      {section.items.map((item, iIdx) => {
                        const isAbove = dropIndicator?.mk === mk && dropIndicator?.sIdx === sIdx
                          && dropIndicator?.itemIdx === iIdx && dropIndicator?.position === "above";
                        const isBelow = dropIndicator?.mk === mk && dropIndicator?.sIdx === sIdx
                          && dropIndicator?.itemIdx === iIdx && dropIndicator?.position === "below";
                        return (
                          <div key={item.id}>
                            <div style={{
                              height: 2, background: isAbove ? "#22c55e" : "transparent",
                              borderRadius: 1, margin: isAbove ? "1px 4px" : 0,
                            }} />
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, mk, sIdx, iIdx)}
                              onDragOver={(e) => handleDragOverItem(e, mk, sIdx, iIdx)}
                              onDragEnd={handleDragEnd}
                              style={{
                                display: "flex", alignItems: "flex-start", gap: 6,
                                padding: "3px 4px", borderRadius: 4, cursor: "grab",
                                opacity: dragItemId === item.id ? 0.25 : 1,
                                background: dragItemId === item.id ? "#fef9c3" : "transparent",
                                transition: "opacity 0.12s, background 0.12s",
                              }}
                              onMouseEnter={(e) => { if (dragItemId !== item.id) e.currentTarget.style.background = "#f9fafb"; }}
                              onMouseLeave={(e) => { if (dragItemId !== item.id) e.currentTarget.style.background = "transparent"; }}
                            >
                              <span style={{
                                color: "#cbd5e1", fontSize: 13, lineHeight: "17px",
                                userSelect: "none", flexShrink: 0, cursor: "grab",
                              }}>⠿</span>
                              <input
                                type="checkbox" checked={item.checked}
                                onChange={() => toggleCheck(mk, sIdx, iIdx)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  marginTop: 2, width: 14, height: 14,
                                  accentColor: ms.color, cursor: "pointer", flexShrink: 0,
                                }}
                              />
                              <span style={{
                                fontSize: 12, lineHeight: 1.45,
                                color: item.checked ? "#9ca3af" : "#374151",
                                textDecoration: item.checked ? "line-through" : "none",
                              }}>{item.text}</span>
                            </div>
                            <div style={{
                              height: 2, background: isBelow ? "#22c55e" : "transparent",
                              borderRadius: 1, margin: isBelow ? "1px 4px" : 0,
                            }} />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Change Log */}
        <div style={{
          background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb",
          overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{
            padding: "8px 12px", borderBottom: "1px solid #e5e7eb",
            display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa",
          }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, margin: 0, color: "#374151" }}>
              Change Log {changeLog.length > 0 && <span style={{ fontWeight: 400, color: "#9ca3af" }}>({changeLog.length} entries)</span>}
            </h3>
            {changeLog.length > 0 && (
              <button onClick={clearLog} style={{
                fontSize: 10, color: "#9ca3af", background: "none",
                border: "none", cursor: "pointer", textDecoration: "underline",
              }}>Clear</button>
            )}
          </div>
          <div style={{ padding: "6px 12px", maxHeight: 200, overflowY: "auto" }}>
            {changeLog.length === 0 ? (
              <p style={{ fontSize: 11, color: "#d1d5db", margin: 0, fontStyle: "italic", padding: "6px 0" }}>
                No changes yet. Tick items, reorder, or move between milestones to start logging.
              </p>
            ) : (
              [...changeLog].reverse().map((entry, i) => (
                <div key={i} style={{
                  fontSize: 11, lineHeight: 1.5, padding: "2px 0",
                  borderBottom: i < changeLog.length - 1 ? "1px solid #fafafa" : "none",
                  display: "flex", gap: 8,
                }}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace", color: "#b0b5be",
                    fontSize: 10, flexShrink: 0, minWidth: 58,
                  }}>{entry.time}</span>
                  <span style={{ color: "#4b5563" }}>{entry.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}