import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { SevPill, CiteChip, AiSummary } from '../components/Primitives.jsx';

const SEV_ORDER = { Critical: 1, High: 2, Medium: 3, Low: 4 };

export default function Issues({ data, onOpenIssue, onOpenCitation }) {
  const { issues } = data;
  const [sevFilter, setSevFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = issues;
    if (sevFilter !== 'all')    list = list.filter(i => i.severity === sevFilter);
    if (statusFilter !== 'all') list = list.filter(i => i.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9) || b.aging - a.aging);
  }, [issues, sevFilter, statusFilter, search]);

  const openCount   = issues.filter(i => i.status !== 'Accepted Risk').length;
  const critCount   = issues.filter(i => i.severity === 'Critical').length;
  const avgAge      = Math.round(issues.filter(i => !['Accepted Risk'].includes(i.status)).reduce((s, i) => s + i.aging, 0) / Math.max(openCount, 1));
  const statuses    = [...new Set(issues.map(i => i.status))];
  const severities  = ['Critical', 'High', 'Medium', 'Low'];

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Issue tracker</div>
          <h1 className="page-title">Findings &amp; Issues</h1>
          <div className="page-sub">Issues raised by audit, control testing, and the AI assessment engine — each carries a regulatory citation and proposed remediation.</div>
        </div>
        <button className="btn btn-primary"><Icon name="plus" size={14} /> Log issue</button>
      </div>

      <AiSummary>
        <strong>{critCount} critical</strong>, <strong>{issues.filter(i => i.severity === 'High').length} high</strong>, and{' '}
        <strong>{issues.filter(i => i.severity === 'Medium').length} medium</strong> issues are open.
        Mean age of open items is <strong>{avgAge} days</strong>; SLA breach risk on 2 items in the next 30 days.
      </AiSummary>

      <div className="row" style={{ marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
        <div className="filter-pills" style={{ margin: 0 }}>
          <button className={`filter-pill ${sevFilter === 'all' ? 'active' : ''}`} onClick={() => setSevFilter('all')}>
            All · {issues.length}
          </button>
          {severities.map(s => {
            const cnt = issues.filter(i => i.severity === s).length;
            if (!cnt) return null;
            return (
              <button key={s} className={`filter-pill ${sevFilter === s ? 'active' : ''}`}
                onClick={() => setSevFilter(s)}>{s} · {cnt}</button>
            );
          })}
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ height: 30, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 7,
            background: 'var(--bg-elev)', color: 'var(--ink)', fontSize: 12.5, outline: 'none' }}>
          <option value="all">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ height: 30, padding: '0 10px', border: '1px solid var(--line)', borderRadius: 7,
            background: 'var(--bg-sunken)', color: 'var(--ink)', fontSize: 13, outline: 'none', width: 200 }} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 86 }}>ID</th>
              <th style={{ width: 96 }}>Severity</th>
              <th>Title</th>
              <th>Citation</th>
              <th>App</th>
              <th>Owner</th>
              <th style={{ width: 68 }}>Aging</th>
              <th>Status</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} onClick={() => onOpenIssue && onOpenIssue(i)}>
                <td><span className="tag">{i.id}</span></td>
                <td><SevPill level={i.severity} /></td>
                <td style={{ color: 'var(--ink)', fontWeight: 500, maxWidth: 320 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.title}</div>
                </td>
                <td>
                  {i.regulation_id
                    ? <CiteChip reg={i.regulation_id} section={i.section_id} onOpen={onOpenCitation} />
                    : <span className="muted">—</span>}
                </td>
                <td style={{ color: 'var(--ink-3)', fontSize: 12 }}>{i.app_id || i.app_name || '—'}</td>
                <td style={{ color: 'var(--ink-3)' }}>{i.owner}</td>
                <td className="num" style={{ color: i.aging > 60 ? 'var(--high)' : i.aging > 30 ? 'var(--med)' : 'var(--ink-3)' }}>
                  {i.aging}d
                </td>
                <td>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{i.status}</span>
                </td>
                <td className="num" style={{ fontSize: 12, color: 'var(--ink-4)' }}>{i.due_date || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--ink-4)', padding: 32 }}>No issues match the current filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
