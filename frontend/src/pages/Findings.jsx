import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { SevPill, CiteChip, AiSummary } from '../components/Primitives.jsx';

const CONF_COLOR = (c) => c >= 0.9 ? 'var(--low)' : c >= 0.75 ? 'var(--med)' : 'var(--high)';

const RECS = {
  Critical: 'Escalate to CRO and CISO immediately. Implement compensating controls within 48 hours. Initiate board notification procedures.',
  High: 'Assign a remediation owner and define a 30-day action plan. Implement compensating controls and report weekly to the Risk Committee.',
  Medium: 'Assign to the relevant control owner for remediation within 60 days. Document the plan and track monthly.',
  Low: 'Include in the next quarterly remediation cycle. Accept risk formally if deferring.',
};

export default function Findings({ data, onOpenCitation, onOpenIssue }) {
  const { findings, issues } = data;
  const [sevFilter, setSevFilter] = useState('all');

  const severities = ['Critical', 'High', 'Medium', 'Low'];
  const filtered = sevFilter === 'all' ? findings : findings.filter(f => f.severity === sevFilter);

  function linkedIssues(f) {
    if (!f.citations?.length) return [];
    return issues.filter(i =>
      f.citations.some(c => c.regulation_id === i.regulation_id && c.section_id === i.section_id)
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">AI Assessment Engine</div>
          <h1 className="page-title">AI Findings</h1>
          <div className="page-sub">
            Auto-generated findings from continuous control monitoring and regulatory gap analysis. Each finding is traceable to a regulation section and open issues.
          </div>
        </div>
        <button className="btn btn-primary"><Icon name="sparkle" size={14} /> Re-run assessment</button>
      </div>

      <AiSummary>
        <strong>{findings.filter(f => f.severity === 'Critical').length} critical</strong> and{' '}
        <strong>{findings.filter(f => f.severity === 'High').length} high</strong> findings detected this cycle.
        Average confidence is <strong>{Math.round(findings.reduce((s, f) => s + f.confidence, 0) / Math.max(findings.length, 1) * 100)}%</strong>.
        Top risk area: <strong>Third-Party Management</strong> with 3 compounding control gaps.
      </AiSummary>

      <div className="filter-pills" style={{ marginBottom: 20 }}>
        <button className={`filter-pill ${sevFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSevFilter('all')}>All · {findings.length}</button>
        {severities.map(s => {
          const cnt = findings.filter(f => f.severity === s).length;
          if (!cnt) return null;
          return (
            <button key={s} className={`filter-pill ${sevFilter === s ? 'active' : ''}`}
              onClick={() => setSevFilter(s)}>{s} · {cnt}</button>
          );
        })}
      </div>

      <div className="col" style={{ gap: 14 }}>
        {filtered.map(f => {
          const linked = linkedIssues(f);
          return (
            <div key={f.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header strip */}
              <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--line)', background: 'var(--bg-elev)' }}>
                <div className="row" style={{ marginBottom: 8, justifyContent: 'space-between' }}>
                  <div className="row" style={{ gap: 10 }}>
                    <SevPill level={f.severity} />
                    <span className="tag mono">{f.id}</span>
                  </div>
                  <div className="row" style={{ gap: 12 }}>
                    <span style={{ fontSize: 12, color: CONF_COLOR(f.confidence) }}>
                      Confidence {Math.round(f.confidence * 100)}%
                    </span>
                    <span className="muted" style={{ fontSize: 11 }}>Auto-generated</span>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>{f.headline}</div>
              </div>

              {/* Body */}
              <div style={{ padding: '14px 18px' }}>
                {f.detail && (
                  <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 14px' }}>{f.detail}</p>
                )}

                {/* Citations */}
                {(f.citations || []).length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div className="card-title" style={{ marginBottom: 8 }}>Regulatory Citations</div>
                    <div className="chips">
                      {f.citations.map((c, i) => (
                        <CiteChip key={i} reg={c.regulation_id} section={c.section_id} onOpen={onOpenCitation} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked issues */}
                {linked.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div className="card-title" style={{ marginBottom: 8 }}>Linked Issues ({linked.length})</div>
                    <div className="col" style={{ gap: 6 }}>
                      {linked.map(i => (
                        <div key={i.id}
                          onClick={() => onOpenIssue && onOpenIssue(i)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 11px',
                            background: 'var(--bg-sunken)', border: '1px solid var(--line)', borderRadius: 7, cursor: 'pointer' }}>
                          <SevPill level={i.severity} />
                          <span className="tag mono">{i.id}</span>
                          <span style={{ fontSize: 12.5, color: 'var(--ink-2)', flex: 1,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.title}</span>
                          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{i.aging}d</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div style={{ padding: '10px 14px', background: 'var(--accent-soft)',
                  border: '1px solid var(--accent)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    AI Recommendation
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                    {RECS[f.severity] || RECS.Low}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--ink-4)', padding: 48 }}>
            No findings match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
