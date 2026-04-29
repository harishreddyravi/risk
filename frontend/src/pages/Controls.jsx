import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { SevPill, CiteChip, AiSummary, sevColor } from '../components/Primitives.jsx';

const STATUS_FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'Effective', label: 'Effective' },
  { id: 'Needs Improvement', label: 'Needs Improvement' },
  { id: 'Deficient', label: 'Deficient' },
];

const toneOf = (eff) =>
  eff >= 75 ? 'low' : eff >= 60 ? 'med' : eff >= 45 ? 'high' : 'crit';

const sevForStatus = (s) =>
  s === 'Deficient' ? 'Critical' : s === 'Needs Improvement' ? 'High' : 'Low';

export default function Controls({ data, onOpenIssue, onOpenCitation, onOpenControl }) {
  const { controls, issues } = data;
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = controls;
    if (filter !== 'all') list = list.filter(c => c.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.family?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [controls, filter, search]);

  const counts = {
    Effective: controls.filter(c => c.status === 'Effective').length,
    'Needs Improvement': controls.filter(c => c.status === 'Needs Improvement').length,
    Deficient: controls.filter(c => c.status === 'Deficient').length,
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Control inventory</div>
          <h1 className="page-title">Controls &amp; Effectiveness</h1>
          <div className="page-sub">Each control is evidence-backed, tied to regulatory citations, and continuously rated by the AI assessment engine.</div>
        </div>
        <button className="btn btn-primary"><Icon name="sparkle" size={14} /> Re-rate all controls</button>
      </div>

      <AiSummary>
        <strong>{counts['Deficient'] + counts['Needs Improvement']} controls</strong> are operating below acceptable thresholds.
        The largest underperformance is in <strong>Third-Party</strong> and <strong>Operations · Capacity</strong> families,
        linked to <strong>{issues.filter(i => i.status !== 'Accepted Risk').length} open issues</strong>.
      </AiSummary>

      <div className="row" style={{ marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
        <div className="filter-pills" style={{ margin: 0 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f.id}
              className={`filter-pill ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}>
              {f.label}{f.id !== 'all' && ` · ${counts[f.id] ?? 0}`}
            </button>
          ))}
        </div>
        <input placeholder="Search controls…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 'auto', height: 30, padding: '0 10px', border: '1px solid var(--line)',
            borderRadius: 7, background: 'var(--bg-sunken)', color: 'var(--ink)', fontSize: 13, outline: 'none', width: 220 }} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 88 }}>Control</th>
              <th>Name</th>
              <th>Family</th>
              <th>Citation</th>
              <th>Apps</th>
              <th>Effectiveness</th>
              <th>Status</th>
              <th>Last Tested</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const ctlIssues = issues.filter(i => i.control_id === c.id);
              const tone = toneOf(c.effectiveness);
              return (
                <tr key={c.id} onClick={() => onOpenControl && onOpenControl(c)}>
                  <td><span className="tag">{c.id}</span></td>
                  <td style={{ color: 'var(--ink)', fontWeight: 500 }}>
                    {c.name}
                    {ctlIssues.length > 0 && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--high)', cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); onOpenIssue && onOpenIssue(ctlIssues[0]); }}>
                        · {ctlIssues.length} issue{ctlIssues.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--ink-3)' }}>{c.family}</td>
                  <td>
                    {c.regulation_id && c.section_id
                      ? <CiteChip reg={c.regulation_id} section={c.section_id} onOpen={onOpenCitation} />
                      : <span className="muted">—</span>}
                  </td>
                  <td className="num" style={{ color: 'var(--ink-3)' }}>{c.apps_count || '—'}</td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <div className={`bar ${tone}`} style={{ width: 90 }}>
                        <i style={{ width: `${c.effectiveness}%` }} />
                      </div>
                      <span className="num" style={{ fontSize: 12, color: sevColor(tone === 'crit' ? 'Critical' : tone === 'high' ? 'High' : tone === 'med' ? 'Medium' : 'Low') }}>
                        {c.effectiveness}
                      </span>
                    </div>
                  </td>
                  <td>
                    <SevPill level={sevForStatus(c.status)} />
                    <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--ink-3)' }}>{c.status}</span>
                  </td>
                  <td className="num muted" style={{ fontSize: 12 }}>{c.last_tested || '—'}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ink-4)', padding: 32 }}>No controls match the current filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
