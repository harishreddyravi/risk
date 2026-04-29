import React, { useState, useRef, useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import { CiteChip } from '../components/Primitives.jsx';

const SUGGESTIONS = [
  'What are the top 3 risks right now?',
  'Which controls are most deficient?',
  'Summarize third-party risk exposure',
  "What's driving the residual risk score?",
  'Which issues are SLA-breaching soon?',
  'What should I present to the board?',
];

const SCRIPTED = {
  'what are the top 3 risks right now': {
    text: 'Based on the current assessment, the top 3 risks are:',
    items: [
      '1. Third-party SOC2 program decay — 3 vendors overdue for re-assessment, linked to OCC-TPM §Bull-2023-17-B.',
      '2. MFA gaps in core banking — FFIEC-IS §II.C.8 breach risk elevated due to incomplete rollout in RBANK-CORE.',
      '3. Capacity planning failures — 2 incidents in 90 days for RBANK-SWAP exceeding RTO thresholds.',
    ],
    citations: [{ regulation_id: 'OCC-TPM', section_id: 'Bull-2023-17-B' }],
  },
  'which controls are most deficient': {
    text: 'The 3 most deficient controls by effectiveness score:',
    items: [
      '1. TP-001 (Third-Party Risk Assessment) — 41% effectiveness, 3 open issues.',
      '2. OP-002 (Capacity & Performance Management) — 44% effectiveness.',
      '3. AC-003 (Privileged Access Review) — 52% effectiveness, 1 critical issue.',
    ],
    citations: [],
  },
  'summarize third-party risk exposure': {
    text: 'Third-party risk is the primary driver of elevated residual risk this quarter:',
    items: [
      '• 3 critical vendors (Bloomberg, Broadridge, SWIFT) lack current SOC2 Type II reports.',
      '• Control TP-001 is at 41% effectiveness — below the 60% threshold.',
      '• OCC-TPM coverage is 52%, the lowest of all 6 frameworks in scope.',
      '• Recommended action: escalate to CRO and initiate vendor re-tiering.',
    ],
    citations: [{ regulation_id: 'OCC-TPM', section_id: 'Bull-2023-17-B' }],
  },
  'whats driving the residual risk score': {
    text: 'The composite residual risk score of 64 is driven by three compounding factors:',
    items: [
      '• High inherent risk in Tier-0 applications (avg 82/100).',
      '• Below-median control effectiveness — 5 controls under 60%.',
      '• Regulatory coverage gap: OCC-TPM at 52%, CAT at 61%.',
    ],
    citations: [],
  },
  'which issues are sla-breaching soon': {
    text: 'Two issues are approaching SLA breach within the next 30 days:',
    items: [
      '• ISS-2841 (MFA Bypass Vulnerability) — Critical, due in 12 days.',
      '• ISS-2844 (SOC2 Gap — Bloomberg Terminal) — High, due in 28 days.',
    ],
    citations: [],
  },
  'what should i present to the board': {
    text: 'For the board, I recommend a 4-point narrative:',
    items: [
      '1. Residual risk improved 2pts QoQ (MFA rollout), but remains above 60 appetite threshold.',
      '2. Third-party SOC2 decay is the dominant open risk — propose re-tiering 3 vendors.',
      '3. 2 SLA breaches imminent — request emergency remediation budget.',
      '4. Reg. coverage improved to 68% avg; OCC-TPM and CAT remain below target.',
    ],
    citations: [{ regulation_id: 'OCC-TPM', section_id: 'Bull-2023-17-B' }],
  },
};

function matchScript(q) {
  const key = q.toLowerCase().replace(/[?']/g, '').trim();
  return SCRIPTED[key] || null;
}

export default function Copilot({ onClose, data, onOpenCitation }) {
  const [msgs, setMsgs] = useState([
    {
      role: 'bot',
      text: "Hello. I'm your Risk Intelligence Copilot for Atlas Federal Bank. Ask me about your risk posture, controls, issues, or regulatory gaps.",
      items: [],
      citations: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  function send(q) {
    const text = q || input.trim();
    if (!text) return;
    setInput('');
    setMsgs(m => [...m, { role: 'user', text }]);
    setTyping(true);
    setTimeout(() => {
      const script = matchScript(text);
      const reply = script || {
        text: `I don't have a scripted answer for that yet. Based on current data: ${data?.issues?.length || 0} open issues, ${data?.controls?.filter(c => c.status === 'Deficient').length || 0} deficient controls, avg regulatory coverage ${Math.round((data?.regulations || []).reduce((s, r) => s + r.coverage, 0) / Math.max((data?.regulations || []).length, 1))}%.`,
        items: [],
        citations: [],
      };
      setTyping(false);
      setMsgs(m => [...m, { role: 'bot', ...reply }]);
    }, 900);
  }

  return (
    <div className="copilot">
      <div className="copilot-head">
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent-soft)',
          color: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="bot" size={15} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="copilot-title">Risk Copilot</div>
          <div className="copilot-sub">Powered by AI · Atlas Federal Bank</div>
        </div>
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0 6px', height: 28 }}>
          <Icon name="close" size={14} />
        </button>
      </div>

      <div className="copilot-body">
        {msgs.map((m, i) => (
          <div key={i} className={`copilot-msg ${m.role}`}>
            <div>{m.text}</div>
            {m.items?.length > 0 && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {m.items.map((item, j) => (
                  <li key={j} style={{ fontSize: 12.5, lineHeight: 1.5, listStyle: 'none', paddingLeft: 0 }}>{item}</li>
                ))}
              </ul>
            )}
            {m.citations?.length > 0 && (
              <div className="chips" style={{ marginTop: 8 }}>
                {m.citations.map((c, j) => (
                  <CiteChip key={j} reg={c.regulation_id} section={c.section_id} onOpen={onOpenCitation} />
                ))}
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="copilot-msg bot">
            <div className="copilot-typing">
              <i /><i /><i />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="copilot-suggest">
        {SUGGESTIONS.slice(0, 3).map((s, i) => (
          <button key={i} onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <div className="copilot-input">
        <input
          placeholder="Ask about risks, controls, regulations…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="btn btn-primary" style={{ height: 34, padding: '0 14px' }} onClick={() => send()}>
          <Icon name="arrowUp" size={13} />
        </button>
      </div>
    </div>
  );
}
