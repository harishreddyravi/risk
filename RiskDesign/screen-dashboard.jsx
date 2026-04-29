(() => {
/* global React, RiskUI */
const { useState, useMemo } = React;
const { Icon, SevPill, CiteChip, Sparkline, AiSummary, TrendChart, Heatmap, RadarChart, SankeyMini, CoverageRing, sevClass, sevColor } = RiskUI;

/* ============================== DASHBOARD ============================== */
const DashboardScreen = ({ data, threshold, onOpenApp, onOpenFinding, onOpenIssue, onOpenCitation }) => {
  const { REGULATIONS, CONTROLS, ISSUES, APPLICATIONS, TREND, AI_FINDINGS } = data;

  const composite = TREND[TREND.length - 1].v;
  const prev = TREND[TREND.length - 2].v;
  const delta = composite - prev;

  const openIssues = ISSUES.filter(i => i.status !== "Accepted Risk").length;
  const critControls = CONTROLS.filter(c => c.status === "Deficient" || c.effectiveness < 60).length;
  const avgCoverage = Math.round(REGULATIONS.reduce((s, r) => s + r.coverage, 0) / REGULATIONS.length);

  const radarValues = [3.4, 4.2, 3.0, 3.8]; // Likelihood, Impact, Control, Regulatory (1-5)
  const radarBench  = [3.0, 3.6, 3.4, 3.2];

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Q1 2026 · Enterprise view</div>
          <h1 className="page-title">Executive Risk Dashboard</h1>
          <div className="page-sub">Composite residual risk across {APPLICATIONS.length} applications, {CONTROLS.length} controls and {REGULATIONS.length} regulatory frameworks. Auto-refreshed nightly.</div>
        </div>
        <div className="row">
          <button className="btn"><Icon name="download" size={14}/> Export board pack</button>
          <button className="btn btn-primary"><Icon name="sparkle" size={14}/> Re-run AI assessment</button>
        </div>
      </div>

      <AiSummary>
        Residual risk has improved <strong>4 points QoQ</strong> driven by MFA rollout completion, but is still <strong>above the {threshold} appetite threshold</strong>. The dominant driver is <strong>third-party SOC2 program decay</strong> ({" "}
        <CiteChip reg="OCC-TPM" section="Bull-2023-17-B" onOpen={onOpenCitation}/> ). Recommended next action: escalate vendor backlog to the CRO with proposed re-tiering of 3 critical providers.
      </AiSummary>

      {/* KPI row */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 16 }}>
        <div className="kpi">
          <div className="kpi-label">Composite Residual Risk</div>
          <div className="row" style={{ alignItems: "baseline", gap: 12 }}>
            <div className="kpi-value">{composite}</div>
            <Sparkline values={TREND.map(t => t.v)} w={92} h={28} color={sevColor("High")}/>
          </div>
          <div className={`kpi-delta ${delta < 0 ? "down" : "up"}`}>
            <Icon name={delta < 0 ? "arrowDown" : "arrowUp"} size={12}/>
            {Math.abs(delta)} pts vs last month · target ≤ {threshold}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Open Issues</div>
          <div className="kpi-value">{openIssues}</div>
          <div className="kpi-delta up"><Icon name="arrowUp" size={12}/> 3 new this week · 2 escalated</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Deficient Controls</div>
          <div className="kpi-value">{critControls}</div>
          <div className="kpi-delta down"><Icon name="arrowDown" size={12}/> 1 remediated since Mar</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Reg. Coverage</div>
          <div className="kpi-value">{avgCoverage}<span style={{ fontSize: 18, color: "var(--ink-3)" }}>%</span></div>
          <div className="kpi-delta down"><Icon name="arrowUp" size={12}/> +6% QoQ from MFA, encryption</div>
        </div>
      </div>

      {/* Trend + Radar */}
      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Composite Risk · 12-month Trend</div>
              <div className="card-sub">Lower is better · dashed line = board-approved appetite</div>
            </div>
            <div className="row" style={{ gap: 14, fontSize: 11, color: "var(--ink-4)" }}>
              <span className="row" style={{ gap: 6 }}><span style={{ width: 12, height: 2, background: "var(--accent)" }}/>Composite</span>
              <span className="row" style={{ gap: 6 }}><span style={{ width: 12, height: 0, borderTop: "1.5px dashed var(--crit)" }}/>Appetite</span>
            </div>
          </div>
          <TrendChart data={TREND} threshold={threshold}/>
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Risk Profile · Multi-axis</div>
              <div className="card-sub">Solid = enterprise · dashed = peer benchmark</div>
            </div>
          </div>
          <RadarChart axes={["Likelihood", "Impact", "Control", "Regulatory"]} values={radarValues} benchmark={radarBench}/>
        </div>
      </div>

      {/* Heatmap + Coverage */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1.3fr", marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Likelihood × Impact Heatmap</div>
              <div className="card-sub">Tier-0 / Tier-1 applications · click to open</div>
            </div>
          </div>
          <Heatmap apps={APPLICATIONS} onCellClick={onOpenApp}/>
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Control Coverage by Regulation</div>
              <div className="card-sub">% of mapped controls with current evidence</div>
            </div>
          </div>
          <div>
            {REGULATIONS.map(r => (
              <div className="cov-row" key={r.id}>
                <div>
                  <div className="cov-name">{r.title}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{r.body} · {r.sections.length} chapters</div>
                </div>
                <div className="bar" style={{ height: 8 }}>
                  <i style={{ width: `${r.coverage}%`, background: r.coverage >= 75 ? "var(--low)" : r.coverage >= 60 ? "var(--med)" : "var(--high)" }}/>
                </div>
                <div className="cov-pct num">{r.coverage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sankey + Findings */}
      <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Regulation → Control Family → Open Issues</div>
              <div className="card-sub">Where regulatory exposure is materializing</div>
            </div>
          </div>
          <SankeyMini regs={REGULATIONS} controls={CONTROLS} issues={ISSUES}/>
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">AI Findings · Top 3</div>
              <div className="card-sub">Auto-generated, traceable to regulation</div>
            </div>
          </div>
          <div className="col" style={{ gap: 12 }}>
            {AI_FINDINGS.map(f => (
              <div key={f.id} onClick={() => onOpenFinding(f)} style={{
                padding: 12, border: "1px solid var(--line)", borderRadius: 10, cursor: "pointer", background: "var(--bg)"
              }}>
                <div className="row" style={{ marginBottom: 6, justifyContent: "space-between" }}>
                  <SevPill level={f.severity}/>
                  <span className="muted num" style={{ fontSize: 11 }}>conf {(f.confidence * 100).toFixed(0)}%</span>
                </div>
                <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 500, lineHeight: 1.4, marginBottom: 8 }}>{f.headline}</div>
                <div className="chips">
                  {f.citations.map((c, i) => <CiteChip key={i} reg={c.reg} section={c.section} onOpen={onOpenCitation}/>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.DashboardScreen = DashboardScreen;
})();
