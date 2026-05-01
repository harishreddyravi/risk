import React from 'react';
import Icon from '../components/Icon.jsx';
import { SevPill, CiteChip, AiSummary, Sparkline, sevColor } from '../components/Primitives.jsx';
import { TrendChart, Heatmap, RadarChart, SankeyMini } from '../components/Charts.jsx';

const THRESHOLD = 60;
const RADAR_BENCH = [3.0, 3.6, 3.4, 3.2];

export default function Dashboard({ data, onOpenApp, onOpenFinding, onOpenIssue, onOpenCitation }) {
  if (!data) return <div style={{ padding: 40, color: 'var(--ink-4)' }}>Loading…</div>;
  const { regulations, controls, issues, applications, trend, findings } = data;

  const composite = trend[trend.length - 1]?.value ?? 64;
  const prev = trend[trend.length - 2]?.value ?? 66;
  const delta = composite - prev;

  const openIssues = issues.filter(i => i.status !== 'Accepted Risk').length;
  const deficient  = controls.filter(c => c.status === 'Deficient' || c.effectiveness < 60).length;
  const avgCov     = Math.round(regulations.reduce((s, r) => s + r.coverage, 0) / (regulations.length || 1));

  const radarValues = [
    +(applications.reduce((s, a) => s + a.likelihood, 0) / (applications.length || 1)).toFixed(1),
    +(applications.reduce((s, a) => s + a.impact, 0) / (applications.length || 1)).toFixed(1),
    +(applications.reduce((s, a) => s + a.control_score, 0) / (applications.length || 1)).toFixed(1),
    +(applications.reduce((s, a) => s + a.regulatory_score, 0) / (applications.length || 1)).toFixed(1),
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Q1 2026 · Enterprise view</div>
          <h1 className="page-title">Executive Risk Dashboard</h1>
          <div className="page-sub">
            Composite residual risk across {applications.length} applications, {controls.length} controls and {regulations.length} regulatory frameworks. Auto-refreshed nightly.
          </div>
        </div>
      </div>

      <AiSummary>
        Residual risk has improved <strong>{Math.abs(delta)} points QoQ</strong> driven by MFA rollout completion, but remains{' '}
        <strong>above the {THRESHOLD} appetite threshold</strong>. The dominant driver is{' '}
        <strong>third-party SOC2 program decay</strong> —{' '}
        <CiteChip reg="OCC-TPM" section="Bull-2023-17-B" onOpen={onOpenCitation} />.
        Recommended: escalate vendor backlog to the CRO with proposed re-tiering of 3 critical providers.
      </AiSummary>

      {/* KPI row */}
      <div className="grid kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi">
          <div className="kpi-label">Composite Residual Risk</div>
          <div className="row" style={{ alignItems: 'baseline', gap: 10 }}>
            <div className="kpi-value">{composite}</div>
            <Sparkline values={trend.map(t => t.value)} w={88} h={26} color={sevColor('High')} />
          </div>
          <div className={`kpi-delta ${delta < 0 ? 'down' : 'up'}`}>
            <Icon name={delta < 0 ? 'arrowDown' : 'arrowUp'} size={12} />
            {Math.abs(delta)} pts vs last month · target ≤ {THRESHOLD}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Open Issues</div>
          <div className="kpi-value">{openIssues}</div>
          <div className="kpi-delta up">
            <Icon name="arrowUp" size={12} /> 3 new this week · 2 escalated
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Deficient Controls</div>
          <div className="kpi-value">{deficient}</div>
          <div className="kpi-delta down">
            <Icon name="arrowDown" size={12} /> 1 remediated since Mar
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Reg. Coverage</div>
          <div className="kpi-value">
            {avgCov}<span style={{ fontSize: 18, color: 'var(--ink-3)' }}>%</span>
          </div>
          <div className="kpi-delta down">
            <Icon name="arrowUp" size={12} /> +6% QoQ from MFA &amp; encryption
          </div>
        </div>
      </div>

      {/* Trend + Radar */}
      <div className="grid chart-grid-a" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Composite Risk · 12-month Trend</div>
              <div className="card-sub">Lower is better · dashed = board-approved appetite</div>
            </div>
            <div className="row" style={{ gap: 14, fontSize: 11, color: 'var(--ink-4)' }}>
              <span className="row" style={{ gap: 5 }}>
                <span style={{ width: 14, height: 2, background: 'var(--accent)', display: 'inline-block' }} /> Composite
              </span>
              <span className="row" style={{ gap: 5 }}>
                <span style={{ width: 14, height: 0, borderTop: '1.5px dashed var(--crit)', display: 'inline-block' }} /> Appetite
              </span>
            </div>
          </div>
          <TrendChart data={trend} threshold={THRESHOLD} />
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Risk Profile · Multi-axis</div>
              <div className="card-sub">Solid = enterprise · dashed = peer benchmark</div>
            </div>
          </div>
          <RadarChart
            axes={['Likelihood', 'Impact', 'Control', 'Regulatory']}
            values={radarValues}
            benchmark={RADAR_BENCH} />
        </div>
      </div>

      {/* Heatmap + Coverage */}
      <div className="grid chart-grid-b" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Likelihood × Impact Heatmap</div>
              <div className="card-sub">Click a cell to open the application</div>
            </div>
          </div>
          <Heatmap apps={applications} onCellClick={onOpenApp} />
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Control Coverage by Regulation</div>
              <div className="card-sub">% of mapped controls with current evidence</div>
            </div>
          </div>
          <div>
            {regulations.map(r => {
              const tone = r.coverage >= 75 ? 'var(--low)' : r.coverage >= 60 ? 'var(--med)' : 'var(--high)';
              return (
                <div className="cov-row" key={r.id}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{r.title}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{r.body} · {r.sections?.length || 0} chapters</div>
                  </div>
                  <div className="bar" style={{ height: 7 }}>
                    <i style={{ width: `${r.coverage}%`, background: tone }} />
                  </div>
                  <div className="num" style={{ fontSize: 13, textAlign: 'right', color: tone }}>{r.coverage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sankey + AI Findings */}
      <div className="grid chart-grid-c">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Regulation → Control Family → Open Issues</div>
              <div className="card-sub">Where regulatory exposure is materializing</div>
            </div>
          </div>
          <SankeyMini regulations={regulations} controls={controls} issues={issues} />
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">AI Findings · Top {findings.length}</div>
              <div className="card-sub">Auto-generated, traceable to regulation</div>
            </div>
          </div>
          <div className="col" style={{ gap: 10 }}>
            {findings.map(f => (
              <div key={f.id} onClick={() => onOpenFinding && onOpenFinding(f)}
                style={{ padding: 12, border: '1px solid var(--line)', borderRadius: 9, cursor: 'pointer', background: 'var(--bg)' }}>
                <div className="row" style={{ marginBottom: 6, justifyContent: 'space-between' }}>
                  <SevPill level={f.severity} />
                  <span className="muted num" style={{ fontSize: 11 }}>conf {Math.round(f.confidence * 100)}%</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.4, marginBottom: 8 }}>{f.headline}</div>
                <div className="chips">
                  {(f.citations || []).map((c, i) => (
                    <CiteChip key={i} reg={c.regulation_id} section={c.section_id} onOpen={onOpenCitation} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
