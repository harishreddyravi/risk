import React from 'react';

const s = {
  wrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13.5 },
  th: { textAlign: 'left', padding: '10px 14px', color: '#64748b', fontWeight: 600, fontSize: 11.5, letterSpacing: '.5px', textTransform: 'uppercase', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderBottom: '1px solid #1a2234', color: '#cbd5e1', verticalAlign: 'top' },
  tr: { cursor: 'pointer', transition: 'background .1s' },
};

export default function Table({ columns, rows, onRowClick }) {
  return (
    <div style={s.wrap}>
      <table style={s.table}>
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key} style={s.th}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{ ...s.td, textAlign: 'center', color: '#475569', padding: 32 }}>No records found</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={row.id ?? i} style={s.tr}
              onClick={() => onRowClick && onRowClick(row)}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#161b27'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              {columns.map((c) => (
                <td key={c.key} style={{ ...s.td, ...(c.style || {}) }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
