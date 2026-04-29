import React from 'react';
import Icon from './Icon.jsx';

export default function Topbar({ copilotOn, setCopilotOn, onSearch }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">R</div>
        <span>Risk Intelligence</span>
        <span className="brand-sub">· Atlas Federal Bank</span>
      </div>

      <input className="topbar-search" placeholder="Search regulations, controls, apps, issues…"
        onChange={e => onSearch && onSearch(e.target.value)} />

      <div className="topbar-spacer" />

      <button className={`copilot-btn ${copilotOn ? 'active' : ''}`}
        onClick={() => setCopilotOn(v => !v)}>
        <Icon name="bot" size={14} /> Copilot
      </button>
    </header>
  );
}
