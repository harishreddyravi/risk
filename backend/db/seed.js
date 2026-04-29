const { init } = require('./database');
const db = require('./database');

async function seed() {
  await init();

  // Clear all tables
  ['finding_citations','findings','trend_data','issues','controls',
   'app_regulations','applications','reg_sections','regulations'].forEach(t => {
    db.exec(`DELETE FROM ${t}`);
    try { db.exec(`DELETE FROM sqlite_sequence WHERE name='${t}'`); } catch(_) {}
  });

  // ── REGULATIONS ───────────────────────────────────────────────────────────────
  const insReg = db.prepare('INSERT INTO regulations (id, title, body, coverage) VALUES (?,?,?,?)');
  const insSec = db.prepare('INSERT INTO reg_sections (id, regulation_id, section_id, label, expected_controls) VALUES (?,?,?,?,?)');

  const regs = [
    ['FFIEC-IS', 'FFIEC IT Handbook — Information Security', 'FFIEC', 78],
    ['OCC-HS',   'OCC Heightened Standards',                 'OCC',   64],
    ['FFIEC-BCM','FFIEC Business Continuity Management',     'FFIEC', 71],
    ['OCC-TPM',  'OCC Third-Party Risk Management',          'OCC',   52],
    ['BSA-AML',  'BSA / AML Program Requirements',           'FFIEC', 83],
    ['FFIEC-AIO','FFIEC Architecture, Infra & Ops',          'FFIEC', 68],
  ];
  const sections = [
    ['FFIEC-IS|II.C.7',  'FFIEC-IS', 'II.C.7',          'Access Control',          24],
    ['FFIEC-IS|II.C.8',  'FFIEC-IS', 'II.C.8',          'Authentication',           18],
    ['FFIEC-IS|II.C.13', 'FFIEC-IS', 'II.C.13',         'Logging & Monitoring',     12],
    ['FFIEC-IS|II.C.20', 'FFIEC-IS', 'II.C.20',         'Encryption',               9],
    ['OCC-HS|Appx-D-II', 'OCC-HS',  'Appx-D-II',        'Risk Governance Framework',14],
    ['OCC-HS|Appx-D-III','OCC-HS',  'Appx-D-III',       'Three Lines of Defense',   11],
    ['OCC-HS|Appx-D-IV', 'OCC-HS',  'Appx-D-IV',        'Talent Management',         6],
    ['FFIEC-BCM|BCM-III','FFIEC-BCM','BCM-III',          'Resilience & Recovery',   16],
    ['FFIEC-BCM|BCM-IV', 'FFIEC-BCM','BCM-IV',           'Third-Party Resilience',   8],
    ['FFIEC-BCM|BCM-V',  'FFIEC-BCM','BCM-V',            'Testing',                 10],
    ['OCC-TPM|Bull-2023-17-A','OCC-TPM','Bull-2023-17-A','Lifecycle Risk Mgmt',     19],
    ['OCC-TPM|Bull-2023-17-B','OCC-TPM','Bull-2023-17-B','Critical Activities',     11],
    ['BSA-AML|CIP',  'BSA-AML', 'CIP',  'Customer Identification',  9],
    ['BSA-AML|CDD',  'BSA-AML', 'CDD',  'Customer Due Diligence',  14],
    ['BSA-AML|SAR',  'BSA-AML', 'SAR',  'Suspicious Activity',      7],
    ['FFIEC-AIO|AIO-II','FFIEC-AIO','AIO-II','Governance',           8],
    ['FFIEC-AIO|AIO-IV','FFIEC-AIO','AIO-IV','Operations',          22],
  ];
  const regTx = db.transaction((rows) => { for (const r of rows) insReg.run(...r); });
  regTx(regs);
  const secTx = db.transaction((rows) => { for (const r of rows) insSec.run(...r); });
  secTx(sections);

  // ── APPLICATIONS ──────────────────────────────────────────────────────────────
  const insApp = db.prepare(`INSERT INTO applications
    (id, name, tier, category, owner, users, residual_risk, inherent_risk, likelihood, impact, control_score, regulatory_score, open_issues, status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insAppReg = db.prepare('INSERT INTO app_regulations (app_id, regulation_id) VALUES (?,?)');

  const apps = [
    ['RBANK-CORE', 'Retail Banking Core',        0, 'Core Banking',      'Retail Tech',       28000, 78, 92, 4, 5, 3.2, 4.1, 6, 'Active',
     ['FFIEC-IS','FFIEC-BCM','FFIEC-AIO']],
    ['TREAS-04',  'Corporate Treasury Portal',   0, 'Treasury',           'Wholesale Tech',    1200,  84, 89, 4, 5, 2.8, 4.4, 4, 'Active',
     ['FFIEC-IS','OCC-HS']],
    ['WIRE-01',   'Wire Transfer Platform',       0, 'Payments',           'Payments',          800,   72, 88, 3, 5, 3.6, 4.2, 2, 'Active',
     ['FFIEC-IS','BSA-AML']],
    ['AML-CORE',  'AML Transaction Monitoring',  0, 'Compliance',         'Financial Crimes',  340,   58, 82, 3, 4, 4.0, 4.6, 1, 'Active',
     ['BSA-AML']],
    ['DLAKE-02',  'Enterprise Data Lake',         1, 'Data Platform',      'Data Platform',     4500,  66, 76, 3, 4, 3.4, 3.8, 3, 'Active',
     ['FFIEC-IS','FFIEC-AIO']],
    ['CRM-09',    'Wealth Mgmt CRM',              1, 'CRM',                'Wealth',            6200,  51, 64, 2, 3, 3.8, 3.2, 2, 'Active',
     ['FFIEC-IS']],
    ['HRMS-01',   'Workforce / HRMS',             2, 'HR',                 'HR Tech',           65000, 38, 52, 2, 3, 4.2, 2.4, 1, 'Active',
     ['OCC-HS']],
    ['SWIFT-GW',  'SWIFT Gateway',                0, 'Payments',           'Payments',          120,   81, 91, 4, 5, 3.5, 4.5, 2, 'Active',
     ['FFIEC-IS','BSA-AML']],
    ['LOAN-ORI',  'Loan Origination Platform',    1, 'Lending',            'Lending Tech',      5400,  62, 74, 3, 4, 3.6, 3.5, 2, 'Active',
     ['FFIEC-IS','OCC-HS']],
    ['RISK-CORE', 'Enterprise Risk Engine',       1, 'Risk',               'ERM',               220,   55, 70, 2, 4, 3.9, 4.0, 1, 'Active',
     ['OCC-HS','FFIEC-AIO']],
  ];
  const appTx = db.transaction((rows) => {
    for (const [id, name, tier, cat, owner, users, res, inh, lik, imp, ctrl, reg, oi, stat, regsArr] of rows) {
      insApp.run(id, name, tier, cat, owner, users, res, inh, lik, imp, ctrl, reg, oi, stat);
      for (const rid of regsArr) insAppReg.run(id, rid);
    }
  });
  appTx(apps);

  // ── CONTROLS ─────────────────────────────────────────────────────────────────
  const insCtl = db.prepare(`INSERT INTO controls
    (id, name, family, domain, regulation_id, section_id, effectiveness, status, last_tested, owner, apps_count, description, type, frequency, framework)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

  const controls = [
    ['AC-001', 'Privileged Access Review', 'Access Control', 'Access Management',
     'FFIEC-IS', 'II.C.7', 82, 'Effective', '2026-03-12', 'CyberOps', 47,
     'Quarterly review of all privileged accounts including admin, service, and shared credentials across Tier-0 and Tier-1 systems.',
     'Detective', 'Quarterly', 'FFIEC IT Handbook §II.C.7 / NIST AC-2'],
    ['AC-014', 'MFA on Externally-Facing Systems', 'Authentication', 'Access Management',
     'FFIEC-IS', 'II.C.8', 94, 'Effective', '2026-04-02', 'IAM', 112,
     'Multi-factor authentication enforced on all internet-facing applications and high-privilege internal systems via enterprise MFA platform.',
     'Preventive', 'Continuous', 'FFIEC IT Handbook §II.C.8 / NIST IA-2'],
    ['AC-021', 'Service Account Rotation (90-day)', 'Access Control', 'Access Management',
     'FFIEC-IS', 'II.C.7', 58, 'Needs Improvement', '2026-01-18', 'IAM', 89,
     'All non-human (service) accounts must have passwords rotated on a 90-day maximum cycle. Exceptions require CISO sign-off.',
     'Preventive', 'Continuous', 'FFIEC IT Handbook §II.C.7 / CIS Control 4'],
    ['LM-003', 'SIEM Log Retention (12 mo.)', 'Logging & Monitoring', 'Security Operations',
     'FFIEC-IS', 'II.C.13', 76, 'Effective', '2026-02-25', 'SOC', 134,
     'All security event logs aggregated into the enterprise SIEM platform with a minimum 12-month retention policy and immutable storage.',
     'Detective', 'Continuous', 'FFIEC IT Handbook §II.C.13 / PCI DSS 10.7'],
    ['EN-007', 'Data-at-Rest Encryption (AES-256)', 'Encryption', 'Data Governance',
     'FFIEC-IS', 'II.C.20', 88, 'Effective', '2026-03-30', 'DataSec', 98,
     'All Tier-0 and Tier-1 data stores encrypt data at rest using AES-256. Key management via enterprise HSM with annual key rotation.',
     'Preventive', 'Continuous', 'FFIEC IT Handbook §II.C.20 / NIST SC-28'],
    ['GV-002', 'Risk Appetite Statement Review', 'Governance', 'Risk Governance',
     'OCC-HS', 'Appx-D-II', 71, 'Effective', '2026-02-08', 'ERM', 0,
     'Annual board review and approval of the enterprise risk appetite statement. Mid-year attestation if material changes occur.',
     'Preventive', 'Annual', 'OCC Heightened Standards Appendix D-II'],
    ['GV-011', 'Independent Risk Mgmt Reporting', 'Three Lines', 'Risk Governance',
     'OCC-HS', 'Appx-D-III', 62, 'Needs Improvement', '2026-03-04', 'ERM', 0,
     'Second-line risk function provides independent reporting to the Board Risk Committee quarterly, with ad-hoc reporting on appetite breaches within 5 business days.',
     'Detective', 'Quarterly', 'OCC Heightened Standards Appendix D-III'],
    ['BC-005', 'DR Site Failover Testing (annual)', 'Resilience', 'Business Continuity',
     'FFIEC-BCM', 'BCM-III', 69, 'Needs Improvement', '2025-11-14', 'ITOps', 32,
     'Annual full-failover test to secondary DR site covering all Tier-0 applications. Results reported to CTO and Board within 30 days.',
     'Corrective', 'Annual', 'FFIEC BCM §BCM-III / ISO 22301'],
    ['BC-018', 'RTO < 4hr for Tier-0 Apps', 'Resilience', 'Business Continuity',
     'FFIEC-BCM', 'BCM-III', 81, 'Effective', '2026-01-29', 'ITOps', 18,
     'All Tier-0 applications must demonstrate a Recovery Time Objective of < 4 hours in DR tests. Exceptions escalated to CTO and Board.',
     'Corrective', 'Annual', 'FFIEC BCM §BCM-III / BIS Principles for Operational Resilience'],
    ['TP-009', 'Critical Vendor SOC2 Review', 'Third Party', 'Vendor Risk Management',
     'OCC-TPM', 'Bull-2023-17-B', 47, 'Deficient', '2025-10-22', 'TPRM', 64,
     'Annual review and filing of current-year SOC 2 Type II (or equivalent) reports for all critical vendors. Report must be < 12 months old.',
     'Detective', 'Annual', 'OCC Bulletin 2023-17 §B / OCC Bulletin 2013-29'],
    ['TP-012', 'Vendor Concentration Limits', 'Third Party', 'Vendor Risk Management',
     'OCC-TPM', 'Bull-2023-17-A', 55, 'Needs Improvement', '2025-12-09', 'TPRM', 0,
     'No single third-party provider may support more than 30% of customer-facing applications without formal board approval and a documented exit strategy.',
     'Preventive', 'Quarterly', 'OCC Bulletin 2023-17 §A'],
    ['AML-004', 'Transaction Monitoring Tuning', 'AML', 'Compliance',
     'BSA-AML', 'SAR', 79, 'Effective', '2026-04-11', 'Financial Crimes', 7,
     'Semi-annual review and tuning of AML transaction monitoring rules, including false-positive rate analysis and coverage validation by typology.',
     'Detective', 'Monthly', 'FFIEC BSA/AML Manual §Suspicious Activity Reporting'],
    ['AML-011', 'CDD Refresh — High Risk Customers', 'AML', 'Compliance',
     'BSA-AML', 'CDD', 84, 'Effective', '2026-03-22', 'Financial Crimes', 12,
     'Annual refresh of customer due diligence for high-risk and PEP customers. Enhanced due diligence for 180-day refresh cycle.',
     'Preventive', 'Annual', 'FFIEC BSA/AML Manual §Customer Due Diligence'],
    ['OP-006', 'Change Management — Production', 'Operations', 'IT Operations',
     'FFIEC-AIO', 'AIO-IV', 73, 'Effective', '2026-02-18', 'ITOps', 156,
     'All production changes require CAB approval with documented test plan, rollback procedure, and post-implementation review within 48 hours.',
     'Preventive', 'Continuous', 'FFIEC AIO §AIO-IV / ITIL Change Management'],
    ['OP-019', 'Capacity Threshold Alerting', 'Operations', 'IT Operations',
     'FFIEC-AIO', 'AIO-IV', 51, 'Needs Improvement', '2025-12-30', 'ITOps', 89,
     'Automated alerting when compute, storage, or network capacity exceeds 80% utilization thresholds on production systems. P1 escalation if > 90%.',
     'Detective', 'Continuous', 'FFIEC AIO §AIO-IV'],
  ];
  const ctlTx = db.transaction((rows) => { for (const r of rows) insCtl.run(...r); });
  ctlTx(controls);

  // ── ISSUES ────────────────────────────────────────────────────────────────────
  const insIssue = db.prepare(`INSERT INTO issues
    (id, title, description, severity, status, aging, control_id, regulation_id, section_id, app_id, owner, due_date, ai_confidence, remediation)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

  const issues = [
    ['ISS-2841', 'MFA gap on legacy treasury portal',
     'The legacy authentication path for TREAS-04 does not enforce MFA for users authenticating from within the corporate network. Approximately 340 staff accounts are affected. Identified during Q1 penetration test.',
     'High', 'Open', 47, 'AC-014', 'FFIEC-IS', 'II.C.8', 'TREAS-04', 'IAM', '2026-06-15', 0.94,
     '1) Deploy enterprise MFA to the legacy portal SSO path within 30 days. 2) Interim: restrict affected accounts to read-only while remediation is in flight. 3) Re-test after deployment.'],
    ['ISS-2867', 'Service account passwords > 180 days unrotated (218 accounts)',
     'Automated scan identified 218 service accounts across 7 systems with password ages exceeding 180 days, in violation of the 90-day rotation policy (AC-021). Largest concentrations in RBANK-CORE (89 accounts) and DLAKE-02 (61 accounts).',
     'High', 'In Remediation', 62, 'AC-021', 'FFIEC-IS', 'II.C.7', 'Multiple', 'IAM', '2026-05-30', 0.99,
     '1) Rotate all 218 identified accounts immediately using the automated rotation service. 2) Onboard remaining systems to PAM-enforced rotation. 3) Monthly automated scan with auto-revoke for non-compliance.'],
    ['ISS-2901', 'Critical vendor SOC2 expired — 14 vendors past renewal',
     '14 critical vendors have SOC 2 Type II (or equivalent) reports older than 12 months. 3 vendors have reports older than 18 months. These vendors collectively support 38% of customer-facing applications. Violates TP-009 and OCC Bulletin 2023-17.',
     'Critical', 'Open', 91, 'TP-009', 'OCC-TPM', 'Bull-2023-17-B', 'Multiple', 'TPRM', '2026-05-12', 0.97,
     '1) Issue formal renewal requests to all 14 vendors within 5 business days. 2) Re-tier the 3 most critical vendors with board notice. 3) Evaluate bridge certification options (bridge letters) for highest-risk vendors. 4) Update TPRM policy to include automated renewal tracking.'],
    ['ISS-2933', 'DR failover test for retail core deferred to Q3',
     'The annual DR failover test for RBANK-CORE was scheduled for Q1 but deferred to Q3 due to a major release freeze. This is the second consecutive year the test has been deferred, increasing the risk of unvalidated recovery capabilities for the most critical system in the portfolio.',
     'Medium', 'Accepted Risk', 124, 'BC-005', 'FFIEC-BCM', 'BCM-III', 'RBANK-CORE', 'ITOps', '2026-09-01', 0.88,
     '1) Schedule DR test for September 2026 with board notification. 2) Conduct tabletop exercise in June as interim validation. 3) Risk acceptance signed by CTO and CRO.'],
    ['ISS-2956', 'Capacity alerting silent on 12 batch-processing apps',
     'Capacity monitoring threshold alerts (OP-019) are not configured for 12 batch-processing applications, including overnight settlement and reconciliation jobs. These apps experienced 3 unplanned outages in Q1 due to undetected capacity exhaustion.',
     'Medium', 'Open', 28, 'OP-019', 'FFIEC-AIO', 'AIO-IV', 'Multiple', 'ITOps', '2026-06-01', 0.81,
     '1) Configure threshold alerting for all 12 affected batch applications within 30 days. 2) Add batch apps to capacity management dashboard. 3) Define SLA for batch completion time monitoring.'],
    ['ISS-2978', 'Risk Appetite breach — operational risk capital > 110% threshold for Q1',
     'Operational risk capital consumed 112% of the board-approved appetite in Q1 2026. The 2nd line risk function escalated to the Board Risk Committee 11 days after breach, vs. the 5-business-day policy requirement. Drives immediate review of GV-011.',
     'High', 'Escalated', 19, 'GV-002', 'OCC-HS', 'Appx-D-II', null, 'ERM', '2026-05-20', 0.92,
     '1) Board Risk Committee briefing scheduled. 2) Independent review of capital adequacy model by 3rd party. 3) Strengthen 2nd-line escalation workflow with automated triggers in risk system.'],
    ['ISS-2992', '2nd Line Risk does not independently report to board on TPRM',
     'The 2nd Line Risk function currently embeds TPRM reporting within the CRO\'s operational update rather than presenting independently to the Board Risk Committee. This structure does not meet the three-lines-of-defense independence required by OCC Heightened Standards Appendix D-III.',
     'High', 'Open', 73, 'GV-011', 'OCC-HS', 'Appx-D-III', null, 'ERM', '2026-07-01', 0.86,
     '1) Restructure TPRM reporting as a standalone agenda item at the Board Risk Committee. 2) Develop independent TPRM dashboard for the board. 3) Document the new reporting structure in the risk governance framework.'],
    ['ISS-3014', 'Encryption key rotation drift — 3 data lakes on legacy AES-128',
     'Three data lake partitions in DLAKE-02 are using legacy AES-128 encryption, below the AES-256 requirement in EN-007. The partitions contain anonymized customer behavioral data and model training sets. Key management records show no rotation in 26 months.',
     'Medium', 'In Remediation', 41, 'EN-007', 'FFIEC-IS', 'II.C.20', 'DLAKE-02', 'DataSec', '2026-06-22', 0.91,
     '1) Re-encrypt affected partitions to AES-256 using the enterprise key management service. 2) Rotate all keys after re-encryption. 3) Automate key rotation monitoring in the data platform control plane.'],
  ];
  const issTx = db.transaction((rows) => { for (const r of rows) insIssue.run(...r); });
  issTx(issues);

  // ── TREND DATA ────────────────────────────────────────────────────────────────
  const insTrend = db.prepare('INSERT INTO trend_data (month, value, sort_order) VALUES (?,?,?)');
  const trends = [
    ['May 25', 71, 1], ['Jun 25', 73, 2], ['Jul 25', 70, 3], ['Aug 25', 68, 4],
    ['Sep 25', 72, 5], ['Oct 25', 75, 6], ['Nov 25', 74, 7], ['Dec 25', 71, 8],
    ['Jan 26', 69, 9], ['Feb 26', 67, 10], ['Mar 26', 66, 11], ['Apr 26', 64, 12],
  ];
  const trendTx = db.transaction((rows) => { for (const r of rows) insTrend.run(...r); });
  trendTx(trends);

  // ── AI FINDINGS ───────────────────────────────────────────────────────────────
  const insFinding = db.prepare('INSERT INTO findings (id, headline, detail, severity, confidence) VALUES (?,?,?,?,?)');
  const insCite    = db.prepare('INSERT INTO finding_citations (finding_id, regulation_id, section_id, label) VALUES (?,?,?,?)');

  const findings = [
    ['F-01',
     'Third-party SOC2 program is the highest unmitigated regulatory exposure',
     '14 critical vendors past SOC2 renewal date. Concentration in 3 vendors covering 38% of customer-facing applications. This pattern is inconsistent with OCC Bulletin 2023-17 lifecycle expectations. Control TP-009 is rated Deficient (47% effectiveness) — the lowest in the portfolio.',
     'Critical', 0.97,
     [['OCC-TPM', 'Bull-2023-17-B', 'Critical Activities']]],
    ['F-02',
     'Privileged access controls trending positive but service-account hygiene lags',
     'Privileged human access reviews (AC-001) are now 82% effective, up 9 points QoQ following the IAM program investment. However, 218 service accounts have not rotated credentials in > 180 days, creating a structural gap that offsets much of the gain. The net effect: the Access Control domain remains a top-3 contributor to residual risk.',
     'High', 0.94,
     [['FFIEC-IS', 'II.C.7', 'Access Control']]],
    ['F-03',
     'Risk appetite breach in Q1 not yet remediated by 2nd Line',
     'Operational risk capital exceeded 110% of board-approved appetite in Q1 2026. The independent escalation to the board occurred 11 days late versus the 5-business-day policy requirement. Structural issue: 2nd Line Risk does not independently report to the Board Risk Committee on TPRM matters, compounding the governance gap.',
     'High', 0.92,
     [['OCC-HS', 'Appx-D-II', 'Risk Governance Framework'], ['OCC-HS', 'Appx-D-III', 'Three Lines of Defense']]],
  ];
  const findTx = db.transaction((rows) => {
    for (const [id, headline, detail, severity, confidence, cites] of rows) {
      insFinding.run(id, headline, detail, severity, confidence);
      for (const [rid, sid, label] of cites) insCite.run(id, rid, sid, label);
    }
  });
  findTx(findings);

  console.log('Seeded: 6 regulations, 17 sections, 10 apps, 15 controls, 8 issues, 12 trend points, 3 findings.');
}

seed().catch(err => { console.error(err); process.exit(1); });
