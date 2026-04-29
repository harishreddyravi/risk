import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { CiteChip, AiSummary, CoverageRing } from '../components/Primitives.jsx';

export default function Regulations({ data, onOpenCitation }) {
  const { regulations, controls, issues } = data;
  const [active, setActive] = useState(regulations[0]?.id);
  const reg = regulations.find(r => r.id === active);
  const regControls = controls.filter(c => c.regulation_id === active);
  const regIssues   = issues.filter(i => i.regulation_id === active);

  if (!reg) return null;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Regulation explorer</div>
          <h1 className="page-title">FFIEC &amp; OCC Requirements</h1>
          <div className="page-sub">Mapped to {controls.length} controls and {issues.length} active issues. Pick a framework to see how requirements translate into control evidence.</div>
        </div>
        <button className="btn"><Icon name="download" size={14} /> Export gap analysis</button>
      </div>

      <AiSummary>
        Of <strong>{regulations.length} frameworks</strong> in scope, <strong>OCC Third-Party Risk Management</strong> shows the lowest control coverage (52%) and the highest issue concentration. The pattern matches the AI's top finding — third-party SOC2 program decay.
      </AiSummary>

      <div className="grid" style={{ gridTemplateColumns: '300px 1fr', gap: 16 }}>
        {/* Regulation list */}
        <div className="card" style={{ padding: 8 }}>
          {regulations.map(r => {
            const tone = r.coverage >= 75 ? 'var(--low)' : r.coverage >= 60 ? 'var(--med)' : 'var(--high)';
            return (
              <div key={r.id} onClick={() => setActive(r.id)}
                style={{
                  padding: '11px 13px', borderRadius: 8, cursor: 'pointer', marginBottom: 3,
                  background: active === r.id ? 'var(--accent-soft)' : 'transparent',
                  border: `1px solid ${active === r.id ? 'var(--accent)' : 'transparent'}`
                }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="tag">{r.id}</span>
                  <span className="num" style={{ fontSize: 12, color: tone }}>{r.coverage}%</span>
                </div>
                <div style={{ fontSize: 13, color: active === r.id ? 'var(--accent)' : 'var(--ink-2)', fontWeight: 500, lineHeight: 1.35 }}>{r.title}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{r.body} · {r.sections?.length || 0} chapters</div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="col" style={{ gap: 14 }}>
          <div className="card">
            <div className="row" style={{ alignItems: 'flex-start', gap: 18 }}>
              <CoverageRing pct={reg.coverage} size={68} />
              <div style={{ flex: 1 }}>
                <div className="muted" style={{ fontSize: 11 }}>{reg.body} · {reg.id}</div>
                <h2 style={{ margin: '2px 0 8px', fontSize: 18, fontWeight: 600, letterSpacing: '-.01em' }}>{reg.title}</h2>
                <div className="chips">
                  <span className="tag">{regControls.length} controls</span>
                  <span className="tag">{regIssues.length} open issues</span>
                  <span className="tag">{reg.sections?.reduce((s, x) => s + x.expected_controls, 0) || 0} expected controls</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px 10px' }}>
              <div className="card-title">Chapters &amp; Mapped Controls</div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Topic</th>
                  <th>Mapped / Expected</th>
                  <th>Coverage</th>
                  <th>Open Issues</th>
                </tr>
              </thead>
              <tbody>
                {(reg.sections || []).map(s => {
                  const mapped = regControls.filter(c => c.section_id === s.section_id);
                  const sIssues = regIssues.filter(i => i.section_id === s.section_id);
                  const coverage = Math.round((mapped.length / (s.expected_controls || 1)) * 100);
                  const tone = coverage >= 75 ? 'var(--low)' : coverage >= 60 ? 'var(--med)' : 'var(--high)';
                  return (
                    <tr key={s.section_id} onClick={() => onOpenCitation && onOpenCitation(reg.id, s.section_id)}>
                      <td><CiteChip reg={reg.id} section={s.section_id} onOpen={onOpenCitation} /></td>
                      <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{s.label}</td>
                      <td className="num">{mapped.length} / {s.expected_controls}</td>
                      <td>
                        <div className="row" style={{ gap: 8 }}>
                          <div className="bar" style={{ width: 100 }}>
                            <i style={{ width: `${Math.min(coverage, 100)}%`, background: tone }} />
                          </div>
                          <span className="num" style={{ fontSize: 12 }}>{coverage}%</span>
                        </div>
                      </td>
                      <td>
                        {sIssues.length === 0
                          ? <span className="muted">—</span>
                          : <span className="num" style={{ color: 'var(--high)' }}>{sIssues.length}</span>}
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
}
