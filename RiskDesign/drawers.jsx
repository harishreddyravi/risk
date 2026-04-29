(() => {
/* global React, RiskUI */
const { useState, useEffect, useRef } = React;
const { Icon, SevPill, CiteChip, RadarChart, AiSummary, sevColor } = RiskUI;

/* ============================== APP DRAWER ============================== */
const AppDrawer = ({ app, data, onClose, onOpenIssue, onOpenCitation }) => {
  const { CONTROLS, ISSUES, REGULATIONS } = data;
  const issues = ISSUES.filter(i => i.app === app.id || (i.app === "Multiple" && app.regs.includes(i.regulation)));
  return (
    <>
      <div className="drawer-mask" onClick={onClose}/>
      <aside className="drawer">
        <div className="drawer-head">
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="tag">{app.id}</span>
            <span className="tag">Tier {app.tier}</span>
            <button className="btn-ghost btn" style={{ marginLeft: "auto", height: 28 }} onClick={onClose}>
              <Icon name="close" size={14}/>
            </button>
          </div>
          <h2 style={{ margin: 0, fontSize: 22, letterSpacing: "-0.015em", fontWeight: 600 }}>{app.name}</h2>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>Owner: {app.owner} · {app.users.toLocaleString()} users</div>
        </div>
        <div className="drawer-body">
          <AiSummary>
            Residual risk <strong>{app.residual}</strong> places this in the top quartile of your portfolio. Primary driver is <strong>control effectiveness</strong> ({(app.control).toFixed(1)}/5) — below peer median. Recommended: prioritize the {issues.length > 0 ? "open finding" + (issues.length > 1 ? "s" : "") + " below" : "annual control re-test"}.
          </AiSummary>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div className="card">
              <div className="card-head"><div className="card-title">Risk Profile</div></div>
              <RadarChart
                axes={["Likelihood", "Impact", "Control", "Regulatory"]}
                values={[app.likelihood, app.impact, app.control, app.regulatory]}
                size={240}/>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">Inherent → Residual</div></div>
              <div style={{ marginTop: 8 }}>
                <div className="muted" style={{ fontSize: 11, marginBottom: 4 }}>Inherent</div>
                <div className="row" style={{ gap: 8, marginBottom: 12 }}>
                  <div className="bar high" style={{ flex: 1 }}><i style={{ width: `${app.inherent}%` }}/></div>
                  <span className="num" style={{ fontSize: 18, fontWeight: 500, minWidth: 36, textAlign: "right" }}>{app.inherent}</span>
                </div>
                <div className="muted" style={{ fontSize: 11, marginBottom: 4 }}>Residual (after controls)</div>
                <div className="row" style={{ gap: 8 }}>
                  <div className="bar crit" style={{ flex: 1 }}><i style={{ width: `${app.residual}%` }}/></div>
                  <span className="num" style={{ fontSize: 18, fontWeight: 500, minWidth: 36, textAlign: "right" }}>{app.residual}</span>
                </div>
                <div className="divider"/>
                <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>Frameworks in scope</div>
                <div className="chips">
                  {app.regs.map(r => <span key={r} className="tag">{r}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-head"><div className="card-title">Open issues</div></div>
            {issues.length === 0
              ? <div className="muted" style={{ fontSize: 13 }}>No open findings. Last assessment passed on Apr 12.</div>
              : (
                <div className="col" style={{ gap: 10 }}>
                  {issues.map(i => (
                    <div key={i.id} onClick={() => onOpenIssue(i)} style={{
                      padding: 12, border: "1px solid var(--line)", borderRadius: 8, cursor: "pointer", background: "var(--bg)"
                    }}>
                      <div className="row" style={{ marginBottom: 6, gap: 8 }}>
                        <SevPill level={i.severity}/>
                        <span className="tag">{i.id}</span>
                        <span className="right muted num" style={{ fontSize: 11 }}>{i.aging} days open</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{i.title}</div>
                      <div className="row" style={{ marginTop: 8, gap: 8 }}>
                        <CiteChip reg={i.regulation} section={i.section} onOpen={onOpenCitation}/>
                        <span className="muted" style={{ fontSize: 11 }}>· {i.owner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </aside>
    </>
  );
};

/* ============================== ISSUE DRAWER ============================== */
const IssueDrawer = ({ issue, data, onClose, onOpenCitation }) => {
  const { CONTROLS } = data;
  const control = CONTROLS.find(c => c.id === issue.control);

  return (
    <>
      <div className="drawer-mask" onClick={onClose}/>
      <aside className="drawer">
        <div className="drawer-head">
          <div className="row" style={{ marginBottom: 8 }}>
            <SevPill level={issue.severity}/>
            <span className="tag">{issue.id}</span>
            <span className="muted" style={{ fontSize: 12 }}>{issue.status}</span>
            <button className="btn-ghost btn" style={{ marginLeft: "auto", height: 28 }} onClick={onClose}>
              <Icon name="close" size={14}/>
            </button>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-0.01em", fontWeight: 600, lineHeight: 1.3 }}>{issue.title}</h2>
        </div>
        <div className="drawer-body">
          <AiSummary confidence={issue.aiConfidence}>
            This finding was generated automatically from continuous control monitoring. The AI matched evidence drift against the control's expected operating parameters and produced a remediation plan.
          </AiSummary>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div className="card">
              <div className="card-head"><div className="card-title">Mapped Control</div></div>
              {control ? (
                <>
                  <div className="row" style={{ marginBottom: 6 }}>
                    <span className="tag">{control.id}</span>
                    <span className="num" style={{ fontSize: 12, color: control.effectiveness < 60 ? "var(--high)" : "var(--ink-2)" }}>
                      Effectiveness {control.effectiveness}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 500 }}>{control.name}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{control.family} · last tested {control.lastTested}</div>
                </>
              ) : <span className="muted">Unmapped</span>}
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">Regulatory Citation</div></div>
              <CiteChip reg={issue.regulation} section={issue.section} onOpen={onOpenCitation}/>
              <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Owner: <span className="ink">{issue.owner}</span></div>
              <div className="muted" style={{ fontSize: 12 }}>Due: <span className="ink num">{issue.due}</span></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-head"><div className="card-title">AI Recommendation</div></div>
            <ol style={{ margin: 0, paddingLeft: 18, color: "var(--ink-2)", fontSize: 13.5, lineHeight: 1.6 }}>
              <li>Re-tier affected scope and freeze net-new dependencies for 30 days.</li>
              <li>Reach out to control owner to validate detection telemetry and evidence cadence.</li>
              <li>Schedule independent re-test with 2nd-line risk within the SLA window.</li>
              <li>Update risk register and route to the appropriate governance committee for sign-off.</li>
            </ol>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Activity</div></div>
            <div className="col" style={{ gap: 10, fontSize: 12.5 }}>
              <div><span className="muted num">Apr 24</span> · AI generated remediation plan with {(issue.aiConfidence * 100).toFixed(0)}% confidence.</div>
              <div><span className="muted num">Apr 18</span> · {issue.owner} acknowledged finding.</div>
              <div><span className="muted num">Apr 16</span> · Continuous monitor flagged evidence drift.</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

/* ============================== CITATION DRAWER ============================== */
const CITATION_TEXT = {
  "FFIEC-IS|II.C.7": {
    body: "FFIEC", title: "Information Security · Access Control",
    text: "Management should establish access rights based on the principle of least privilege. Access controls should restrict users to authorized data and functions, and privileged accounts should be monitored, reviewed, and rotated on a defined cadence."
  },
  "FFIEC-IS|II.C.8": {
    body: "FFIEC", title: "Information Security · Authentication",
    text: "Multi-factor authentication should be implemented for all customer-facing and high-risk internal systems. Authenticators should be commensurate with the sensitivity of the data and functions accessed."
  },
  "FFIEC-IS|II.C.13": {
    body: "FFIEC", title: "Information Security · Logging & Monitoring",
    text: "Institutions should establish logging and monitoring practices that capture security-relevant events with sufficient retention to support investigation and post-incident analysis."
  },
  "FFIEC-IS|II.C.20": {
    body: "FFIEC", title: "Information Security · Encryption",
    text: "Sensitive data should be encrypted in transit and at rest using approved cryptographic algorithms with documented key management practices, including periodic key rotation."
  },
  "OCC-HS|Appx-D-II": {
    body: "OCC", title: "Heightened Standards · Risk Governance Framework",
    text: "Covered banks should establish and adhere to a written risk governance framework that includes a comprehensive risk appetite statement approved by the board and integrated with the strategic plan."
  },
  "OCC-HS|Appx-D-III": {
    body: "OCC", title: "Heightened Standards · Three Lines of Defense",
    text: "The framework should establish independent risk management and internal audit functions with sufficient stature, authority, and resources to challenge front-line units and report directly to the board."
  },
  "OCC-HS|Appx-D-IV": {
    body: "OCC", title: "Heightened Standards · Talent Management",
    text: "Covered banks should ensure they have qualified personnel with the appropriate skills and experience in risk management, audit, and front-line business activities."
  },
  "FFIEC-BCM|BCM-III": {
    body: "FFIEC", title: "Business Continuity · Resilience & Recovery",
    text: "Recovery time and recovery point objectives should align with business impact analyses and be tested at least annually for critical processes and supporting technology."
  },
  "FFIEC-BCM|BCM-IV": {
    body: "FFIEC", title: "Business Continuity · Third-Party Resilience",
    text: "The resilience expectations of critical third-party providers should be incorporated into the institution's continuity program and validated through testing or attestation."
  },
  "FFIEC-BCM|BCM-V": {
    body: "FFIEC", title: "Business Continuity · Testing",
    text: "A risk-based testing program should validate the effectiveness of recovery plans, with results reported to senior management and used to remediate identified gaps."
  },
  "OCC-TPM|Bull-2023-17-A": {
    body: "OCC", title: "Third-Party Risk · Lifecycle Management",
    text: "A risk-based approach to third-party relationship management should include planning, due diligence, contract negotiation, ongoing monitoring, and termination — calibrated to the risk and complexity of the activity."
  },
  "OCC-TPM|Bull-2023-17-B": {
    body: "OCC", title: "Third-Party Risk · Critical Activities",
    text: "Heightened oversight applies to relationships supporting critical activities — those that, if disrupted, would significantly impact operations or customers. Independent reviews and current SOC reports should be maintained."
  },
  "BSA-AML|CIP": { body: "FFIEC", title: "BSA/AML · Customer Identification",
    text: "A written CIP should be appropriate to the bank's size, location, and account types, with risk-based procedures to verify identity and form a reasonable belief about a customer's true identity." },
  "BSA-AML|CDD": { body: "FFIEC", title: "BSA/AML · Customer Due Diligence",
    text: "Banks should understand the nature and purpose of customer relationships, conduct ongoing monitoring, and refresh due diligence on a risk-based cadence — particularly for higher-risk customers." },
  "BSA-AML|SAR": { body: "FFIEC", title: "BSA/AML · Suspicious Activity",
    text: "Transaction monitoring systems should be tuned to the institution's risk profile, with periodic effectiveness reviews and timely filing of suspicious activity reports." },
  "FFIEC-AIO|AIO-II": { body: "FFIEC", title: "Architecture, Infra & Ops · Governance",
    text: "Governance over IT operations should align with enterprise risk management and define roles, responsibilities, and risk acceptance authorities." },
  "FFIEC-AIO|AIO-IV": { body: "FFIEC", title: "Architecture, Infra & Ops · Operations",
    text: "Operational practices including capacity, change, and incident management should be documented, executed, and continuously improved based on key performance and risk indicators." }
};

const CitationDrawer = ({ reg, section, data, onClose }) => {
  const key = `${reg}|${section}`;
  const t = CITATION_TEXT[key] || { body: reg, title: `${reg} · ${section}`, text: "Requirement text not yet ingested." };
  const { CONTROLS, ISSUES } = data;
  const controls = CONTROLS.filter(c => c.regulation === reg && c.section === section);
  const issues = ISSUES.filter(i => i.regulation === reg && i.section === section);

  return (
    <>
      <div className="drawer-mask" onClick={onClose}/>
      <aside className="drawer">
        <div className="drawer-head">
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="tag">{reg}</span>
            <span className="tag">§{section}</span>
            <span className="muted" style={{ fontSize: 12 }}>{t.body}</span>
            <button className="btn-ghost btn" style={{ marginLeft: "auto", height: 28 }} onClick={onClose}>
              <Icon name="close" size={14}/>
            </button>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>{t.title}</h2>
        </div>
        <div className="drawer-body">
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-head"><div className="card-title">Requirement</div></div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>{t.text}</p>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-head"><div className="card-title">Mapped controls · {controls.length}</div></div>
            {controls.length === 0
              ? <div className="muted" style={{ fontSize: 13 }}>No controls currently mapped to this section.</div>
              : (
                <div className="col" style={{ gap: 8 }}>
                  {controls.map(c => (
                    <div key={c.id} className="row" style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8 }}>
                      <span className="tag">{c.id}</span>
                      <span style={{ fontSize: 13, color: "var(--ink)" }}>{c.name}</span>
                      <span className="right num muted" style={{ fontSize: 12 }}>{c.effectiveness}%</span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Open issues · {issues.length}</div></div>
            {issues.length === 0
              ? <div className="muted" style={{ fontSize: 13 }}>No open findings against this section.</div>
              : (
                <div className="col" style={{ gap: 8 }}>
                  {issues.map(i => (
                    <div key={i.id} className="row" style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8 }}>
                      <SevPill level={i.severity}/>
                      <span style={{ fontSize: 13, color: "var(--ink)" }}>{i.title}</span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </aside>
    </>
  );
};

/* ============================== COPILOT ============================== */
const COPILOT_STARTER_MESSAGES = [
  {
    role: "bot",
    text: "Hi — I'm tracking 8 open findings, 15 controls, and 6 frameworks for Atlas Federal. Ask me anything, or pick a starter below."
  }
];

const SUGGESTED_QUESTIONS = [
  "Why is residual risk above appetite?",
  "Which OCC sections have the weakest coverage?",
  "Summarize the top 3 issues for the board.",
  "What changed since last month?"
];

const SCRIPTED_ANSWERS = {
  "Why is residual risk above appetite?": {
    text: "Composite residual risk is 64 vs. an appetite of 60. The largest contributor is third-party SOC2 program decay — 14 critical vendors past renewal, traceable to OCC-TPM §Bull-2023-17-B. Service-account hygiene (FFIEC-IS §II.C.7) is a secondary driver. If both were closed at current trajectory, you'd land at 57.",
    cites: [{ reg: "OCC-TPM", section: "Bull-2023-17-B" }, { reg: "FFIEC-IS", section: "II.C.7" }]
  },
  "Which OCC sections have the weakest coverage?": {
    text: "OCC-TPM §Bull-2023-17-B (Critical Activities) — 52% coverage and 1 critical issue. OCC-HS §Appx-D-III (Three Lines of Defense) — 64% coverage with an open escalation gap. Both materially affect the regulatory axis of your composite score.",
    cites: [{ reg: "OCC-TPM", section: "Bull-2023-17-B" }, { reg: "OCC-HS", section: "Appx-D-III" }]
  },
  "Summarize the top 3 issues for the board.": {
    text: "1) Critical vendor SOC2 expirations — 14 vendors, 91 days open. 2) Service account password rotation — 218 accounts. 3) Q1 risk-appetite breach with delayed 2nd-line escalation. Each has an AI-generated remediation plan with confidence ≥ 0.92.",
    cites: [{ reg: "OCC-TPM", section: "Bull-2023-17-B" }, { reg: "FFIEC-IS", section: "II.C.7" }, { reg: "OCC-HS", section: "Appx-D-II" }]
  },
  "What changed since last month?": {
    text: "Composite risk improved by 2 points (66 → 64) — driven by MFA rollout completion on the externally-facing tier. Two new findings opened (capacity alerting; data-lake encryption drift). One control moved from Needs Improvement → Effective: AC-014.",
    cites: [{ reg: "FFIEC-IS", section: "II.C.8" }]
  }
};

const Copilot = ({ onClose, onOpenCitation }) => {
  const [messages, setMessages] = useState(COPILOT_STARTER_MESSAGES);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, pending]);

  const ask = (q) => {
    if (!q.trim()) return;
    setMessages(m => [...m, { role: "user", text: q }]);
    setInput("");
    setPending(true);
    setTimeout(() => {
      const scripted = SCRIPTED_ANSWERS[q];
      const answer = scripted || {
        text: "I'd need to query the source data for that. In a connected deployment I'll synthesize an answer with citations to your control evidence and the relevant FFIEC/OCC sections.",
        cites: []
      };
      setMessages(m => [...m, { role: "bot", text: answer.text, cites: answer.cites }]);
      setPending(false);
    }, 700);
  };

  return (
    <aside className="copilot">
      <div className="copilot-head">
        <div className="ai-summary-icon"><Icon name="sparkle" size={14}/></div>
        <div>
          <div className="copilot-title">Risk Copilot</div>
          <div className="copilot-sub">Grounded on your data · cites every claim</div>
        </div>
        <button className="btn btn-ghost" style={{ marginLeft: "auto", height: 28, width: 28, padding: 0, justifyContent: "center" }} onClick={onClose}>
          <Icon name="close" size={14}/>
        </button>
      </div>
      <div className="copilot-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={`copilot-msg ${m.role}`}>
            <div>{m.text}</div>
            {m.cites && m.cites.length > 0 && (
              <div className="chips" style={{ marginTop: 8 }}>
                {m.cites.map((c, j) => (
                  <CiteChip key={j} reg={c.reg} section={c.section} onOpen={onOpenCitation}/>
                ))}
              </div>
            )}
          </div>
        ))}
        {pending && (
          <div className="copilot-msg bot">
            <div className="copilot-typing"><i/><i/><i/></div>
          </div>
        )}
      </div>
      <div className="copilot-suggest">
        {SUGGESTED_QUESTIONS.map(q => (
          <button key={q} onClick={() => ask(q)}>{q}</button>
        ))}
      </div>
      <form className="copilot-input" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about controls, regulations, apps…"/>
        <button type="submit" className="btn btn-primary" style={{ height: 34 }}>Send</button>
      </form>
    </aside>
  );
};

window.RiskDrawers = { AppDrawer, IssueDrawer, CitationDrawer, Copilot };
})();
