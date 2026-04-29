const express = require('express');
const db = require('../db/database');
const router = express.Router();

const JOIN = `SELECT i.*, c.name AS control_name, a.name AS app_name
  FROM issues i
  LEFT JOIN controls c ON i.control_id = c.id
  LEFT JOIN applications a ON i.app_id = a.id`;

router.get('/stats', (req, res) => {
  const bySev  = db.prepare("SELECT severity, COUNT(*) as count FROM issues GROUP BY severity").all();
  const byStatus = db.prepare("SELECT status, COUNT(*) as count FROM issues GROUP BY status").all();
  const avgAge = db.prepare("SELECT ROUND(AVG(aging),0) as avg FROM issues WHERE status NOT IN ('Accepted Risk')").get();
  res.json({ bySeverity: bySev, byStatus, avgAge: Number(avgAge?.avg || 0) });
});

router.get('/', (req, res) => {
  const { severity, status, regulation_id, search } = req.query;
  let sql = `${JOIN} WHERE 1=1`;
  const params = [];
  if (severity) { sql += ' AND i.severity = ?'; params.push(severity); }
  if (status)   { sql += ' AND i.status = ?'; params.push(status); }
  if (regulation_id) { sql += ' AND i.regulation_id = ?'; params.push(regulation_id); }
  if (search) { sql += ' AND (i.title LIKE ? OR i.id LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY CASE i.severity WHEN \'Critical\' THEN 1 WHEN \'High\' THEN 2 WHEN \'Medium\' THEN 3 ELSE 4 END, i.aging DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const issue = db.prepare(`${JOIN} WHERE i.id = ?`).get(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Not found' });
  res.json(issue);
});

router.post('/', (req, res) => {
  const { id, title, description, severity, status, aging, control_id, regulation_id, section_id, app_id, owner, due_date, ai_confidence, remediation } = req.body;
  db.prepare(`INSERT INTO issues (id, title, description, severity, status, aging, control_id, regulation_id, section_id, app_id, owner, due_date, ai_confidence, remediation)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, title, description, severity, status || 'Open', aging || 0, control_id || null, regulation_id || null, section_id || null, app_id || null, owner, due_date, ai_confidence || 0.85, remediation);
  res.status(201).json(db.prepare(`${JOIN} WHERE i.id = ?`).get(id));
});

router.put('/:id', (req, res) => {
  const { title, description, severity, status, aging, control_id, regulation_id, section_id, app_id, owner, due_date, ai_confidence, remediation } = req.body;
  db.prepare(`UPDATE issues SET title=?,description=?,severity=?,status=?,aging=?,control_id=?,regulation_id=?,section_id=?,app_id=?,owner=?,due_date=?,ai_confidence=?,remediation=? WHERE id=?`)
    .run(title, description, severity, status, aging, control_id || null, regulation_id || null, section_id || null, app_id || null, owner, due_date, ai_confidence, remediation, req.params.id);
  res.json(db.prepare(`${JOIN} WHERE i.id = ?`).get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM issues WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
