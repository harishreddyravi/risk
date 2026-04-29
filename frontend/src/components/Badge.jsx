import React from 'react';

const COLORS = {
  Critical: { bg: '#450a0a', color: '#fca5a5', border: '#7f1d1d' },
  High:     { bg: '#431407', color: '#fdba74', border: '#7c2d12' },
  Medium:   { bg: '#422006', color: '#fcd34d', border: '#78350f' },
  Low:      { bg: '#052e16', color: '#86efac', border: '#14532d' },
  Active:   { bg: '#0c1a2e', color: '#7dd3fc', border: '#0c4a6e' },
  Retired:  { bg: '#1e1b4b', color: '#a5b4fc', border: '#3730a3' },
  'Under Review': { bg: '#1c1917', color: '#d6d3d1', border: '#44403c' },
  Effective:            { bg: '#052e16', color: '#86efac', border: '#14532d' },
  'Partially Effective':{ bg: '#422006', color: '#fcd34d', border: '#78350f' },
  Ineffective:          { bg: '#450a0a', color: '#fca5a5', border: '#7f1d1d' },
  'Not Tested':         { bg: '#1e1b4b', color: '#a5b4fc', border: '#3730a3' },
  Open:        { bg: '#450a0a', color: '#fca5a5', border: '#7f1d1d' },
  'In Progress':{ bg: '#422006', color: '#fdba74', border: '#7c2d12' },
  Remediated:  { bg: '#052e16', color: '#86efac', border: '#14532d' },
  Accepted:    { bg: '#1c1917', color: '#d6d3d1', border: '#44403c' },
  Closed:      { bg: '#0c1a2e', color: '#7dd3fc', border: '#0c4a6e' },
  Preventive:  { bg: '#0c1a2e', color: '#7dd3fc', border: '#0c4a6e' },
  Detective:   { bg: '#1e1b4b', color: '#a5b4fc', border: '#3730a3' },
  Corrective:  { bg: '#422006', color: '#fcd34d', border: '#78350f' },
};

export default function Badge({ value }) {
  const style = COLORS[value] || { bg: '#1e293b', color: '#94a3b8', border: '#334155' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '.3px',
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      whiteSpace: 'nowrap',
    }}>
      {value}
    </span>
  );
}
