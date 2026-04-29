(() => {
/* global React, RiskUI */
const { useState, useMemo } = React;
const { Icon, SevPill, CiteChip, AiSummary, CoverageRing, sevClass, sevColor, RadarChart, Sparkline } = RiskUI;

/* ============================== REGULATIONS ============================== */
const RegulationsScreen = ({ data, onOpenCitation }) => {
  const { REGULATIONS, CONTROLS, ISSUES } = data;
  const [active, setActive] = useState(REGULATIONS[0].id);
  const reg = REGULATIONS.find(r => r.id === active);
  const regControls = CONTROLS.filter(c => c.regulation === active);
  const regIssues = ISSUES.filter(i => i.regulation === active);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Regulation explorer</div>
          <h1 className="page-title">FFIEC & OCC Requirements</h1>
          <div className="page-sub">Mapped to {CONTROLS.length} controls and {ISSUES.length} active issues. Pick a framework to see how requirements translate into your control evidence.</div>
        </div>
        <button className="btn"><Icon name="download" size={14}/> Export gap analysis</button>
      </div>

      <AiSummary>
        Of <strong>{REGULATIONS.length} frameworks</strong> in scope, <strong>OCC Third-Party Risk Management</strong> shows the lowest control coverage (52%) and the highest issue concentration. The pattern matches the AI's top finding — third-party SOC2 program decay.
      </AiSummary>

      <div className="grid" style={{ gridTemplateColumns: "320px 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 8 }}>
          {REGULATIONS.map(r => (
            <div key={r.id}
                 onClick={() => setActive(r.id)}
                 style={{
                   padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                   background: active === r.id ? "var(--accent-soft)" : "transparent",
                   border: active === r.id ? "1px solid var(--accent)" : "1px solid transparent",
                   marginBottom: 4
                 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <span className="tag">{r.id}</span>
                <span className="num" style={{ fontSize: 12, color: r.coverage >= 75 ? "var(--low)" : r.coverage >= 60 ? "var(--med)" : "var(--high)" }}>{r.coverage}%</span>
              </div>
              <div style={{ fontSize: 13, color: active === r.id ? "var(--accent)" : "var(--ink-2)", fontWeight: 500, lineHeight: 1.35 }}>{r.title}</div>
              <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{r.body} · {r.sections.length} chapters</div>
            </div>
          ))}
        </div>

        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="row" style={{ alignItems: "flex-start", gap: 18 }}>
              <CoverageRing pct={reg.coverage}/>
              <div style={{ flex: 1 }}>
                <div className="muted" style={{ fontSize: 11 }}>{reg.body} · {reg.id}</div>
                <h2 style={{ margin: "2px 0 8px", fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{reg.title}</h2>
                <div className="chips">
                  <span className="tag">{regControls.length} controls</span>
                  <span className="tag">{regIssues.length} open issues</span>
                  <span className="tag">{reg.sections.reduce((s, x) => s + x.controls, 0)} expected controls</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Chapters & Mapped Controls</div>
              <div className="card-sub">Click a citation to view the requirement text</div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Topic</th>
                  <th>Mapped controls</th>
                  <th>Coverage</th>
                  <th>Open issues</th>
                </tr>
              </thead>
              <tbody>
                {reg.sections.map(s => {
                  const mapped = regControls.filter(c => c.section === s.id);
                  const issues = regIssues.filter(i => i.section === s.id);
                  const coverage = Math.round((mapped.length / s.controls) * 100);
                  return (
                    <tr key={s.id} onClick={() => onOpenCitation(reg.id, s.id)}>
                      <td><CiteChip reg={reg.id} section={s.id}/></td>
                      <td className="ink">{s.label}</td>
                      <td className="num">{mapped.length} / {s.controls}</td>
                      <td>
                        <div className="row" style={{ gap: 8 }}>
                          <div className="bar" style={{ width: 100 }}>
                            <i style={{ width: `${coverage}%`, background: coverage >= 75 ? "var(--low)" : coverage >= 60 ? "var(--med)" : "var(--high)" }}/>
                          </div>
                          <span className="num" style={{ fontSize: 12 }}>{coverage}%</span>
                        </div>
                      </td>
                      <td>
                        {issues.length === 0
                          ? <span className="muted">—</span>
                          : <span className="num" style={{ color: "var(--high)" }}>{issues.length}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================== CONTROLS ============================== */
const ControlsScreen = ({ data, onOpenIssue, onOpenCitation }) => {
  const { CONTROLS, ISSUES } = data;
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => {
    if (filter === "all") return CONTROLS;
    if (filter === "deficient") return CONTROLS.filter(c => c.status === "Deficient" || c.effectiveness < 60);
    if (filter === "needs") return CONTROLS.filter(c => c.status === "Needs Improvement");
    if (filter === "effective") return CONTROLS.filter(c => c.status === "Effective");
    return CONTROLS;
  }, [filter]);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Control inventory</div>
          <h1 className="page-title">Controls & Effectiveness</h1>
          <div className="page-sub">Each control is evidence-backed, tied to one or more regulatory citations, and continuously rated by the AI assessment engine.</div>
        </div>
        <button className="btn btn-primary"><Icon name="sparkle" size={14}/> Re-rate all controls</button>
      </div>

      <AiSummary>
        <strong>3 controls</strong> are operating below the 60% effectiveness threshold and are linked to <strong>4 open issues</strong>. The largest mass of underperformance is in <strong>Third-Party</strong> and <strong>Operations · Capacity</strong>.
      </AiSummary>

      <div className="row" style={{ marginBottom: 14, gap: 6 }}>
        {[
          { id: "all", label: `All · ${CONTROLS.length}` },
          { id: "effective", label: `Effective · ${CONTROLS.filter(c => c.status === "Effective").length}` },
          { id: "needs", label: `Needs improvement · ${CONTROLS.filter(c => c.status === "Needs Improvement").length}` },
          { id: "deficient", label: `Deficient · ${CONTROLS.filter(c => c.status === "Deficient").length}` }
        ].map(t => (
          <button key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`topbar-pill ${filter === t.id ? "is-active" : ""}`}
                  style={{ height: 30, fontSize: 12 }}>{t.label}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Control</th>
              <th>Name</th>
              <th>Family</th>
              <th>Citation</th>
              <th>Apps</th>
              <th>Effectiveness</th>
              <th>Status</th>
              <th>Last tested</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const issues = ISSUES.filter(i => i.control === c.id);
              const tone = c.effectiveness >= 75 ? "low" : c.effectiveness >= 60 ? "med" : c.effectiveness >= 45 ? "high" : "crit";
              return (
                <tr key={c.id}
                    className={selected === c.id ? "is-selected" : ""}
                    onClick={() => setSelected(c.id)}>
                  <td><span className="tag">{c.id}</span></td>
                  <td className="ink" style={{ fontWeight: 500 }}>
                    {c.name}
                    {issues.length > 0 && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: "var(--high)" }}
                            onClick={(e) => { e.stopPropagation(); onOpenIssue(issues[0]); }}>
                        · {issues.length} issue{issues.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </td>
                  <td>{c.family}</td>
                  <td><CiteChip reg={c.regulation} section={c.section} onOpen={(r, s) => { /* swallow row click */ onOpenCitation && onOpenCitation(r, s); }}/></td>
                  <td className="num">{c.apps || "—"}</td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <div className={`bar ${tone}`} style={{ width: 90 }}>
                        <i style={{ width: `${c.effectiveness}%` }}/>
                      </div>
                      <span className="num" style={{ fontSize: 12 }}>{c.effectiveness}</span>
                    </div>
                  </td>
                  <td>
                    <SevPill level={c.status === "Deficient" ? "Critical" : c.status === "Needs Improvement" ? "High" : "Low"}/>
                    <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 6 }}>{c.status}</span>
                  </td>
                  <td className="num muted">{c.lastTested}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================== APPLICATIONS ============================== */
const ApplicationsScreen = ({ data, onOpenApp }) => {
  const { APPLICATIONS } = data;
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Application portfolio</div>
          <h1 className="page-title">Applications · Risk Profiles</h1>
          <div className="page-sub">Tier-0 systems carry the heaviest residual risk. Click any row to see the full multi-axis profile.</div>
        </div>
        <div className="row">
          <button className="btn"><Icon name="download" size={14}/> CSV</button>
        </div>
      </div>

      <AiSummary>
        <strong>Corporate Treasury Portal (TREAS-04)</strong> has the highest residual score (84). Inherent risk is elevated and a known MFA gap on the legacy login path remains open · {" "}
        <CiteChip reg="FFIEC-IS" section="II.C.8"/>.
      </AiSummary>

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Application</th>
              <th>Tier</th>
              <th>Owner</th>
              <th>Users</th>
              <th>Inherent</th>
              <th>Residual</th>
              <th>Open issues</th>
              <th>Frameworks</th>
            </tr>
          </thead>
          <tbody>
            {APPLICATIONS.map(a => {
              const tone = a.residual >= 75 ? "crit" : a.residual >= 60 ? "high" : a.residual >= 45 ? "med" : "low";
              return (
                <tr key={a.id} onClick={() => onOpenApp(a)}>
                  <td>
                    <div style={{ fontWeight: 500, color: "var(--ink)" }}>{a.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{a.id}</div>
                  </td>
                  <td><span className="tag">T{a.tier}</span></td>
                  <td>{a.owner}</td>
                  <td className="num">{a.users.toLocaleString()}</td>
                  <td className="num muted">{a.inherent}</td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <div className={`bar ${tone}`} style={{ width: 90 }}><i style={{ width: `${a.residual}%` }}/></div>
                      <span className="num" style={{ fontSize: 12, color: sevColor(tone === "crit" ? "Critical" : tone === "high" ? "High" : tone === "med" ? "Medium" : "Low") }}>{a.residual}</span>
                    </div>
                  </td>
                  <td className="num">{a.openIssues}</td>
                  <td><div className="chips">{a.regs.map(r => <span key={r} className="tag">{r}</span>)}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================== ISSUES ============================== */
const IssuesScreen = ({ data, onOpenIssue, onOpenCitation }) => {
  const { ISSUES } = data;
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Issue tracker</div>
          <h1 className="page-title">Findings & Issues</h1>
          <div className="page-sub">Issues raised by audit, control testing, and the AI assessment engine — each carries a regulatory citation and proposed remediation.</div>
        </div>
      </div>

      <AiSummary>
        <strong>1 critical</strong>, <strong>4 high</strong>, and <strong>3 medium</strong> issues are open. Mean age of open items is <strong>54 days</strong>; SLA breach risk on 2 items in the next 30 days.
      </AiSummary>

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Severity</th>
              <th>Title</th>
              <th>Citation</th>
              <th>Owner</th>
              <th>Aging</th>
              <th>Status</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {ISSUES.map(i => (
              <tr key={i.id} onClick={() => onOpenIssue(i)}>
                <td><span className="tag">{i.id}</span></td>
                <td><SevPill level={i.severity}/></td>
                <td className="ink" style={{ fontWeight: 500, maxWidth: 360 }}>{i.title}</td>
                <td><CiteChip reg={i.regulation} section={i.section} onOpen={onOpenCitation}/></td>
                <td>{i.owner}</td>
                <td className="num" style={{ color: i.aging > 60 ? "var(--high)" : "var(--ink-2)" }}>{i.aging}d</td>
                <td><span className="muted" style={{ fontSize: 12 }}>{i.status}</span></td>
                <td className="num muted">{i.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================== FINDINGS ============================== */
const FindingsScreen = ({ data, onOpenCitation }) => {
  const { AI_FINDINGS } = data;
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">AI assessment</div>
          <h1 className="page-title">AI-Generated Findings</h1>
          <div className="page-sub">Each finding is traced back to controls, issues, and regulatory citations — never a black-box recommendation.</div>
        </div>
        <button className="btn btn-primary"><Icon name="sparkle" size={14}/> Run new assessment</button>
      </div>

      <div className="col" style={{ gap: 14 }}>
        {AI_FINDINGS.map(f => (
          <div key={f.id} className="card">
            <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
              <div className="ai-summary-icon" style={{ flex: "0 0 28px" }}><Icon name="sparkle" size={14}/></div>
              <div style={{ flex: 1 }}>
                <div className="row" style={{ marginBottom: 8, gap: 10 }}>
                  <SevPill level={f.severity}/>
                  <span className="tag">{f.id}</span>
                  <span className="muted num" style={{ fontSize: 11 }}>conf {(f.confidence * 100).toFixed(0)}%</span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, lineHeight: 1.35, fontWeight: 600 }}>{f.headline}</h3>
                <p style={{ margin: "0 0 12px", color: "var(--ink-2)", fontSize: 13.5, lineHeight: 1.55 }}>{f.detail}</p>
                <div className="chips">
                  {f.citations.map((c, i) => <CiteChip key={i} reg={c.reg} section={c.section} onOpen={onOpenCitation}/>)}
                </div>
              </div>
              <button className="btn">View evidence</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

window.RiskScreens = { RegulationsScreen, ControlsScreen, ApplicationsScreen, IssuesScreen, FindingsScreen };
})();
