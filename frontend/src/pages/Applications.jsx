import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { AiSummary, CiteChip, sevColor } from '../components/Primitives.jsx';

const toneOf = (r) => r >= 75 ? 'crit' : r >= 60 ? 'high' : r >= 45 ? 'med' : 'low';

export default function Applications({ data, onOpenApp }) {
  const { applications } = data;
  const [tierFilter, setTierFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = applications
    .filter(a => tierFilter === 'all' || String(a.tier) === tierFilter)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()));

  const worstApp = [...applications].sort((a, b) => b.residual_risk - a.residual_risk)[0];

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Application portfolio</div>
          <h1 className="page-title">Applications · Risk Profiles</h1>
          <div className="page-sub">Tier-0 systems carry the heaviest residual risk. Click any row to see the full multi-axis profile.</div>
        </div>
        <button className="btn"><Icon name="download" size={14} /> Export CSV</button>
      </div>

      {worstApp && (
        <AiSummary>
          <strong>{worstApp.name} ({worstApp.id})</strong> has the highest residual risk score ({worstApp.residual_risk}).
          Inherent risk is elevated and control effectiveness ({worstApp.control_score?.toFixed(1)}/5) is below peer median.
          {worstApp.regs?.includes('FFIEC-IS') && <> Primary gap traceable to <CiteChip reg="FFIEC-IS" section="II.C.8" />.</>}
        </AiSummary>
      )}

      <div className="row" style={{ marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
        <div className="filter-pills" style={{ margin: 0 }}>
          {['all', '0', '1', '2'].map(t => (
            <button key={t} className={`filter-pill ${tierFilter === t ? 'active' : ''}`}
              onClick={() => setTierFilter(t)}>
              {t === 'all' ? `All · ${applications.length}` : `Tier-${t} · ${applications.filter(a => String(a.tier) === t).length}`}
            </button>
          ))}
        </div>
        <input placeholder="Search apps…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 'auto', height: 30, padding: '0 10px', border: '1px solid var(--line)',
            borderRadius: 7, background: 'var(--bg-sunken)', color: 'var(--ink)', fontSize: 13, outline: 'none', width: 220 }} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Application</th>
              <th>Tier</th>
              <th>Owner</th>
              <th>Users</th>
              <th>Inherent</th>
              <th>Residual Risk</th>
              <th>Open Issues</th>
              <th>Frameworks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const tone = toneOf(a.residual_risk);
              return (
                <tr key={a.id} onClick={() => onOpenApp && onOpenApp(a)}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{a.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{a.id}</div>
                  </td>
                  <td><span className="tag">T{a.tier}</span></td>
                  <td style={{ color: 'var(--ink-3)' }}>{a.owner}</td>
                  <td className="num" style={{ color: 'var(--ink-3)' }}>{a.users?.toLocaleString()}</td>
                  <td className="num muted">{a.inherent_risk}</td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <div className={`bar ${tone}`} style={{ width: 90 }}>
                        <i style={{ width: `${a.residual_risk}%` }} />
                      </div>
                      <span className="num" style={{ fontSize: 12, fontWeight: 500, color: sevColor(tone === 'crit' ? 'Critical' : tone === 'high' ? 'High' : tone === 'med' ? 'Medium' : 'Low') }}>
                        {a.residual_risk}
                      </span>
                    </div>
                  </td>
                  <td className="num" style={{ color: a.open_issues > 0 ? 'var(--high)' : 'var(--ink-3)' }}>
                    {a.open_issues}
                  </td>
                  <td>
                    <div className="chips">
                      {(a.regs || []).map(r => <span key={r} className="tag">{r}</span>)}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ink-4)', padding: 32 }}>No applications match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
