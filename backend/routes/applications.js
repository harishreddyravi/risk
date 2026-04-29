const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
  const { tier, status, search } = req.query;
  let sql = 'SELECT * FROM applications WHERE 1=1';
  const params = [];
  if (tier != null) { sql += ' AND tier = ?'; params.push(tier); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (search) { sql += ' AND (name LIKE ? OR id LIKE ? OR owner LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  sql += ' ORDER BY tier ASC, residual_risk DESC';
  const apps = db.prepare(sql).all(...params);
  const regsMap = db.prepare('SELECT * FROM app_regulations').all();
  res.json(apps.map(a => ({
    ...a,
    regs: regsMap.filter(r => r.app_id === a.id).map(r => r.regulation_id)
  })));
});

router.get('/:id', (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Not found' });
  const regs   = db.prepare('SELECT regulation_id FROM app_regulations WHERE app_id = ?').all(req.params.id).map(r => r.regulation_id);
  const issues = db.prepare('SELECT * FROM issues WHERE app_id = ?').all(req.params.id);
  res.json({ ...app, regs, issues });
});

router.post('/', (req, res) => {
  const { id, name, tier, category, owner, users, residual_risk, inherent_risk, likelihood, impact, control_score, regulatory_score, status, regs } = req.body;
  db.prepare(`INSERT INTO applications (id, name, tier, category, owner, users, residual_risk, inherent_risk, likelihood, impact, control_score, regulatory_score, status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, name, tier, category, owner, users, residual_risk, inherent_risk, likelihood, impact, control_score, regulatory_score, status || 'Active');
  if (regs?.length) {
    const ins = db.prepare('INSERT OR IGNORE INTO app_regulations (app_id, regulation_id) VALUES (?,?)');
    for (const r of regs) ins.run(id, r);
  }
  res.status(201).json(db.prepare('SELECT * FROM applications WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const { name, tier, category, owner, users, residual_risk, inherent_risk, likelihood, impact, control_score, regulatory_score, status } = req.body;
  db.prepare(`UPDATE applications SET name=?,tier=?,category=?,owner=?,users=?,residual_risk=?,inherent_risk=?,likelihood=?,impact=?,control_score=?,regulatory_score=?,status=? WHERE id=?`)
    .run(name, tier, category, owner, users, residual_risk, inherent_risk, likelihood, impact, control_score, regulatory_score, status, req.params.id);
  res.json(db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM app_regulations WHERE app_id = ?').run(req.params.id);
  db.prepare('DELETE FROM applications WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
