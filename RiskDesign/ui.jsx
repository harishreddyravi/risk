(() => {
/* global React */
const { useState, useMemo, useEffect, useRef } = React;

/* ------------------------------ Icons ------------------------------ */
const Icon = ({ name, size = 16 }) => {
  const s = size;
  const stroke = "currentColor";
  const sw = 1.6;
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
    book: <><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V4.5z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/></>,
    shield: <><path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 18l9 5 9-5"/></>,
    flag: <><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></>,
    sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/></>,
    chevron: <><path d="M9 6l6 6-6 6"/></>,
    close: <><path d="M6 6l12 12M6 18L18 6"/></>,
    trend: <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h6v6"/></>,
    download: <><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></>,
    sliders: <><path d="M4 6h12M4 12h6M4 18h10"/><circle cx="18" cy="6" r="2"/><circle cx="13" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></>,
    bot: <><rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 4v3"/><circle cx="9" cy="13" r="1.2" fill={stroke}/><circle cx="15" cy="13" r="1.2" fill={stroke}/></>,
    arrowUp: <><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></>,
    arrowDown: <><path d="M12 5v14"/><path d="M6 13l6 6 6-6"/></>,
    cite: <><path d="M7 7h4v4H7zM7 13h4v4H7zM13 7h4v4h-4zM13 13h4v4h-4z"/></>,
    dot: <circle cx="12" cy="12" r="4" fill={stroke} stroke="none"/>
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

/* ------------------------------ Severity helpers ------------------------------ */
const sevClass = (s) => ({ Critical: "crit", High: "high", Medium: "med", Low: "low" }[s] || "low");
const sevColor = (s) => ({ Critical: "var(--crit)", High: "var(--high)", Medium: "var(--med)", Low: "var(--low)" }[s] || "var(--low)");

const SevPill = ({ level }) => (
  <span className={`sev ${sevClass(level)}`}><span className="dot"/>{level}</span>
);

/* ------------------------------ Citation chip ------------------------------ */
const CiteChip = ({ reg, section, onOpen }) => (
  <span className="cite-chip" onClick={() => onOpen && onOpen(reg, section)}>
    <Icon name="cite" size={11}/>
    <strong>{reg}</strong>
    <span>§{section}</span>
  </span>
);

/* ------------------------------ Sparkline ------------------------------ */
const Sparkline = ({ values, w = 80, h = 24, color }) => {
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / span) * h}`).join(" ");
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ color: color || "var(--ink-3)" }}>
      <polyline className="spark-line" points={pts}/>
    </svg>
  );
};

/* ------------------------------ Topbar / Sidenav ------------------------------ */
const Topbar = ({ persona, setPersona, copilotOn, setCopilotOn, theme, setTheme, onSearch }) => (
  <div className="topbar">
    <div className="brand">
      <div className="brand-mark">R</div>
      <span>Risk Intelligence</span>
      <span className="muted" style={{ fontWeight: 400, fontSize: 12, marginLeft: 6 }}>· Atlas Federal Bank</span>
    </div>
    <input className="topbar-search" placeholder="Search regulations, controls, apps, issues…" onChange={(e) => onSearch && onSearch(e.target.value)}/>
    <div className="topbar-spacer"/>
    <PersonaSwitch persona={persona} setPersona={setPersona}/>
    <button className={`topbar-pill ${copilotOn ? "is-active" : ""}`} onClick={() => setCopilotOn(!copilotOn)}>
      <Icon name="bot" size={14}/> Copilot
    </button>
    <ThemeSwitch theme={theme} setTheme={setTheme}/>
  </div>
);

const PersonaSwitch = ({ persona, setPersona }) => {
  const opts = [
    { id: "cro", label: "CRO" },
    { id: "analyst", label: "Analyst" },
    { id: "auditor", label: "Auditor" }
  ];
  return (
    <div style={{ display: "inline-flex", border: "1px solid var(--line)", borderRadius: 999, padding: 2, background: "var(--bg-elev)" }}>
      {opts.map(o => (
        <button key={o.id} onClick={() => setPersona(o.id)}
          style={{
            border: "none", background: persona === o.id ? "var(--accent)" : "transparent",
            color: persona === o.id ? "white" : "var(--ink-3)",
            borderRadius: 999, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 500
          }}>{o.label}</button>
      ))}
    </div>
  );
};

const ThemeSwitch = ({ theme, setTheme }) => {
  const opts = [
    { id: "modern", swatch: "#2a5bd7", label: "Modern" },
    { id: "banking", swatch: "#1f3a6b", label: "Banking" },
    { id: "dark", swatch: "#0c0e12", label: "Dark" }
  ];
  return (
    <div style={{ display: "inline-flex", gap: 4 }}>
      {opts.map(o => (
        <button key={o.id} onClick={() => setTheme(o.id)} title={o.label}
          style={{
            width: 24, height: 24, borderRadius: 6,
            border: theme === o.id ? "2px solid var(--accent)" : "1px solid var(--line)",
            background: o.swatch, cursor: "pointer", padding: 0
          }}/>
      ))}
    </div>
  );
};

const Sidenav = ({ view, setView, counts }) => {
  const items = [
    { id: "dashboard", icon: "dashboard", label: "Executive Dashboard" },
    { id: "regulations", icon: "book", label: "Regulation Explorer", count: counts.regs },
    { id: "controls", icon: "shield", label: "Control Inventory", count: counts.controls },
    { id: "applications", icon: "layers", label: "Applications", count: counts.apps },
    { id: "issues", icon: "flag", label: "Issues", count: counts.issues }
  ];
  return (
    <nav className="sidenav">
      <div className="sidenav-group">Workspace</div>
      {items.map(it => (
        <div key={it.id}
             className={`nav-item ${view === it.id ? "is-active" : ""}`}
             onClick={() => setView(it.id)}>
          <Icon name={it.icon}/>
          <span>{it.label}</span>
          {it.count != null && <span className="nav-count num">{it.count}</span>}
        </div>
      ))}
      <div className="sidenav-group">AI</div>
      <div className="nav-item" onClick={() => setView("findings")}>
        <Icon name="sparkle"/><span>AI Findings</span>
        <span className="nav-count num">3</span>
      </div>
      <div className="nav-item">
        <Icon name="trend"/><span>Run new assessment</span>
      </div>
      <div className="sidenav-group">Reports</div>
      <div className="nav-item"><Icon name="download"/><span>Board Pack — Q1</span></div>
      <div className="nav-item"><Icon name="download"/><span>OCC Submission Draft</span></div>
    </nav>
  );
};

/* ------------------------------ AI summary banner ------------------------------ */
const AiSummary = ({ children, confidence = 0.94, ts = "Updated 2 min ago" }) => (
  <div className="ai-summary">
    <div className="ai-summary-icon"><Icon name="sparkle" size={14}/></div>
    <div className="ai-summary-body">{children}</div>
    <div className="ai-summary-meta">
      <div>{ts}</div>
      <div className="num">Confidence {(confidence * 100).toFixed(0)}%</div>
    </div>
  </div>
);

/* ------------------------------ Charts ------------------------------ */

const TrendChart = ({ data, threshold }) => {
  const w = 640, h = 220, pad = { l: 36, r: 16, t: 16, b: 28 };
  const max = 100, min = 0;
  const x = (i) => pad.l + (i / (data.length - 1)) * (w - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);
  const linePts = data.map((d, i) => `${x(i)},${y(d.v)}`).join(" ");
  const areaPts = `${x(0)},${h - pad.b} ${linePts} ${x(data.length - 1)},${h - pad.b}`;
  const ticks = [0, 25, 50, 75, 100];
  return (
    <svg className="trend-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {ticks.map(t => (
        <g key={t}>
          <line className="trend-grid" x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)}/>
          <text className="trend-axis" x={pad.l - 6} y={y(t) + 3} textAnchor="end">{t}</text>
        </g>
      ))}
      {threshold != null && (
        <g>
          <line className="trend-thresh" x1={pad.l} x2={w - pad.r} y1={y(threshold)} y2={y(threshold)}/>
          <text className="trend-axis" x={w - pad.r} y={y(threshold) - 4} textAnchor="end" fill="var(--crit)">
            Risk appetite · {threshold}
          </text>
        </g>
      )}
      <polygon className="trend-area" points={areaPts}/>
      <polyline className="trend-line" points={linePts}/>
      {data.map((d, i) => (
        <g key={i}>
          <circle className="trend-dot" cx={x(i)} cy={y(d.v)} r={i === data.length - 1 ? 4 : 2.5}/>
          <text className="trend-axis" x={x(i)} y={h - 8} textAnchor="middle">{d.m}</text>
        </g>
      ))}
    </svg>
  );
};

const Heatmap = ({ apps, onCellClick }) => {
  // 5x5 grid: x = likelihood, y = impact
  const cells = {};
  apps.forEach(a => {
    const k = `${a.likelihood}-${a.impact}`;
    cells[k] = (cells[k] || []).concat(a);
  });
  const colorFor = (l, i) => {
    const score = (l + i) / 2; // 1..5
    if (score >= 4) return "var(--crit-soft)";
    if (score >= 3) return "var(--high-soft)";
    if (score >= 2) return "var(--med-soft)";
    return "var(--low-soft)";
  };
  const inkFor = (l, i) => {
    const score = (l + i) / 2;
    if (score >= 4) return "var(--crit)";
    if (score >= 3) return "var(--high)";
    if (score >= 2) return "var(--med)";
    return "var(--low)";
  };
  const rows = [5, 4, 3, 2, 1];
  return (
    <div>
      <div className="heat">
        <div></div>
        {[1, 2, 3, 4, 5].map(l => <div key={l} className="heat-axis">{l}</div>).slice(0,0)}
        {/* header row of likelihood */}
        {rows.map(impact => (
          <React.Fragment key={impact}>
            <div className="heat-axis">{impact}</div>
            {[1, 2, 3, 4, 5].map(likelihood => {
              const key = `${likelihood}-${impact}`;
              const list = cells[key] || [];
              return (
                <div key={key}
                     className="heat-cell"
                     style={{ background: colorFor(likelihood, impact), color: inkFor(likelihood, impact) }}
                     onClick={() => list.length && onCellClick && onCellClick(list[0])}>
                  {list.length ? <span className="num">{list.length}</span> : ""}
                </div>
              );
            })}
          </React.Fragment>
        ))}
        <div></div>
        {[1, 2, 3, 4, 5].map(l => <div key={l} className="heat-axis">{l}</div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10.5, color: "var(--ink-4)" }}>
        <span>Likelihood →</span>
        <span style={{ writingMode: "horizontal-tb" }}>↑ Impact</span>
      </div>
    </div>
  );
};

const RadarChart = ({ axes, values, benchmark, size = 280 }) => {
  const cx = size / 2, cy = size / 2, r = size / 2 - 36;
  const n = axes.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (v, i) => {
    const rad = (v / 5) * r;
    return [cx + Math.cos(angle(i)) * rad, cy + Math.sin(angle(i)) * rad];
  };
  const poly = (vals) => vals.map((v, i) => point(v, i).join(",")).join(" ");
  const grids = [1, 2, 3, 4, 5];
  return (
    <svg className="radar-svg" viewBox={`0 0 ${size} ${size}`}>
      {grids.map(g => (
        <polygon key={g} className="radar-grid"
          points={Array.from({ length: n }).map((_, i) => point(g, i).join(",")).join(" ")}/>
      ))}
      {axes.map((a, i) => {
        const [x, y] = point(5, i);
        const [lx, ly] = point(5.7, i);
        return (
          <g key={i}>
            <line className="radar-axis" x1={cx} y1={cy} x2={x} y2={y}/>
            <text className="radar-label" x={lx} y={ly} textAnchor="middle" dominantBaseline="middle">{a}</text>
          </g>
        );
      })}
      {benchmark && <polygon className="radar-shape bench" points={poly(benchmark)}/>}
      <polygon className="radar-shape" points={poly(values)}/>
      {values.map((v, i) => {
        const [x, y] = point(v, i);
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)"/>;
      })}
      {grids.map(g => {
        const [x, y] = point(g, 0);
        return <text key={g} className="radar-tick" x={cx + 4} y={y + 3}>{g}</text>;
      })}
    </svg>
  );
};

const SankeyMini = ({ regs, controls, issues }) => {
  // Three-column sankey: Regulations -> Control Families -> Issue Severities
  const w = 720, h = 320;
  const colW = 130;
  const xCol = [40, (w - colW) / 2, w - 170];

  const families = [...new Set(controls.map(c => c.family))];
  const sevs = ["Critical", "High", "Medium"];

  const regHeights = regs.map(r => {
    const cs = controls.filter(c => c.regulation === r.id);
    return { reg: r, count: cs.length || 1 };
  });
  const totalRegs = regHeights.reduce((s, x) => s + x.count, 0);

  const famHeights = families.map(f => {
    const cs = controls.filter(c => c.family === f);
    return { family: f, count: cs.length };
  });
  const totalFams = famHeights.reduce((s, x) => s + x.count, 0);

  const sevHeights = sevs.map(s => ({ sev: s, count: issues.filter(i => i.severity === s).length || 1 }));
  const totalSevs = sevHeights.reduce((s, x) => s + x.count, 0);

  const usable = h - 40;

  // y positions
  let yReg = 20;
  const regPos = regHeights.map(rh => { const y = yReg; const ht = (rh.count / totalRegs) * usable; yReg += ht + 4; return { ...rh, y, h: ht }; });

  let yFam = 20;
  const famPos = famHeights.map(fh => { const y = yFam; const ht = (fh.count / totalFams) * usable; yFam += ht + 4; return { ...fh, y, h: ht }; });

  let ySev = 20;
  const sevPos = sevHeights.map(sh => { const y = ySev; const ht = (sh.count / totalSevs) * usable; ySev += ht + 4; return { ...sh, y, h: ht }; });

  // Links reg -> family
  const links1 = [];
  regPos.forEach(rp => {
    const fams = [...new Set(controls.filter(c => c.regulation === rp.reg.id).map(c => c.family))];
    let yA = rp.y;
    fams.forEach(famName => {
      const fp = famPos.find(f => f.family === famName);
      if (!fp) return;
      const cnt = controls.filter(c => c.regulation === rp.reg.id && c.family === famName).length;
      const ht = (cnt / rp.count) * rp.h;
      links1.push({
        x1: xCol[0] + colW, y1A: yA, y1B: yA + ht,
        x2: xCol[1], y2A: fp.y + (rp.reg.id.charCodeAt(0) % 5) * 0.5, y2B: fp.y + ht
      });
      yA += ht;
    });
  });

  // Links family -> severity (rough proportional)
  const links2 = [];
  famPos.forEach(fp => {
    let yA = fp.y;
    sevPos.forEach(sp => {
      const ht = fp.h / 3 - 1;
      links2.push({
        x1: xCol[1] + colW, y1A: yA, y1B: yA + ht,
        x2: xCol[2], y2A: sp.y, y2B: sp.y + sp.h
      });
      yA += ht;
    });
  });

  const path = (l) => {
    const cx1 = (l.x1 + l.x2) / 2;
    return `M${l.x1},${l.y1A} C${cx1},${l.y1A} ${cx1},${l.y2A} ${l.x2},${l.y2A} L${l.x2},${l.y2B} C${cx1},${l.y2B} ${cx1},${l.y1B} ${l.x1},${l.y1B} Z`;
  };

  return (
    <svg className="sankey-svg" viewBox={`0 0 ${w} ${h}`}>
      <text x={xCol[0]} y={12} fontSize="10" fill="var(--ink-4)" style={{ textTransform: "uppercase", letterSpacing: ".07em" }}>Regulation</text>
      <text x={xCol[1]} y={12} fontSize="10" fill="var(--ink-4)" style={{ textTransform: "uppercase", letterSpacing: ".07em" }}>Control Family</text>
      <text x={xCol[2]} y={12} fontSize="10" fill="var(--ink-4)" style={{ textTransform: "uppercase", letterSpacing: ".07em" }}>Open Issues</text>

      {links1.map((l, i) => <path key={`l1-${i}`} className="sankey-link" d={path(l)}/>)}
      {links2.map((l, i) => <path key={`l2-${i}`} className="sankey-link" d={path(l)} style={{ fillOpacity: 0.10 }}/>)}

      {regPos.map((r, i) => (
        <g key={`r-${i}`}>
          <rect x={xCol[0]} y={r.y} width={colW} height={r.h} rx="3" className="sankey-node-bg"/>
          <text x={xCol[0] + 8} y={r.y + 14} fontSize="10.5" fill="var(--ink-2)" fontWeight="500">{r.reg.id}</text>
          {r.h > 30 && <text x={xCol[0] + 8} y={r.y + 28} fontSize="9.5" fill="var(--ink-4)">{r.reg.body}</text>}
        </g>
      ))}
      {famPos.map((f, i) => (
        <g key={`f-${i}`}>
          <rect x={xCol[1]} y={f.y} width={colW} height={f.h} rx="3" className="sankey-node-bg"/>
          {f.h > 16 && <text x={xCol[1] + 8} y={f.y + 13} fontSize="10.5" fill="var(--ink-2)">{f.family}</text>}
        </g>
      ))}
      {sevPos.map((s, i) => (
        <g key={`s-${i}`}>
          <rect x={xCol[2]} y={s.y} width={colW} height={s.h} rx="3"
                fill={sevColor(s.sev)} fillOpacity="0.14" stroke={sevColor(s.sev)} strokeOpacity="0.4"/>
          <text x={xCol[2] + 10} y={s.y + 14} fontSize="10.5" fill={sevColor(s.sev)} fontWeight="600">
            {s.sev} · {s.count}
          </text>
        </g>
      ))}
    </svg>
  );
};

const CoverageRing = ({ pct, size = 64 }) => {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  const tone = pct >= 75 ? "var(--low)" : pct >= 60 ? "var(--med)" : pct >= 45 ? "var(--high)" : "var(--crit)";
  return (
    <svg className="ring-svg" viewBox={`0 0 ${size} ${size}`}>
      <circle className="ring-track" cx={size/2} cy={size/2} r={r} strokeWidth="6"/>
      <circle className="ring-fill" cx={size/2} cy={size/2} r={r} strokeWidth="6"
              strokeDasharray={c} strokeDashoffset={off}
              transform={`rotate(-90 ${size/2} ${size/2})`}
              style={{ stroke: tone, transition: "stroke-dashoffset 400ms" }}/>
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--ink)" fontFamily="ui-monospace, monospace">
        {pct}%
      </text>
    </svg>
  );
};

window.RiskUI = {
  Icon, SevPill, CiteChip, Sparkline, Topbar, Sidenav, AiSummary,
  TrendChart, Heatmap, RadarChart, SankeyMini, CoverageRing,
  sevClass, sevColor
};
})();
