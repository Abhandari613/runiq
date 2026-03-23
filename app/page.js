"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const SB_URL = "https://oafbtylzdgpcixbdyooj.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZmJ0eWx6ZGdwY2l4YmR5b29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxODMwNzMsImV4cCI6MjA4OTc1OTA3M30.17XJAq0MbGfAGNMGIzF-U6JEwMOfesSasRHiL58Gfbs";

const sb = async (t, q = "") => {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/${t}?${q}`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    });
    if (!r.ok) { console.error(`Supabase ${t}: ${r.status}`); return []; }
    return r.json();
  } catch (e) { console.error(`Supabase ${t} error:`, e); return []; }
};

/* ── Fallback data (from 613 Physio seeded data) ── */
const FALLBACK_PROFILE = { name: "Alex Runner", email: "runner@example.com", age: 34, sex: "Male", height_cm: 180, weight_kg: 78.9, running_experience_years: 5, weekly_volume_km: 50, typical_cadence_spm: 172, foot_strike: "Midfoot", resting_hr: 48, max_hr: 192, hr_zone_1: "96-115", hr_zone_2: "116-134", hr_zone_3: "135-153", hr_zone_4: "154-172", hr_zone_5: "173-192", goal_race_distance: "Marathon", goal_race_date: "2024-10-27", goal_target_time: "3:30:00", goal_importance: "A-race", vo2_max_estimate: 58 };
const FALLBACK_INJURIES = [{ injury_type: "IT-band syndrome", body_part: "knee", side: "right", year_occurred: 2022, status: "managing", severity_current: 2, severity_notes: "Slight ache post-run", is_current: true, activations: ["Glute Bridges: 2x15", "Banded side steps: 2x10 each side", "Leg swings: 10 each direction per leg"], form_cues: ["Ensure knee tracks over your second toe on landing", "Avoid letting your left hip drop", "If you feel a sharp pain, stop and stretch. Do not push through it."] }, { injury_type: "Plantar Fasciitis", body_part: "foot", side: "left", year_occurred: 2021, status: "closed", severity_current: 0, is_current: false, activations: [], form_cues: [] }];
const FALLBACK_BODYCOMP = [{ measured_at: "2026-01-08", weight_kg: 78.9, bmi: 27.6, body_fat_pct: 17.4, skeletal_muscle_pct: 53.3, fat_free_mass_kg: 65.2, subcutaneous_fat_pct: 14.5, visceral_fat: 10, body_water_pct: 59.6, muscle_mass_kg: 62.0, bone_mass_kg: 3.3, protein_pct: 18.8, bmr_kcal: 1765, metabolic_age: 40 }, { measured_at: "2025-12-15", weight_kg: 79.0, bmi: 27.7, body_fat_pct: 17.5, skeletal_muscle_pct: 53.2, fat_free_mass_kg: 65.1, visceral_fat: 10, bmr_kcal: 1773, metabolic_age: 40 }];
const FALLBACK_EQUIPMENT = [{ name: "Daily Trainer", brand: "Nike", model: "Pegasus 41", total_distance_km: 420, max_distance_km: 800 }, { name: "Race Day", brand: "Nike", model: "Vaporfly 3", total_distance_km: 85, max_distance_km: 400 }, { name: "Easy Days", brand: "ASICS", model: "Gel-Nimbus 26", total_distance_km: 350, max_distance_km: 800 }];

/* ── Design tokens ── */
const C = { glass: "rgba(12,16,28,0.72)", glassBorder: "rgba(255,255,255,0.06)", accent: "#7C5CFC", accentGlow: "0 0 20px rgba(124,92,252,0.3)", green: "#00E88F", greenDim: "rgba(0,232,143,0.1)", amber: "#FFB020", amberDim: "rgba(255,176,32,0.1)", red: "#FF4D6A", redDim: "rgba(255,77,106,0.1)", blue: "#3B9EFF", blueDim: "rgba(59,158,255,0.1)", cyan: "#00D4FF", text: "#F0F2F8", sub: "#8B93A7", dim: "#4A5168", xp: "linear-gradient(90deg, #7C5CFC, #00D4FF)" };

/* ── SVG Icons ── */
const I = {
  home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  cal: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  shoe: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h20M4 18V8a2 2 0 012-2h3l2 3h5l2-3h2a2 2 0 012 2v10"/></svg>,
  zap: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>,
  heart: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  fire: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-3.9 0-7-3.1-7-7 0-2.8 1.6-5.2 4-6.3-.2 1.3.5 2.7 1.7 3.4C10.2 11.7 10 10 10 8c0-2.2 1.2-4.2 3-5.2.5 2.2 2 4 4 5.2 1.3.8 2 2.2 2 3.7C19 16.1 16.1 19 12.5 19c-1.5 0-2.9-.5-4-1.5.7 2.2 2.8 3.5 5 3.5 3.3 0 6-2.7 6-6 0-4.7-4-8.3-7.5-11.3C9.3 6.2 5 9.5 5 14c0 3.9 3.1 7 7 7z"/></svg>,
  trophy: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 9H3V5h3V3h12v2h3v4h-3c0 3.3-2.7 6-6 6s-6-2.7-6-6zm1 0c0 2.8 2.2 5 5 5s5-2.2 5-5V5H7v4zM8 19h8v2H8z"/></svg>,
  chevR: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
};

/* ── Living Background ── */
const LivingBg = () => { const ref = useRef(null); useEffect(() => { const c = ref.current; if (!c) return; const ctx = c.getContext("2d"); let raf; const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; }; resize(); window.addEventListener("resize", resize); const orbs = Array.from({ length: 5 }, (_, i) => ({ x: Math.random() * c.width, y: Math.random() * c.height, r: 200 + Math.random() * 300, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, hue: [250, 160, 280, 200, 340][i], alpha: 0.08 + Math.random() * 0.06 })); const draw = () => { ctx.fillStyle = "#060911"; ctx.fillRect(0, 0, c.width, c.height); for (const o of orbs) { o.x += o.vx; o.y += o.vy; if (o.x < -o.r) o.x = c.width + o.r; if (o.x > c.width + o.r) o.x = -o.r; if (o.y < -o.r) o.y = c.height + o.r; if (o.y > c.height + o.r) o.y = -o.r; const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r); g.addColorStop(0, `hsla(${o.hue},80%,55%,${o.alpha})`); g.addColorStop(1, `hsla(${o.hue},80%,55%,0)`); ctx.fillStyle = g; ctx.fillRect(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2); } raf = requestAnimationFrame(draw); }; draw(); return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); }; }, []); return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />; };

/* ── Shared Components ── */
const Glass = ({ children, style, onClick }) => (<div onClick={onClick} style={{ background: C.glass, backdropFilter: "blur(24px) saturate(140%)", WebkitBackdropFilter: "blur(24px) saturate(140%)", border: `1px solid ${C.glassBorder}`, borderRadius: 20, padding: "18px 20px", transition: "all 0.2s ease", cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>);
const XPBar = ({ pct, h = 6, color = C.xp }) => (<div style={{ width: "100%", height: h, background: "rgba(255,255,255,0.06)", borderRadius: h, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: h, transition: "width 1.2s cubic-bezier(.16,1,.3,1)", boxShadow: "0 0 12px rgba(124,92,252,0.4)" }} /></div>);
const ScoreRing = ({ score, size = 80, strokeW = 5 }) => { const r = (size - strokeW * 2) / 2; const ci = 2 * Math.PI * r; const off = ci * (1 - score / 100); const col = score >= 90 ? C.green : score >= 75 ? C.blue : score >= 60 ? C.amber : C.red; return (<div style={{ position: "relative", width: size, height: size }}><svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={strokeW} strokeDasharray={ci} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.16,1,.3,1)", filter: `drop-shadow(0 0 6px ${col})` }} /></svg><div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: size * 0.3, fontWeight: 800, color: C.text, fontFamily: "'Geist Mono', monospace", letterSpacing: -1 }}>{score}</span></div></div>); };
const LevelBadge = ({ level }) => (<div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: "linear-gradient(135deg, rgba(124,92,252,0.2), rgba(0,212,255,0.15))", border: "1px solid rgba(124,92,252,0.3)", fontSize: 11, fontWeight: 700, color: C.cyan, textTransform: "uppercase", letterSpacing: 1 }}>{I.zap} LVL {level}</div>);
const StatPill = ({ icon, label, value, sub, color = C.text, glow }) => (<Glass style={{ padding: "14px 16px", flex: 1, minWidth: 0 }}><div style={{ fontSize: 11, color: C.dim, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><span style={{ color, opacity: 0.7 }}>{icon}</span> {label}</div><div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'Geist Mono', monospace", letterSpacing: -1, textShadow: glow ? `0 0 16px ${color}` : "none" }}>{value}</div>{sub && <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{sub}</div>}</Glass>);

/* ── Bottom Nav ── */
const BottomNav = ({ page, setPage }) => { const items = [{ id: "Home", icon: I.home, label: "Home" }, { id: "Profile", icon: I.user, label: "Profile" }, { id: "Progress", icon: I.chart, label: "Progress" }, { id: "Calendar", icon: I.cal, label: "Calendar" }, { id: "Gear", icon: I.shoe, label: "Gear" }]; return (<nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "rgba(6,9,17,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-around", padding: "6px 0 env(safe-area-inset-bottom, 8px) 0" }}>{items.map((it) => (<button key={it.id} onClick={() => setPage(it.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "6px 12px", color: page === it.id ? C.accent : C.dim, transition: "color 0.2s", minWidth: 44, minHeight: 44 }} aria-label={it.label}><span style={{ transition: "transform 0.2s", transform: page === it.id ? "scale(1.15)" : "scale(1)", filter: page === it.id ? `drop-shadow(0 0 6px ${C.accent})` : "none" }}>{it.icon}</span><span style={{ fontSize: 10, fontWeight: page === it.id ? 700 : 500, letterSpacing: 0.3 }}>{it.label}</span></button>))}</nav>); };

/* ── HOME PAGE ── */
const HomePage = ({ profile, injuries }) => {
  const p = profile || FALLBACK_PROFILE;
  const allInjuries = (injuries && injuries.length > 0) ? injuries : FALLBACK_INJURIES;
  const currentInjuries = allInjuries.filter((i) => i.is_current === true || i.is_current === "true");
  const totalKm = 780, goalKm = 1500, pct = Math.round((totalKm / goalKm) * 100);
  const xp = 4250, level = Math.floor(xp / 1000) + 1, xpPct = ((xp % 1000) / 1000) * 100;
  const weekDays = [{ d: "M", type: "Easy", km: 6, done: true }, { d: "T", type: "Strength", km: null, done: true }, { d: "W", type: "Threshold", km: 12, done: true }, { d: "T", type: "Easy", km: 10, done: false }, { d: "F", type: "Rest", km: null, done: false }, { d: "S", type: "Long", km: 32, done: false }, { d: "S", type: "Shakeout", km: 5, done: false }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* XP Hero */}
      <Glass style={{ padding: "20px", background: "linear-gradient(135deg, rgba(124,92,252,0.12), rgba(0,212,255,0.06), rgba(12,16,28,0.72))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, color: C.sub, fontWeight: 500 }}>Welcome back</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>{p.name}</div>
          </div>
          <LevelBadge level={level} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{xp} XP</span>
          <div style={{ flex: 1 }}><XPBar pct={xpPct} /></div>
          <span style={{ fontSize: 11, color: C.dim }}>{level * 1000} XP</span>
        </div>
        <div style={{ fontSize: 11, color: C.dim }}>{Math.round(1000 - (xp % 1000))} XP to Level {level + 1}</div>
      </Glass>

      {/* Goal */}
      <Glass>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.sub }}>Marathon goal</span>
          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: C.greenDim, color: C.green, fontWeight: 700 }}>On track</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 40, fontWeight: 900, fontFamily: "'Geist Mono', monospace", color: C.text, letterSpacing: -2, textShadow: "0 0 30px rgba(124,92,252,0.3)" }}>{pct}%</span>
          <span style={{ fontSize: 13, color: C.dim }}>{totalKm}/{goalKm} km</span>
        </div>
        <XPBar pct={pct} h={8} />
      </Glass>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatPill icon={I.zap} label="Readiness" value="88%" sub="Trending up" color={C.green} glow />
        <StatPill icon={I.heart} label="VO2 max" value={String(p.vo2_max_estimate || 58)} sub="Est. fitness" color={C.blue} />
        <StatPill icon={I.fire} label="Training load" value="75 km" sub="Productive" color={C.amber} />
        <StatPill icon={I.trophy} label="Race day" value="0d" sub="Marathon" color={C.cyan} glow />
      </div>

      {/* Today's Workout */}
      <Glass style={{ borderLeft: `3px solid ${C.accent}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Easy shakeout</div>
            <div style={{ fontSize: 12, color: C.sub }}>Active recovery - 5 km</div>
          </div>
          <div style={{ padding: "6px 14px", borderRadius: 10, background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: C.accentGlow }}>Push to watch</div>
        </div>
        {[{ phase: "Warm-up", desc: "5 min @ Z1 - 96-115 bpm", col: C.blue }, { phase: "Main set", desc: "5 km @ Z1/Z2 - 96-134 bpm", col: C.green }, { phase: "Cool-down", desc: "5 min @ Z1 - 96-115 bpm", col: C.accent }].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderTop: i > 0 ? `1px solid ${C.glassBorder}` : "none" }}>
            <div style={{ width: 4, height: 28, borderRadius: 2, background: s.col }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.phase}</div>
              <div style={{ fontSize: 12, color: C.sub, fontFamily: "'Geist Mono', monospace" }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </Glass>

      {/* PHYSIO FOCUS - always shows with fallback */}
      <Glass style={{ borderLeft: `3px solid ${C.red}` }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Physio focus</div>
        {currentInjuries.length > 0 ? (
          <>
            <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginBottom: 8 }}>
              {currentInjuries[0].injury_type} - {currentInjuries[0].side} {currentInjuries[0].body_part} - {currentInjuries[0].severity_current}/10
            </div>
            <div style={{ fontSize: 11, color: C.sub, marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Activations</div>
            {(currentInjuries[0].activations || []).map((a, i) => (
              <div key={i} style={{ fontSize: 12, color: C.sub, padding: "4px 0 4px 12px", borderLeft: `2px solid ${C.glassBorder}`, marginBottom: 4 }}>{a}</div>
            ))}
            <div style={{ fontSize: 11, color: C.sub, marginTop: 10, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Form cues</div>
            {(currentInjuries[0].form_cues || []).map((c, i) => (
              <div key={i} style={{ fontSize: 12, color: C.sub, padding: "4px 0 4px 12px", borderLeft: "2px solid rgba(255,77,106,0.3)", marginBottom: 4 }}>{c}</div>
            ))}
          </>
        ) : (
          <div style={{ fontSize: 12, color: C.dim }}>No active injuries. Keep it up!</div>
        )}
        <div style={{ fontSize: 11, color: C.sub, marginTop: 12, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Key cues for this run</div>
        {["Maintain a tall posture, running proud.", "Focus on quick, light steps, not heavy plodding.", "Keep your arms relaxed, swinging front to back."].map((c, i) => (
          <div key={i} style={{ fontSize: 12, color: C.sub, padding: "4px 0 4px 12px", borderLeft: `2px solid rgba(59,158,255,0.3)`, marginBottom: 4 }}>{c}</div>
        ))}
      </Glass>

      {/* Weekly Strip */}
      <Glass>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Week 12 - Peak mileage</div>
        <div style={{ display: "flex", gap: 6 }}>
          {weekDays.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "10px 2px", borderRadius: 12, background: d.done ? C.greenDim : "rgba(255,255,255,0.02)", border: `1px solid ${d.done ? "rgba(0,232,143,0.2)" : C.glassBorder}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: d.done ? C.green : C.dim, marginBottom: 4 }}>{d.d}</div>
              <div style={{ fontSize: 9, color: C.sub, lineHeight: 1.3 }}>{d.type}</div>
              {d.km && <div style={{ fontSize: 10, fontWeight: 700, color: C.text, fontFamily: "'Geist Mono', monospace", marginTop: 2 }}>{d.km}</div>}
              {d.done && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, margin: "4px auto 0", boxShadow: `0 0 6px ${C.green}` }} />}
            </div>
          ))}
        </div>
      </Glass>

      {/* Recent */}
      <Glass>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Recent runs</div>
        {[{ name: "Threshold Run", dist: "12.05 km", pace: "5:00/km", score: 92, badge: "Breakthrough" }, { name: "Evening Shakeout", dist: "5.2 km", pace: "5:46/km", score: 88 }, { name: "Long Run", dist: "22.5 km", pace: "6:00/km", score: 76 }].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i > 0 ? `1px solid ${C.glassBorder}` : "none", cursor: "pointer" }}>
            <ScoreRing score={a.score} size={44} strokeW={3} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{a.name}</div>
              <div style={{ fontSize: 11, color: C.dim, fontFamily: "'Geist Mono', monospace" }}>{a.dist} - {a.pace}</div>
            </div>
            {a.badge && (<span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8, background: C.greenDim, color: C.green, border: "1px solid rgba(0,232,143,0.2)", whiteSpace: "nowrap" }}>{a.badge}</span>)}
            <span style={{ color: C.dim }}>{I.chevR}</span>
          </div>
        ))}
      </Glass>
    </div>
  );
};

/* ── PROFILE PAGE ── */
const ProfilePage = ({ profile, injuries, bodyComp }) => {
  const p = profile || FALLBACK_PROFILE;
  const inj = (injuries && injuries.length > 0) ? injuries : FALLBACK_INJURIES;
  const bc = (bodyComp && bodyComp.length > 0) ? bodyComp : FALLBACK_BODYCOMP;
  const latest = bc[0]; const prev = bc[1];
  const d = (a, b) => { if (!a || !b) return null; const v = (a - b).toFixed(1); return v > 0 ? `+${v}` : v; };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Glass style={{ textAlign: "center", padding: "28px 20px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", margin: "0 auto 12px", background: "linear-gradient(135deg, #7C5CFC, #00D4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", boxShadow: "0 0 24px rgba(124,92,252,0.4)" }}>{p.name[0]}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{p.name}</div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{p.email}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14 }}>
          {[{ l: "Age", v: p.age }, { l: "Weight", v: `${p.weight_kg} kg` }, { l: "Height", v: `${p.height_cm} cm` }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: "'Geist Mono', monospace" }}>{s.v}</div>
              <div style={{ fontSize: 10, color: C.dim }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Glass>

      <Glass style={{ borderLeft: `3px solid ${C.cyan}` }}>
        <div style={{ fontSize: 11, color: C.dim, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Primary goal</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{p.goal_race_distance}</div>
        <div style={{ fontSize: 13, color: C.sub, fontFamily: "'Geist Mono', monospace", marginTop: 4 }}>{p.goal_target_time} - {p.goal_race_date}</div>
      </Glass>

      <Glass>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Running profile</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{ l: "Cadence", v: `${p.typical_cadence_spm} spm` }, { l: "Foot strike", v: p.foot_strike }, { l: "Experience", v: `${p.running_experience_years} yrs` }, { l: "Volume", v: `${p.weekly_volume_km} km/wk` }, { l: "Resting HR", v: `${p.resting_hr} bpm` }, { l: "Max HR", v: `${p.max_hr} bpm` }].map((s, i) => (
            <div key={i} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${C.glassBorder}` }}>
              <div style={{ fontSize: 10, color: C.dim }}>{s.l}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Geist Mono', monospace", marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </Glass>

      <Glass>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Heart rate zones</div>
        <div style={{ display: "flex", gap: 3, borderRadius: 12, overflow: "hidden" }}>
          {[{ z: "Z1", r: p.hr_zone_1, c: "#3B9EFF" }, { z: "Z2", r: p.hr_zone_2, c: "#00E88F" }, { z: "Z3", r: p.hr_zone_3, c: "#FFB020" }, { z: "Z4", r: p.hr_zone_4, c: "#FF4D6A" }, { z: "Z5", r: p.hr_zone_5, c: "#DC2626" }].map((z, i) => (
            <div key={i} style={{ flex: 1, padding: "10px 4px", textAlign: "center", background: `${z.c}10` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: z.c, textShadow: `0 0 8px ${z.c}40` }}>{z.z}</div>
              <div style={{ fontSize: 9, color: C.sub, fontFamily: "'Geist Mono', monospace", marginTop: 2 }}>{z.r}</div>
            </div>
          ))}
        </div>
      </Glass>

      <Glass>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Body composition</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[{ l: "Weight", v: latest.weight_kg, u: "kg", dl: d(latest.weight_kg, prev?.weight_kg) }, { l: "Body fat", v: latest.body_fat_pct, u: "%", dl: d(latest.body_fat_pct, prev?.body_fat_pct) }, { l: "Muscle", v: latest.skeletal_muscle_pct, u: "%", dl: d(latest.skeletal_muscle_pct, prev?.skeletal_muscle_pct) }, { l: "BMR", v: latest.bmr_kcal, u: "kcal", dl: d(latest.bmr_kcal, prev?.bmr_kcal) }, { l: "Visceral", v: latest.visceral_fat, u: "", dl: null }, { l: "Met. age", v: latest.metabolic_age, u: "", dl: null }].map((m, i) => (
            <div key={i} style={{ padding: 10, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: `1px solid ${C.glassBorder}` }}>
              <div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.l}</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Geist Mono', monospace", color: C.text, marginTop: 2 }}>{m.v}<span style={{ fontSize: 10, color: C.dim }}>{m.u}</span></div>
              {m.dl && <div style={{ fontSize: 10, color: parseFloat(m.dl) <= 0 ? C.green : C.red, marginTop: 1 }}>{m.dl}</div>}
            </div>
          ))}
        </div>
      </Glass>

      <Glass>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Injury tracker</div>
        {inj.map((injury, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", marginBottom: 6, borderRadius: 12, background: injury.is_current ? C.redDim : "rgba(255,255,255,0.03)", border: `1px solid ${injury.is_current ? "rgba(255,77,106,0.2)" : C.glassBorder}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{injury.injury_type}</div>
              <div style={{ fontSize: 11, color: C.dim }}>{injury.side} {injury.body_part} - {injury.year_occurred}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: injury.status === "managing" ? C.amberDim : C.greenDim, color: injury.status === "managing" ? C.amber : C.green }}>{injury.status}</span>
          </div>
        ))}
      </Glass>
    </div>
  );
};

/* ── PROGRESS PAGE ── */
const ProgressPage = ({ bodyComp }) => {
  const bc = (bodyComp && bodyComp.length > 0) ? bodyComp : FALLBACK_BODYCOMP;
  const weeks = [{ w: "W1", p: 50, a: 48 }, { w: "W2", p: 55, a: 54 }, { w: "W3", p: 58, a: 60 }, { w: "W4", p: 45, a: 42 }, { w: "W5", p: 62, a: 60 }, { w: "W6", p: 65, a: 68 }];
  const max = 80;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Glass>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>Weekly volume</div>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 16 }}>Planned vs actual (km)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160 }}>
          {weeks.map((w, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 130, width: "100%" }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "4px 4px 0 0", height: `${(w.p / max) * 100}%` }} />
                <div style={{ flex: 1, background: `linear-gradient(to top, ${C.accent}, ${C.cyan})`, borderRadius: "4px 4px 0 0", height: `${(w.a / max) * 100}%`, boxShadow: "0 0 8px rgba(124,92,252,0.3)" }} />
              </div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>{w.w}</div>
            </div>
          ))}
        </div>
      </Glass>
      <Glass>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 12 }}>Performance trend</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {weeks.map((w, i) => (
            <div key={i} style={{ padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${C.glassBorder}`, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.dim, marginBottom: 6 }}>{w.w}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.accent, fontFamily: "'Geist Mono', monospace" }}>{230 + i * 8}W</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, fontFamily: "'Geist Mono', monospace", marginTop: 4 }}>{62 + i * 3}%</div>
              <div style={{ fontSize: 9, color: C.dim }}>stamina</div>
            </div>
          ))}
        </div>
      </Glass>
      <Glass>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 12 }}>Body composition trend</div>
        {bc.slice(0, 6).reverse().map((b, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.glassBorder}`, fontSize: 12 }}>
            <span style={{ color: C.dim }}>{new Date(b.measured_at).toLocaleDateString("en-CA", { month: "short", year: "2-digit" })}</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", color: C.text, fontWeight: 600 }}>{b.weight_kg} kg</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", color: C.amber, fontWeight: 600 }}>{b.body_fat_pct}%</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", color: C.blue, fontWeight: 600 }}>{b.skeletal_muscle_pct}%</span>
          </div>
        ))}
      </Glass>
    </div>
  );
};

/* ── CALENDAR PAGE ── */
const CalendarPage = () => {
  const days = [{ d: "Mon 9", type: "Easy Run", km: "6 km", status: "done", score: 85 }, { d: "Tue 10", type: "Strength", km: "60 min", status: "done", score: 78 }, { d: "Wed 11", type: "Threshold Intervals", km: "12 km", status: "done", score: 92 }, { d: "Thu 12", type: "Easy Run", km: "10 km", status: "upcoming" }, { d: "Fri 13", type: "Rest Day", km: "", status: "rest" }, { d: "Sat 14", type: "Long Run + Race Pace", km: "32 km", status: "upcoming" }, { d: "Sun 15", type: "Easy Shakeout", km: "5 km", status: "upcoming" }];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Glass style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Week 12</div>
        <div style={{ fontSize: 12, color: C.dim }}>Peak mileage and race pace simulation</div>
      </Glass>
      {days.map((d, i) => (
        <Glass key={i} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", borderLeft: d.status === "done" ? `3px solid ${C.green}` : d.status === "rest" ? `3px solid ${C.dim}` : `3px solid ${C.accent}` }}>
          <div style={{ minWidth: 44, textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.dim }}>{d.d.split(" ")[0]}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{d.d.split(" ")[1]}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{d.type}</div>
            {d.km && <div style={{ fontSize: 12, color: C.sub, fontFamily: "'Geist Mono', monospace" }}>{d.km}</div>}
          </div>
          {d.status === "done" && d.score && <ScoreRing score={d.score} size={38} strokeW={3} />}
          {d.status === "upcoming" && <span style={{ color: C.dim }}>{I.chevR}</span>}
        </Glass>
      ))}
    </div>
  );
};

/* ── GEAR PAGE ── */
const GearPage = ({ equipment }) => {
  const eq = (equipment && equipment.length > 0) ? equipment : FALLBACK_EQUIPMENT;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Glass style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Gear rack</div>
        <div style={{ fontSize: 12, color: C.dim }}>Track mileage and know when to replace</div>
      </Glass>
      {eq.map((e, i) => {
        const pct = Math.round((e.total_distance_km / e.max_distance_km) * 100);
        const col = pct > 80 ? C.red : pct > 60 ? C.amber : C.green;
        return (
          <Glass key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{e.brand} {e.model}</div>
                <div style={{ fontSize: 11, color: C.dim }}>{e.name}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: pct > 80 ? C.redDim : C.greenDim, color: pct > 80 ? C.red : C.green }}>{pct > 80 ? "Replace soon" : "Good"}</span>
            </div>
            <XPBar pct={pct} h={6} color={col === C.green ? C.xp : col === C.amber ? C.amber : C.red} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: C.dim, fontFamily: "'Geist Mono', monospace" }}>{e.total_distance_km} km</span>
              <span style={{ fontSize: 11, color: C.sub, fontFamily: "'Geist Mono', monospace" }}>{e.max_distance_km} km max</span>
            </div>
          </Glass>
        );
      })}
    </div>
  );
};

/* ── MAIN APP ── */
export default function RunIQ() {
  const [page, setPage] = useState("Home");
  const [profile, setProfile] = useState(null);
  const [injuries, setInjuries] = useState([]);
  const [bodyComp, setBodyComp] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [p, inj, bc, sess, assess, eq] = await Promise.all([
        sb("athlete_profile", "limit=1"),
        sb("health_injury", "order=year_occurred.desc"),
        sb("body_composition", "order=measured_at.desc"),
        sb("planned_sessions", "order=scheduled_date.asc&limit=7"),
        sb("run_assessments", "order=created_at.desc&limit=5"),
        sb("equipment", "order=total_distance_km.desc"),
      ]);
      if (Array.isArray(p) && p.length > 0) setProfile(p[0]);
      if (Array.isArray(inj) && inj.length > 0) setInjuries(inj);
      if (Array.isArray(bc) && bc.length > 0) setBodyComp(bc);
      if (Array.isArray(sess)) setSessions(sess);
      if (Array.isArray(assess)) setAssessments(assess);
      if (Array.isArray(eq) && eq.length > 0) setEquipment(eq);
    } catch (e) { console.error("Load error:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const renderPage = () => {
    if (loading) return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${C.glassBorder}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 12, color: C.dim }}>Loading your data...</span>
      </div>
    );
    switch (page) {
      case "Home": return <HomePage profile={profile} injuries={injuries} />;
      case "Profile": return <ProfilePage profile={profile} injuries={injuries} bodyComp={bodyComp} />;
      case "Progress": return <ProgressPage bodyComp={bodyComp} />;
      case "Calendar": return <CalendarPage />;
      case "Gear": return <GearPage equipment={equipment} />;
      default: return null;
    }
  };

  const p = profile || FALLBACK_PROFILE;

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: "'DM Sans', -apple-system, sans-serif", color: C.text, WebkitFontSmoothing: "antialiased" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity:0; } to { opacity:1; } } * { box-sizing: border-box; margin: 0; padding: 0; } body { background: #060911; overflow-x: hidden; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }`}</style>
      <LivingBg />
      <div style={{ position: "relative", zIndex: 10, maxWidth: 480, margin: "0 auto", padding: "16px 16px 100px 16px", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0 16px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.accent, filter: `drop-shadow(0 0 8px ${C.accent})` }}>{I.zap}</span>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5, background: C.xp, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RunIQ</span>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #7C5CFC, #00D4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", cursor: "pointer", boxShadow: "0 0 16px rgba(124,92,252,0.3)" }} onClick={() => setPage("Profile")}>{p.name[0]}</div>
        </div>
        <div style={{ animation: "fadeIn 0.3s ease" }}>{renderPage()}</div>
      </div>
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}
