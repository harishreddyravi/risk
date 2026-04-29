import React from 'react';
import { sevColor } from './Primitives.jsx';

export function TrendChart({ data, threshold }) {
  const w = 640, h = 210, pad = { l: 38, r: 16, t: 14, b: 26 };
  const min = 0, max = 100;
  const x = (i) => pad.l + (i / (data.length - 1)) * (w - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);
  const linePts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
  const areaPts = `${x(0)},${h - pad.b} ${linePts} ${x(data.length - 1)},${h - pad.b}`;
  const ticks = [0, 25, 50, 75, 100];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {ticks.map(t => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)}
            stroke="var(--line)" strokeDasharray="2 4" />
          <text x={pad.l - 6} y={y(t) + 4} textAnchor="end"
            fontSize="10" fill="var(--ink-4)" fontVariantNumeric="tabular-nums">{t}</text>
        </g>
      ))}
      {threshold != null && (
        <g>
          <line x1={pad.l} x2={w - pad.r} y1={y(threshold)} y2={y(threshold)}
            stroke="var(--crit)" strokeDasharray="5 4" strokeWidth="1.2" />
          <text x={w - pad.r - 2} y={y(threshold) - 5} textAnchor="end"
            fontSize="10" fill="var(--crit)">Appetite · {threshold}</text>
        </g>
      )}
      <polygon points={areaPts} fill="var(--accent)" fillOpacity="0.09" />
      <polyline points={linePts} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r={i === data.length - 1 ? 4 : 2.5}
            fill="var(--bg-elev)" stroke="var(--accent)" strokeWidth="2" />
          <text x={x(i)} y={h - 7} textAnchor="middle" fontSize="10" fill="var(--ink-4)">{d.month.slice(0, 3)}</text>
        </g>
      ))}
    </svg>
  );
}

export function Heatmap({ apps, onCellClick }) {
  const cells = {};
  apps.forEach(a => {
    const k = `${a.likelihood}-${a.impact}`;
    cells[k] = (cells[k] || []).concat(a);
  });
  const bg = (l, i) => {
    const s = (l + i) / 2;
    if (s >= 4) return 'var(--crit-soft)';
    if (s >= 3) return 'var(--high-soft)';
    if (s >= 2.5) return 'var(--med-soft)';
    return 'var(--low-soft)';
  };
  const ink = (l, i) => {
    const s = (l + i) / 2;
    if (s >= 4) return 'var(--crit)';
    if (s >= 3) return 'var(--high)';
    if (s >= 2.5) return 'var(--med)';
    return 'var(--low)';
  };
  const rows = [5, 4, 3, 2, 1];
  const cellSize = 48;
  const axisW = 24;
  const totalW = axisW + cellSize * 5;
  const totalH = cellSize * 5 + axisW;
  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${totalH}`} style={{ display: 'block' }}>
      {/* impact axis labels (left) */}
      {rows.map((impact, ri) => (
        <text key={impact} x={axisW - 4} y={ri * cellSize + cellSize / 2 + 4}
          textAnchor="end" fontSize="10" fill="var(--ink-4)" fontVariantNumeric="tabular-nums">{impact}</text>
      ))}
      {/* likelihood axis labels (bottom) */}
      {[1,2,3,4,5].map((lik, li) => (
        <text key={lik} x={axisW + li * cellSize + cellSize / 2} y={totalH - 4}
          textAnchor="middle" fontSize="10" fill="var(--ink-4)" fontVariantNumeric="tabular-nums">{lik}</text>
      ))}
      {rows.map((impact, ri) =>
        [1,2,3,4,5].map((lik, li) => {
          const list = cells[`${lik}-${impact}`] || [];
          const cx = axisW + li * cellSize;
          const cy = ri * cellSize;
          return (
            <g key={`${lik}-${impact}`} onClick={() => list.length && onCellClick && onCellClick(list[0])}
              style={{ cursor: list.length ? 'pointer' : 'default' }}>
              <rect x={cx + 2} y={cy + 2} width={cellSize - 4} height={cellSize - 4}
                rx="5" fill={bg(lik, impact)} />
              {list.length > 0 && (
                <text x={cx + cellSize / 2} y={cy + cellSize / 2 + 5}
                  textAnchor="middle" fontSize="13" fontWeight="600"
                  fill={ink(lik, impact)} fontVariantNumeric="tabular-nums">{list.length}</text>
              )}
            </g>
          );
        })
      )}
      <text x={axisW + cellSize * 2.5} y={totalH - 4} textAnchor="middle"
        fontSize="9" fill="var(--ink-4)" letterSpacing=".05em" textTransform="uppercase">LIKELIHOOD →</text>
    </svg>
  );
}

export function RadarChart({ axes, values, benchmark, size = 280 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 38;
  const n = axes.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (v, i) => {
    const rad = (v / 5) * r;
    return [cx + Math.cos(angle(i)) * rad, cy + Math.sin(angle(i)) * rad];
  };
  const poly = (vals) => vals.map((v, i) => pt(v, i).join(',')).join(' ');
  const grids = [1, 2, 3, 4, 5];
  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {grids.map(g => (
        <polygon key={g}
          points={Array.from({ length: n }).map((_, i) => pt(g, i).join(',')).join(' ')}
          fill="none" stroke="var(--line)" />
      ))}
      {axes.map((a, i) => {
        const [x2, y2] = pt(5, i);
        const [lx, ly] = pt(5.9, i);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="var(--line)" />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="10.5" fill="var(--ink-3)">{a}</text>
          </g>
        );
      })}
      {benchmark && (
        <polygon points={poly(benchmark)} fill="var(--ink-3)" fillOpacity=".06"
          stroke="var(--ink-3)" strokeDasharray="3 3" strokeWidth="1" />
      )}
      <polygon points={poly(values)} fill="var(--accent)" fillOpacity=".18"
        stroke="var(--accent)" strokeWidth="1.5" />
      {values.map((v, i) => {
        const [px, py] = pt(v, i);
        return <circle key={i} cx={px} cy={py} r="3" fill="var(--accent)" />;
      })}
      {grids.map(g => {
        const [, gy] = pt(g, 0);
        return <text key={g} x={cx + 5} y={gy + 3} fontSize="9" fill="var(--ink-4)">{g}</text>;
      })}
    </svg>
  );
}

export function SankeyMini({ regulations, controls, issues }) {
  const w = 720, h = 310;
  const colW = 130;
  const xCol = [30, (w - colW) / 2, w - 165];
  const usable = h - 40;

  const families = [...new Set(controls.map(c => c.family))];
  const sevs = ['Critical', 'High', 'Medium'];

  const regH = regulations.map(r => ({ reg: r, count: Math.max(controls.filter(c => c.regulation_id === r.id).length, 1) }));
  const totalR = regH.reduce((s, x) => s + x.count, 0);
  const famH = families.map(f => ({ family: f, count: controls.filter(c => c.family === f).length }));
  const totalF = famH.reduce((s, x) => s + x.count, 0);
  const sevH = sevs.map(s => ({ sev: s, count: issues.filter(i => i.severity === s).length || 1 }));
  const totalS = sevH.reduce((s, x) => s + x.count, 0);

  let yR = 20;
  const regPos = regH.map(rh => { const y = yR; const ht = (rh.count / totalR) * usable; yR += ht + 4; return { ...rh, y, h: ht }; });
  let yF = 20;
  const famPos = famH.map(fh => { const y = yF; const ht = (fh.count / totalF) * usable; yF += ht + 4; return { ...fh, y, h: ht }; });
  let yS = 20;
  const sevPos = sevH.map(sh => { const y = yS; const ht = (sh.count / totalS) * usable; yS += ht + 4; return { ...sh, y, h: ht }; });

  const pathD = (l) => {
    const mx = (l.x1 + l.x2) / 2;
    return `M${l.x1},${l.y1A} C${mx},${l.y1A} ${mx},${l.y2A} ${l.x2},${l.y2A} L${l.x2},${l.y2B} C${mx},${l.y2B} ${mx},${l.y1B} ${l.x1},${l.y1B} Z`;
  };

  const links1 = [];
  regPos.forEach(rp => {
    const fams = [...new Set(controls.filter(c => c.regulation_id === rp.reg.id).map(c => c.family))];
    let yA = rp.y;
    fams.forEach(fn => {
      const fp = famPos.find(f => f.family === fn);
      if (!fp) return;
      const cnt = controls.filter(c => c.regulation_id === rp.reg.id && c.family === fn).length;
      const ht = (cnt / rp.count) * rp.h;
      links1.push({ x1: xCol[0] + colW, y1A: yA, y1B: yA + ht, x2: xCol[1], y2A: fp.y, y2B: fp.y + ht });
      yA += ht;
    });
  });

  const links2 = [];
  famPos.forEach(fp => {
    let yA = fp.y;
    sevPos.forEach(sp => {
      const ht = fp.h / 3 - 1;
      links2.push({ x1: xCol[1] + colW, y1A: yA, y1B: yA + ht, x2: xCol[2], y2A: sp.y, y2B: sp.y + sp.h });
      yA += ht;
    });
  });

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <text x={xCol[0]} y={13} fontSize="10" fill="var(--ink-4)" letterSpacing=".07em">REGULATION</text>
      <text x={xCol[1]} y={13} fontSize="10" fill="var(--ink-4)" letterSpacing=".07em">CONTROL FAMILY</text>
      <text x={xCol[2]} y={13} fontSize="10" fill="var(--ink-4)" letterSpacing=".07em">OPEN ISSUES</text>

      {links1.map((l, i) => <path key={`l1-${i}`} d={pathD(l)} fill="var(--accent)" fillOpacity=".15" />)}
      {links2.map((l, i) => <path key={`l2-${i}`} d={pathD(l)} fill="var(--accent)" fillOpacity=".08" />)}

      {regPos.map((r, i) => (
        <g key={i}>
          <rect x={xCol[0]} y={r.y} width={colW} height={Math.max(r.h, 1)} rx="3"
            fill="var(--bg-sunken)" stroke="var(--line)" />
          {r.h > 14 && <text x={xCol[0] + 7} y={r.y + 14} fontSize="10" fill="var(--ink-2)" fontWeight="500">{r.reg.id}</text>}
          {r.h > 26 && <text x={xCol[0] + 7} y={r.y + 26} fontSize="9" fill="var(--ink-4)">{r.reg.body}</text>}
        </g>
      ))}
      {famPos.map((f, i) => (
        <g key={i}>
          <rect x={xCol[1]} y={f.y} width={colW} height={Math.max(f.h, 1)} rx="3"
            fill="var(--bg-sunken)" stroke="var(--line)" />
          {f.h > 14 && <text x={xCol[1] + 7} y={f.y + 14} fontSize="10" fill="var(--ink-2)">{f.family}</text>}
        </g>
      ))}
      {sevPos.map((s, i) => (
        <g key={i}>
          <rect x={xCol[2]} y={s.y} width={colW} height={Math.max(s.h, 1)} rx="3"
            fill={sevColor(s.sev)} fillOpacity=".13"
            stroke={sevColor(s.sev)} strokeOpacity=".4" />
          {s.h > 14 && (
            <text x={xCol[2] + 10} y={s.y + 14} fontSize="10.5"
              fill={sevColor(s.sev)} fontWeight="600">{s.sev} · {s.count}</text>
          )}
        </g>
      ))}
    </svg>
  );
}
