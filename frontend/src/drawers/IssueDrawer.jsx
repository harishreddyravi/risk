import React from 'react';
import Icon from '../components/Icon.jsx';
import { SevPill, CiteChip } from '../components/Primitives.jsx';

const STATUS_COLOR = {
  'Open': 'var(--crit)',
  'In Progress': 'var(--high)',
  'Remediated': 'var(--low)',
  'Accepted Risk': 'var(--ink-4)',
};

const REMEDIATION_STEPS = {
  Critical: [
    'Escalate to CISO and CRO immediately',
    'Initiate incident response procedure',
    'Implement compensating controls within 48 hours',
    'Schedule emergency board notification if applicable',
    'Document remediation plan with daily checkpoints',
  ],
  High: [
    'Assign remediation owner and set 30-day deadline',
    'Define compensating controls while fix is in progress',
    'Weekly status update to Risk Committee',
    'Validate fix with control testing before closure',
  ],
  Medium: [
    'Assign to control owner for remediation within 60 days',
    'Document remediation plan in issue tracker',
    'Monthly status tracking until resolved',
  ],
  Low: [
    'Schedule for next quarterly remediation cycle',
    'Document accepted risk if remediation deferred',
  ],
};

export default function IssueDrawer({ issue, data, onClose, onOpenCitation }) {
  if (!issue) return null;
  const { controls, regulations } = data;
  const ctrl = controls.find(c => c.id === issue.control_id);
  const reg = regulations.find(r => r.id === issue.regulation_id);
  const steps = REMEDIATION_STEPS[issue.severity] || REMEDIATION_STEPS.Low;

  return (
    <>
      <div className="drawer-mask" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                <span className="tag mono">{issue.id}</span>
                <SevPill level={issue.severity} />
                <span style={{ fontSize: 12, color: STATUS_COLOR[issue.status] || 'var(--ink-3)', fontWeight: 500 }}>
                  {issue.status}
                </span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35 }}>{issue.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 4 }}>
                Owner: {issue.owner} · Age: {issue.aging}d{issue.due_date ? ` · Due: ${issue.due_date}` : ''}
              </div>
            </div>
            <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0 8px', height: 32, flexShrink: 0 }}>
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        <div className="drawer-body">
          {/* Description */}
          {issue.description && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 8 }}>Description</div>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{issue.description}</p>
            </div>
          )}

          {/* Citation */}
          {reg && issue.section_id && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Regulatory Citation</div>
              <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                <CiteChip reg={issue.regulation_id} section={issue.section_id} onOpen={onOpenCitation} />
                <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{reg.title}</span>
              </div>
              {reg.sections?.find(s => s.section_id === issue.section_id)?.label && (
                <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--ink-3)' }}>
                  Section: {reg.sections.find(s => s.section_id === issue.section_id).label}
                </div>
              )}
            </div>
          )}

          {/* Mapped control */}
          {ctrl && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>Mapped Control</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <span className="tag mono">{ctrl.id}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{ctrl.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{ctrl.family}</div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Control Effectiveness</span>
                  <span className="num" style={{ fontSize: 12 }}>{ctrl.effectiveness}%</span>
                </div>
                <div className="bar" style={{ width: '100%' }}>
                  <i style={{ width: `${ctrl.effectiveness}%`,
                    background: ctrl.effectiveness >= 75 ? 'var(--low)' : ctrl.effectiveness >= 60 ? 'var(--med)' : 'var(--crit)' }} />
                </div>
              </div>
            </div>
          )}

          {/* AI Remediation */}
          <div className="card" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
            <div className="row" style={{ gap: 8, marginBottom: 12 }}>
              <Icon name="sparkle" size={14} />
              <div className="card-title" style={{ color: 'var(--accent)' }}>AI-Recommended Remediation</div>
            </div>
            <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {steps.map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>{s}</li>
              ))}
            </ol>
          </div>

          {/* Activity log */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Activity Log</div>
            <div className="col" style={{ gap: 0 }}>
              {[
                { date: issue.created_at || '2026-01-15', actor: 'AI Engine', action: 'Issue auto-detected and created' },
                { date: '2026-02-01', actor: issue.owner, action: 'Assigned as remediation owner' },
                issue.status === 'In Progress' && { date: '2026-03-10', actor: issue.owner, action: 'Remediation work started — compensating control in place' },
                issue.status === 'Remediated' && { date: issue.due_date || '2026-03-20', actor: issue.owner, action: 'Remediation validated and issue closed' },
              ].filter(Boolean).map((e, i) => (
                <div key={i} className="row" style={{ alignItems: 'flex-start', gap: 12, padding: '8px 0',
                  borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-4)', whiteSpace: 'nowrap', paddingTop: 1 }}>{e.date}</span>
                  <div>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)' }}>{e.actor}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}> — {e.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Metadata</div>
            {[
              ['Application', issue.app_id || issue.app_name || '—'],
              ['Source', issue.source || 'AI Assessment'],
              ['Priority', issue.severity],
              ['Due Date', issue.due_date || 'Not set'],
            ].map(([k, v]) => (
              <div key={k} className="row" style={{ justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{k}</span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
