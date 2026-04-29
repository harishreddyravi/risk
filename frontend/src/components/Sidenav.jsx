import React from 'react';
import Icon from './Icon.jsx';

export default function Sidenav({ view, setView, counts }) {
  const nav = [
    { id: 'dashboard',    icon: 'dashboard', label: 'Executive Dashboard' },
    { id: 'regulations',  icon: 'book',      label: 'Regulation Explorer', count: counts.regs },
    { id: 'controls',     icon: 'shield',    label: 'Control Inventory',   count: counts.controls },
    { id: 'applications', icon: 'layers',    label: 'Applications',        count: counts.apps },
    { id: 'issues',       icon: 'flag',      label: 'Issues',              count: counts.issues },
  ];
  return (
    <nav className="sidenav">
      <div className="sidenav-group">Workspace</div>
      {nav.map(it => (
        <div key={it.id}
          className={`nav-item ${view === it.id ? 'active' : ''}`}
          onClick={() => setView(it.id)}>
          <Icon name={it.icon} size={15} />
          <span>{it.label}</span>
          {it.count != null && <span className="nav-count num">{it.count}</span>}
        </div>
      ))}

      <div className="sidenav-group">AI</div>
      <div className={`nav-item ${view === 'findings' ? 'active' : ''}`} onClick={() => setView('findings')}>
        <Icon name="sparkle" size={15} /><span>AI Findings</span>
        <span className="nav-count num">{counts.findings ?? 3}</span>
      </div>
      <div className="nav-item"><Icon name="trend" size={15} /><span>Run assessment</span></div>

      <div className="sidenav-group">Reports</div>
      <div className="nav-item"><Icon name="download" size={15} /><span>OCC Submission Draft</span></div>
    </nav>
  );
}
