import React from 'react';
import Icon from './Icon.jsx';

export const sevClass = (s) =>
  ({ Critical: 'crit', High: 'high', Medium: 'med', Low: 'low' }[s] || 'low');

export const sevColor = (s) =>
  ({ Critical: 'var(--crit)', High: 'var(--high)', Medium: 'var(--med)', Low: 'var(--low)' }[s] || 'var(--low)');

export function SevPill({ level }) {
  return (
    <span className={`sev ${sevClass(level)}`}>
      <span className="dot" />{level}
    </span>
  );
}

export function CiteChip({ reg, section, onOpen }) {
  return (
    <span className="cite-chip" onClick={(e) => { e.stopPropagation(); onOpen && onOpen(reg, section); }}>
      <Icon name="cite" size={10} />
      <strong>{reg}</strong>
      <span>§{section}</span>
    </span>
  );
}

export function AiSummary({ children, confidence, ts = 'Updated 2 min ago' }) {
  return (
    <div className="ai-summary">
      <div className="ai-icon"><Icon name="sparkle" size={13} /></div>
      <div className="ai-body">{children}</div>
      <div className="ai-meta">
        <div>{ts}</div>
        {confidence != null && <div className="num">Conf {Math.round(confidence * 100)}%</div>}
      </div>
    </div>
  );
}

export function Sparkline({ values, w = 80, h = 24, color }) {
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) =>
    `${(i / (values.length - 1)) * w},${h - ((v - min) / span) * (h - 2) - 1}`
  ).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}
      style={{ color: color || 'var(--ink-3)', display: 'inline-block', verticalAlign: 'middle' }}>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

export function CoverageRing({ pct, size = 64 }) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  const tone = pct >= 75 ? 'var(--low)' : pct >= 60 ? 'var(--med)' : pct >= 45 ? 'var(--high)' : 'var(--crit)';
  return (
    <svg className="ring-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} strokeWidth="7" stroke="var(--bg-sunken)" fill="none" />
      <circle cx={size/2} cy={size/2} r={r} strokeWidth="7" fill="none"
        stroke={tone} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset .4s' }} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle"
        fontSize="12" fontWeight="600" fill="var(--ink)"
        fontFamily="ui-monospace, monospace">{pct}%</text>
    </svg>
  );
}
