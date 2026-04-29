import React from 'react';
import Icon from '../components/Icon.jsx';
import { SevPill, CiteChip, CoverageRing } from '../components/Primitives.jsx';
import { RadarChart } from '../components/Charts.jsx';

const RADAR_BENCH = [3.0, 3.6, 3.4, 3.2];

export default function AppDrawer({ app, data, onClose, onOpenIssue, onOpenCitation }) {
  if (!app) return null;
  const { issues, controls } = data;
  const appIssues = issues.filter(i => i.app_id === app.id || i.app_name === app.name);
  const tone = app.residual_risk >= 75 ? 'crit' : app.residual_risk >= 60 ? 'high' : app.residual_risk >= 45 ? 'med' : 'low';

  return (
    <>
      <div className="drawer-mask" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                <span className="tag mono">{app.id}</span>
                <span className="tag">T{app.tier}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{app.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 2 }}>Owner: {app.owner}</div>
            </div>
            <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0 8px', height: 32 }}>
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        <div className="drawer-body">
          {/* KPI strip */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 8 }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--ink-4)', marginBottom: 6 }}>Residual Risk</div>
              <div style={{ fontSize: 26, fontWeight: 500, color: `var(--${tone})` }}>{app.residual_risk}</div>
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 8 }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--ink-4)', marginBottom: 6 }}>Inherent Risk</div>
              <div style={{ fontSize: 26, fontWeight: 500, color: 'var(--ink)' }}>{app.inherent_risk}</div>
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 8 }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--ink-4)', marginBottom: 6 }}>Open Issues</div>
              <div style={{ fontSize: 26, fontWeight: 500, color: appIssues.length > 0 ? 'var(--high)' : 'var(--ink)' }}>{appIssues.length}</div>
            </div>
          </div>

          {/* Risk score bars */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Multi-axis Risk Profile</div>
            <RadarChart
              axes={['Likelihood', 'Impact', 'Control', 'Regulatory']}
              values={[app.likelihood, app.impact, app.control_score, app.regulatory_score]}
              benchmark={RADAR_BENCH} />
          </div>

          {/* Score bars */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Risk Decomposition</div>
            {[
              { label: 'Likelihood', val: app.likelihood, max: 5 },
              { label: 'Impact', val: app.impact, max: 5 },
              { label: 'Control Score', val: app.control_score, max: 5 },
              { label: 'Regulatory Score', val: app.regulatory_score, max: 5 },
            ].map(({ label, val, max }) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{label}</span>
                  <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{val?.toFixed(1)} / {max}</span>
                </div>
                <div className="bar" style={{ width: '100%' }}>
                  <i style={{ width: `${(val / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Frameworks */}
          {(app.regs || []).length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Regulatory Frameworks</div>
              <div className="chips">
                {app.regs.map(r => <span key={r} className="tag">{r}</span>)}
              </div>
            </div>
          )}

          {/* Open issues */}
          {appIssues.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--line)' }}>
                <div className="card-title">Open Issues ({appIssues.length})</div>
              </div>
              <div className="col" style={{ padding: 12, gap: 8 }}>
                {appIssues.map(i => (
                  <div key={i.id}
                    onClick={() => onOpenIssue && onOpenIssue(i)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      background: 'var(--bg-sunken)', border: '1px solid var(--line)', borderRadius: 7, cursor: 'pointer' }}>
                    <SevPill level={i.severity} />
                    <span className="tag mono">{i.id}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)', flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.title}</span>
                    {i.regulation_id && (
                      <CiteChip reg={i.regulation_id} section={i.section_id} onOpen={onOpenCitation} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Details</div>
            {[
              ['Users', app.users?.toLocaleString()],
              ['Classification', app.classification || '—'],
              ['Environment', app.environment || '—'],
              ['Last Review', app.last_review || '—'],
            ].map(([k, v]) => (
              <div key={k} className="row" style={{ justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{k}</span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
