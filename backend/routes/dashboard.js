const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
  const regulations = db.prepare('SELECT * FROM regulations ORDER BY id').all();
  const sections    = db.prepare('SELECT * FROM reg_sections').all();
  const controls    = db.prepare('SELECT * FROM controls ORDER BY family, id').all();
  const issues      = db.prepare(`SELECT i.*, c.name AS control_name, a.name AS app_name
    FROM issues i LEFT JOIN controls c ON i.control_id = c.id LEFT JOIN applications a ON i.app_id = a.id`).all();
  const applications = db.prepare('SELECT * FROM applications ORDER BY tier, residual_risk DESC').all();
  const appRegs      = db.prepare('SELECT * FROM app_regulations').all();
  const trend        = db.prepare('SELECT month, value FROM trend_data ORDER BY sort_order').all();
  const findings     = db.prepare('SELECT * FROM findings ORDER BY severity').all();
  const citations    = db.prepare('SELECT * FROM finding_citations').all();

  res.json({
    regulations: regulations.map(r => ({ ...r, sections: sections.filter(s => s.regulation_id === r.id) })),
    controls,
    issues,
    applications: applications.map(a => ({ ...a, regs: appRegs.filter(ar => ar.app_id === a.id).map(ar => ar.regulation_id) })),
    trend,
    findings: findings.map(f => ({ ...f, citations: citations.filter(c => c.finding_id === f.id) })),
  });
});

module.exports = router;
