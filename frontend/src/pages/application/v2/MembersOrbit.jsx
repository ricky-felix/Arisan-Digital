import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { ChevronLeft } from "../../../components/v2/icons";
import { MEMBERS, DANCE_PARAMS, RADIUS_MOBILE, RADIUS_DESKTOP, ORBIT_DUR, AV_HALF } from "../../../components/v2/members/data";
import Legend from "../../../components/v2/members/Legend";
import SummaryStrip from "../../../components/v2/members/SummaryStrip";
import MemberList from "../../../components/v2/members/MemberList";

export default function MembersOrbit() {
  const navigate = useNavigate();
  const [revolving, setRevolving] = useState(false);
  const [ring1Rotate, setRing1Rotate] = useState(false);
  const [entered, setEntered] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, idx: -1 });
  // Stage dimensions: measured after mount so they respond to CSS breakpoints
  const [stageDims, setStageDims] = useState({ w: 390, h: 330 });
  const stageRef = useRef(null);

  // Re-measure stage on mount and on resize
  useEffect(() => {
    function measure() {
      if (stageRef.current) {
        const { offsetWidth, offsetHeight } = stageRef.current;
        setStageDims({ w: offsetWidth, h: offsetHeight });
      }
    }
    measure();
    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(measure)
      : null;
    if (ro && stageRef.current) ro.observe(stageRef.current);
    return () => ro && ro.disconnect();
  }, []);

  // Staggered entrance
  useEffect(() => {
    MEMBERS.forEach((_, i) => {
      setTimeout(() => {
        setEntered(prev => [...prev, i]);
      }, 80 + i * 55);
    });
  }, []);

  function toggleRotate(on) {
    setRevolving(on);
    setRing1Rotate(on);
  }

  function showTooltip(idx) {
    setTooltip(t => t.idx === idx && t.visible ? { visible: false, idx: -1 } : { visible: true, idx });
  }

  const closeTooltip = useCallback((e) => {
    if (!e.target.closest?.(".orbit-member") && !e.target.closest?.(".member-tooltip")) {
      setTooltip({ visible: false, idx: -1 });
    }
  }, []);

  const tt = tooltip.visible && tooltip.idx >= 0 ? MEMBERS[tooltip.idx] : null;

  const CX = stageDims.w / 2;
  const CY = stageDims.h / 2;
  // Scale orbit radius proportionally — desktop stage is 480×480 vs 390×330 mobile
  const RADIUS = stageDims.w >= 440 ? RADIUS_DESKTOP : RADIUS_MOBILE;

  const ttStyle = tooltip.idx < 6
    ? { left: Math.min(CX + 20, stageDims.w - 180) + "px", top: "60px" }
    : { left: Math.max(10, CX - 200) + "px", top: Math.min(CY + 20, stageDims.h - 100) + "px" };

  return (
    <div className="v2-screen v2-anggota">
      <div className="v2-inner overflow-y-auto">

        {/* Header */}
        <div className="orbit-header">
          <button className="back-btn" aria-label="Kembali" type="button" onClick={() => navigate("/app")}>
            <ChevronLeft size={16} stroke="currentColor" strokeWidth={2.5} />
          </button>
          <div>
            <div className="orbit-title">Keluarga Sari</div>
            <div className="orbit-sub">12 anggota · orbit bayar/belum</div>
          </div>
        </div>

        {/* Rotate toggle */}
        <div className="rotate-toggle-row">
          <span className="rotate-label">Putar orbit</span>
          <button
            type="button"
            className="v2-toggle"
            aria-label={revolving ? "Nonaktifkan rotasi orbit" : "Aktifkan rotasi orbit"}
            aria-pressed={revolving}
            onClick={() => toggleRotate(!revolving)}
          >
            <div className={`v2-toggle-track${revolving ? " on" : ""}`} />
            <div className={`v2-toggle-thumb${revolving ? " on" : ""}`} />
          </button>
        </div>

        {/* Desktop two-column layout wrapper */}
        <div className="orbit-desktop-layout">
        <div className="orbit-left-col">

        {/* Orbit stage */}
        <div className="orbit-stage" ref={stageRef} onClick={closeTooltip}>
          {/* Background rings */}
          <div className={`ring ring-1${ring1Rotate ? " ring-rotate-1" : ""}`} />
          <div className={`ring ring-2${ring1Rotate ? " ring-rotate-2" : ""}`} />

          {/* Center pot */}
          <div className="center-pot">
            <div className="pot-fill" />
            <div className="pot-emoji">🏺</div>
            <div className="pot-pct">67%</div>
          </div>

          {/* Orbit ring */}
          <div
            className={`orbit-ring${revolving ? " revolving" : ""}`}
            style={revolving ? { "--orbit-dur": `${ORBIT_DUR}s` } : {}}
          >
            {MEMBERS.map((m, i) => {
              const angle = (i / MEMBERS.length) * 2 * Math.PI - Math.PI / 2;
              const ox = Math.round(Math.cos(angle) * RADIUS);
              const oy = Math.round(Math.sin(angle) * RADIUS);
              const p = DANCE_PARAMS[i];
              const isEntered = entered.includes(i);

              return (
                <div
                  key={m.initials}
                  className={`orbit-member${isEntered ? " entered" : ""}`}
                  style={{
                    left: CX - AV_HALF + "px",
                    top:  CY - AV_HALF + "px",
                    transform: `translate(${ox}px, ${oy}px)`,
                  }}
                  onClick={() => showTooltip(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${m.name} — ${m.statusText}`}
                  onKeyDown={e => e.key === "Enter" && showTooltip(i)}
                >
                  <div
                    className="orbit-inner"
                    style={revolving ? {} : {
                      "--dance-dur": `${p.dur}s`,
                      "--dance-delay": `${p.delay}s`,
                    }}
                  >
                    <div className={`orbit-av ${m.status}`} style={{ background: m.color }}>
                      {m.initials}
                    </div>
                    <div className="orbit-name">{m.name.split(" ")[0]}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tooltip */}
          {tt && (
            <div className="member-tooltip show" style={ttStyle}>
              <div className="mt-name">{tt.name}</div>
              <div className={`mt-status ${tt.status}`}>{tt.statusText}</div>
              <div className="mt-sub">{tt.sub}</div>
            </div>
          )}
        </div>

        <Legend />

        </div>{/* end orbit-left-col */}

        {/* Right column: summary cards + full member list */}
        <div className="orbit-right-col">
          <SummaryStrip />
          <MemberList members={MEMBERS} onSelect={showTooltip} />
        </div>{/* end orbit-right-col */}

        </div>{/* end orbit-desktop-layout */}

        <div className="h-8" />
      </div>
    </div>
  );
}
