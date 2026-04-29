(() => {
// Mock data for a large US commercial bank's risk analysis system
// Regulations, Controls, Issues, Applications

const REGULATIONS = [
  {
    id: "FFIEC-IS",
    title: "FFIEC IT Handbook — Information Security",
    body: "FFIEC",
    coverage: 78,
    sections: [
      { id: "II.C.7", label: "Access Control", controls: 24 },
      { id: "II.C.8", label: "Authentication", controls: 18 },
      { id: "II.C.13", label: "Logging & Monitoring", controls: 12 },
      { id: "II.C.20", label: "Encryption", controls: 9 }
    ]
  },
  {
    id: "OCC-HS",
    title: "OCC Heightened Standards",
    body: "OCC",
    coverage: 64,
    sections: [
      { id: "Appx-D-II", label: "Risk Governance Framework", controls: 14 },
      { id: "Appx-D-III", label: "Three Lines of Defense", controls: 11 },
      { id: "Appx-D-IV", label: "Talent Management", controls: 6 }
    ]
  },
  {
    id: "FFIEC-BCM",
    title: "FFIEC Business Continuity Management",
    body: "FFIEC",
    coverage: 71,
    sections: [
      { id: "BCM-III", label: "Resilience & Recovery", controls: 16 },
      { id: "BCM-IV", label: "Third-Party Resilience", controls: 8 },
      { id: "BCM-V", label: "Testing", controls: 10 }
    ]
  },
  {
    id: "OCC-TPM",
    title: "OCC Third-Party Risk Management",
    body: "OCC",
    coverage: 52,
    sections: [
      { id: "Bull-2023-17-A", label: "Lifecycle Risk Mgmt", controls: 19 },
      { id: "Bull-2023-17-B", label: "Critical Activities", controls: 11 }
    ]
  },
  {
    id: "BSA-AML",
    title: "BSA / AML Program Requirements",
    body: "FFIEC",
    coverage: 83,
    sections: [
      { id: "CIP", label: "Customer Identification", controls: 9 },
      { id: "CDD", label: "Customer Due Diligence", controls: 14 },
      { id: "SAR", label: "Suspicious Activity", controls: 7 }
    ]
  },
  {
    id: "FFIEC-AIO",
    title: "FFIEC Architecture, Infra & Ops",
    body: "FFIEC",
    coverage: 68,
    sections: [
      { id: "AIO-II", label: "Governance", controls: 8 },
      { id: "AIO-IV", label: "Operations", controls: 22 }
    ]
  }
];

const CONTROLS = [
  { id: "AC-001", name: "Privileged Access Review", family: "Access Control", regulation: "FFIEC-IS", section: "II.C.7", effectiveness: 82, status: "Effective", lastTested: "2026-03-12", owner: "CyberOps", apps: 47 },
  { id: "AC-014", name: "MFA on Externally-Facing Systems", family: "Authentication", regulation: "FFIEC-IS", section: "II.C.8", effectiveness: 94, status: "Effective", lastTested: "2026-04-02", owner: "IAM", apps: 112 },
  { id: "AC-021", name: "Service Account Rotation (90-day)", family: "Access Control", regulation: "FFIEC-IS", section: "II.C.7", effectiveness: 58, status: "Needs Improvement", lastTested: "2026-01-18", owner: "IAM", apps: 89 },
  { id: "LM-003", name: "SIEM Log Retention (12 mo.)", family: "Logging & Monitoring", regulation: "FFIEC-IS", section: "II.C.13", effectiveness: 76, status: "Effective", lastTested: "2026-02-25", owner: "SOC", apps: 134 },
  { id: "EN-007", name: "Data-at-Rest Encryption (AES-256)", family: "Encryption", regulation: "FFIEC-IS", section: "II.C.20", effectiveness: 88, status: "Effective", lastTested: "2026-03-30", owner: "DataSec", apps: 98 },
  { id: "GV-002", name: "Risk Appetite Statement Review", family: "Governance", regulation: "OCC-HS", section: "Appx-D-II", effectiveness: 71, status: "Effective", lastTested: "2026-02-08", owner: "ERM", apps: 0 },
  { id: "GV-011", name: "Independent Risk Mgmt Reporting", family: "Three Lines", regulation: "OCC-HS", section: "Appx-D-III", effectiveness: 62, status: "Needs Improvement", lastTested: "2026-03-04", owner: "ERM", apps: 0 },
  { id: "BC-005", name: "DR Site Failover Testing (annual)", family: "Resilience", regulation: "FFIEC-BCM", section: "BCM-III", effectiveness: 69, status: "Needs Improvement", lastTested: "2025-11-14", owner: "ITOps", apps: 32 },
  { id: "BC-018", name: "RTO < 4hr for Tier-0 Apps", family: "Resilience", regulation: "FFIEC-BCM", section: "BCM-III", effectiveness: 81, status: "Effective", lastTested: "2026-01-29", owner: "ITOps", apps: 18 },
  { id: "TP-009", name: "Critical Vendor SOC2 Review", family: "Third Party", regulation: "OCC-TPM", section: "Bull-2023-17-B", effectiveness: 47, status: "Deficient", lastTested: "2025-10-22", owner: "TPRM", apps: 64 },
  { id: "TP-012", name: "Vendor Concentration Limits", family: "Third Party", regulation: "OCC-TPM", section: "Bull-2023-17-A", effectiveness: 55, status: "Needs Improvement", lastTested: "2025-12-09", owner: "TPRM", apps: 0 },
  { id: "AML-004", name: "Transaction Monitoring Tuning", family: "AML", regulation: "BSA-AML", section: "SAR", effectiveness: 79, status: "Effective", lastTested: "2026-04-11", owner: "Financial Crimes", apps: 7 },
  { id: "AML-011", name: "CDD Refresh — High Risk Customers", family: "AML", regulation: "BSA-AML", section: "CDD", effectiveness: 84, status: "Effective", lastTested: "2026-03-22", owner: "Financial Crimes", apps: 12 },
  { id: "OP-006", name: "Change Management — Production", family: "Operations", regulation: "FFIEC-AIO", section: "AIO-IV", effectiveness: 73, status: "Effective", lastTested: "2026-02-18", owner: "ITOps", apps: 156 },
  { id: "OP-019", name: "Capacity Threshold Alerting", family: "Operations", regulation: "FFIEC-AIO", section: "AIO-IV", effectiveness: 51, status: "Needs Improvement", lastTested: "2025-12-30", owner: "ITOps", apps: 89 }
];

const ISSUES = [
  { id: "ISS-2841", title: "MFA gap on legacy treasury portal", severity: "High", status: "Open", aging: 47, control: "AC-014", regulation: "FFIEC-IS", section: "II.C.8", app: "TREAS-04", owner: "IAM", due: "2026-06-15", aiConfidence: 0.94 },
  { id: "ISS-2867", title: "Service account passwords > 180 days unrotated (218 accounts)", severity: "High", status: "In Remediation", aging: 62, control: "AC-021", regulation: "FFIEC-IS", section: "II.C.7", app: "Multiple", owner: "IAM", due: "2026-05-30", aiConfidence: 0.99 },
  { id: "ISS-2901", title: "Critical vendor SOC2 expired — 14 vendors past renewal", severity: "Critical", status: "Open", aging: 91, control: "TP-009", regulation: "OCC-TPM", section: "Bull-2023-17-B", app: "Multiple", owner: "TPRM", due: "2026-05-12", aiConfidence: 0.97 },
  { id: "ISS-2933", title: "DR failover test for retail core deferred to Q3", severity: "Medium", status: "Accepted Risk", aging: 124, control: "BC-005", regulation: "FFIEC-BCM", section: "BCM-III", app: "RBANK-CORE", owner: "ITOps", due: "2026-09-01", aiConfidence: 0.88 },
  { id: "ISS-2956", title: "Capacity alerting silent on 12 batch-processing apps", severity: "Medium", status: "Open", aging: 28, control: "OP-019", regulation: "FFIEC-AIO", section: "AIO-IV", app: "Multiple", owner: "ITOps", due: "2026-06-01", aiConfidence: 0.81 },
  { id: "ISS-2978", title: "Risk Appetite breach — operational risk capital > 110% threshold for Q1", severity: "High", status: "Escalated", aging: 19, control: "GV-002", regulation: "OCC-HS", section: "Appx-D-II", app: "—", owner: "ERM", due: "2026-05-20", aiConfidence: 0.92 },
  { id: "ISS-2992", title: "2nd Line Risk does not independently report to board on TPRM", severity: "High", status: "Open", aging: 73, control: "GV-011", regulation: "OCC-HS", section: "Appx-D-III", app: "—", owner: "ERM", due: "2026-07-01", aiConfidence: 0.86 },
  { id: "ISS-3014", title: "Encryption key rotation drift — 3 data lakes on legacy AES-128", severity: "Medium", status: "In Remediation", aging: 41, control: "EN-007", regulation: "FFIEC-IS", section: "II.C.20", app: "DLAKE-02", owner: "DataSec", due: "2026-06-22", aiConfidence: 0.91 }
];

const APPLICATIONS = [
  { id: "RBANK-CORE", name: "Retail Banking Core", tier: 0, owner: "Retail Tech", users: 28000, residual: 78, inherent: 92, likelihood: 4, impact: 5, control: 3.2, regulatory: 4.1, openIssues: 6, regs: ["FFIEC-IS", "FFIEC-BCM", "FFIEC-AIO"] },
  { id: "TREAS-04", name: "Corporate Treasury Portal", tier: 0, owner: "Wholesale Tech", users: 1200, residual: 84, inherent: 89, likelihood: 4, impact: 5, control: 2.8, regulatory: 4.4, openIssues: 4, regs: ["FFIEC-IS", "OCC-HS"] },
  { id: "WIRE-01", name: "Wire Transfer Platform", tier: 0, owner: "Payments", users: 800, residual: 72, inherent: 88, likelihood: 3, impact: 5, control: 3.6, regulatory: 4.2, openIssues: 2, regs: ["FFIEC-IS", "BSA-AML"] },
  { id: "AML-CORE", name: "AML Transaction Monitoring", tier: 0, owner: "Financial Crimes", users: 340, residual: 58, inherent: 82, likelihood: 3, impact: 4, control: 4.0, regulatory: 4.6, openIssues: 1, regs: ["BSA-AML"] },
  { id: "DLAKE-02", name: "Enterprise Data Lake", tier: 1, owner: "Data Platform", users: 4500, residual: 66, inherent: 76, likelihood: 3, impact: 4, control: 3.4, regulatory: 3.8, openIssues: 3, regs: ["FFIEC-IS", "FFIEC-AIO"] },
  { id: "CRM-09", name: "Wealth Mgmt CRM", tier: 1, owner: "Wealth", users: 6200, residual: 51, inherent: 64, likelihood: 2, impact: 3, control: 3.8, regulatory: 3.2, openIssues: 2, regs: ["FFIEC-IS"] },
  { id: "HRMS-01", name: "Workforce / HRMS", tier: 2, owner: "HR Tech", users: 65000, residual: 38, inherent: 52, likelihood: 2, impact: 3, control: 4.2, regulatory: 2.4, openIssues: 1, regs: ["OCC-HS"] }
];

// 12-month trend (composite residual risk)
const TREND = [
  { m: "May", v: 71 }, { m: "Jun", v: 73 }, { m: "Jul", v: 70 }, { m: "Aug", v: 68 },
  { m: "Sep", v: 72 }, { m: "Oct", v: 75 }, { m: "Nov", v: 74 }, { m: "Dec", v: 71 },
  { m: "Jan", v: 69 }, { m: "Feb", v: 67 }, { m: "Mar", v: 66 }, { m: "Apr", v: 64 }
];

// AI-generated headline findings (with citations)
const AI_FINDINGS = [
  {
    id: "F-01",
    headline: "Third-party SOC2 program is the highest unmitigated regulatory exposure",
    detail: "14 critical vendors past SOC2 renewal date. Concentration in 3 vendors covering 38% of customer-facing applications. This pattern is inconsistent with OCC Bulletin 2023-17 lifecycle expectations.",
    citations: [{ reg: "OCC-TPM", section: "Bull-2023-17-B", label: "Critical Activities" }],
    severity: "Critical",
    confidence: 0.97
  },
  {
    id: "F-02",
    headline: "Privileged access controls trending positive but service-account hygiene lags",
    detail: "Privileged human access reviews now 82% effective (+9 QoQ). However 218 service accounts have not rotated in >180 days, creating a structural gap that offsets the gain.",
    citations: [{ reg: "FFIEC-IS", section: "II.C.7", label: "Access Control" }],
    severity: "High",
    confidence: 0.94
  },
  {
    id: "F-03",
    headline: "Risk appetite breach in Q1 not yet remediated by 2nd Line",
    detail: "Operational risk capital exceeded 110% of board-approved appetite. Independent escalation to the board occurred 11 days late vs. policy of 5 business days.",
    citations: [
      { reg: "OCC-HS", section: "Appx-D-II", label: "Risk Governance Framework" },
      { reg: "OCC-HS", section: "Appx-D-III", label: "Three Lines of Defense" }
    ],
    severity: "High",
    confidence: 0.92
  }
];

window.RISK_DATA = { REGULATIONS, CONTROLS, ISSUES, APPLICATIONS, TREND, AI_FINDINGS };
})();
