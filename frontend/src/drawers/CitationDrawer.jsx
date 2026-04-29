import React from 'react';
import Icon from '../components/Icon.jsx';
import { SevPill, CoverageRing } from '../components/Primitives.jsx';

export default function CitationDrawer({ reg: regId, section: sectionId, data, onClose, onOpenIssue }) {
  if (!regId) return null;
  const { regulations, controls, issues } = data;
  const reg = regulations.find(r => r.id === regId);
  if (!reg) return null;

  const section = sectionId ? reg.sections?.find(s => s.section_id === sectionId) : null;
  const mapped = controls.filter(c => c.regulation_id === regId && (!sectionId || c.section_id === sectionId));
  const sectionIssues = issues.filter(i => i.regulation_id === regId && (!sectionId || i.section_id === sectionId));
  const coverage = section
    ? Math.round((mapped.length / Math.max(section.expected_controls, 1)) * 100)
    : reg.coverage;

  return (
    <>
      <div className="drawer-mask" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                <span className="tag mono">{regId}</span>
                {sectionId && <span className="tag mono">§{sectionId}</span>}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35 }}>
                {section ? section.label : reg.title}
              </div>
              {section && (
                <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 2 }}>{reg.title}</div>
              )}
            </div>
            <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0 8px', height: 32, flexShrink: 0 }}>
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        <div className="drawer-body">
          {/* Coverage overview */}
          <div className="card">
            <div className="row" style={{ gap: 18 }}>
              <CoverageRing pct={coverage} size={72} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 6 }}>Control Coverage</div>
                <div className="chips">
                  <span className="tag">{mapped.length} controls mapped</span>
                  {section && <span className="tag">{section.expected_controls} expected</span>}
                  <span className="tag" style={{ color: sectionIssues.length > 0 ? 'var(--high)' : 'var(--ink-4)' }}>
                    {sectionIssues.length} open issues
                  </span>
                </div>
                {!section && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-4)' }}>
                    {reg.body} · {reg.sections?.length || 0} chapters
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Requirement text */}
          {section?.description && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 8 }}>Requirement</div>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.65 }}>{section.description}</p>
            </div>
          )}

          {/* Sections list (if no section selected) */}
          {!section && reg.sections?.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--line)' }}>
                <div className="card-title">Chapters ({reg.sections.length})</div>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Topic</th>
                    <th>Coverage</th>
                    <th>Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {reg.sections.map(s => {
                    const sMapped = controls.filter(c => c.regulation_id === regId && c.section_id === s.section_id);
                    const sIss = issues.filter(i => i.regulation_id === regId && i.section_id === s.section_id);
                    const cov = Math.round((sMapped.length / Math.max(s.expected_controls, 1)) * 100);
                    const tone = cov >= 75 ? 'var(--low)' : cov >= 60 ? 'var(--med)' : 'var(--high)';
                    return (
                      <tr key={s.section_id}>
                        <td><span className="tag mono">{s.section_id}</span></td>
                        <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{s.label}</td>
                        <td>
                          <div className="row" style={{ gap: 6 }}>
                            <div className="bar" style={{ width: 70 }}>
                              <i style={{ width: `${Math.min(cov, 100)}%`, background: tone }} />
                            </div>
                            <span className="num" style={{ fontSize: 11, color: tone }}>{cov}%</span>
                          </div>
                        </td>
                        <td className="num" style={{ color: sIss.length > 0 ? 'var(--high)' : 'var(--ink-4)', fontSize: 12 }}>
                          {sIss.length || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Mapped controls */}
          {mapped.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--line)' }}>
                <div className="card-title">Mapped Controls ({mapped.length})</div>
              </div>
              <div className="col" style={{ padding: 12, gap: 8 }}>
                {mapped.map(c => {
                  const tone = c.effectiveness >= 75 ? 'low' : c.effectiveness >= 60 ? 'med' : c.effectiveness >= 45 ? 'high' : 'crit';
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      background: 'var(--bg-sunken)', border: '1px solid var(--line)', borderRadius: 7 }}>
                      <span className="tag mono">{c.id}</span>
                      <span style={{ fontSize: 12.5, color: 'var(--ink-2)', flex: 1,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                      <div className="bar" style={{ width: 60 }}>
                        <i className={tone} style={{ width: `${c.effectiveness}%`,
                          background: `var(--${tone})` }} />
                      </div>
                      <span className="num" style={{ fontSize: 11, color: `var(--${tone})`, width: 32, textAlign: 'right' }}>
                        {c.effectiveness}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Open issues for this citation */}
          {sectionIssues.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--line)' }}>
                <div className="card-title">Open Issues ({sectionIssues.length})</div>
              </div>
              <div className="col" style={{ padding: 12, gap: 8 }}>
                {sectionIssues.map(i => (
                  <div key={i.id}
                    onClick={() => onOpenIssue && onOpenIssue(i)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
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

          {mapped.length === 0 && sectionIssues.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: 'var(--ink-4)', padding: 32, fontSize: 13 }}>
              No controls or issues mapped to this {section ? 'section' : 'framework'} yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
