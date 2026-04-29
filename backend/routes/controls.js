const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
  const { status, family, regulation_id, search } = req.query;
  let sql = 'SELECT * FROM controls WHERE 1=1';
  const params = [];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (family) { sql += ' AND family = ?'; params.push(family); }
  if (regulation_id) { sql += ' AND regulation_id = ?'; params.push(regulation_id); }
  if (search) { sql += ' AND (name LIKE ? OR id LIKE ? OR family LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  sql += ' ORDER BY family ASC, id ASC';
  const controls = db.prepare(sql).all(...params);
  const issues = db.prepare('SELECT id, title, severity, status, control_id FROM issues').all();
  res.json(controls.map(c => ({
    ...c,
    issues: issues.filter(i => i.control_id === c.id)
  })));
});

router.get('/:id', (req, res) => {
  const ctl = db.prepare('SELECT * FROM controls WHERE id = ?').get(req.params.id);
  if (!ctl) return res.status(404).json({ error: 'Not found' });
  const issues = db.prepare('SELECT * FROM issues WHERE control_id = ?').all(req.params.id);
  res.json({ ...ctl, issues });
});

router.post('/', (req, res) => {
  const { id, name, family, domain, regulation_id, section_id, effectiveness, status, last_tested, owner, apps_count, description, type, frequency, framework } = req.body;
  db.prepare(`INSERT INTO controls (id, name, family, domain, regulation_id, section_id, effectiveness, status, last_tested, owner, apps_count, description, type, frequency, framework)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, name, family, domain, regulation_id, section_id, effectiveness, status, last_tested, owner, apps_count || 0, description, type, frequency, framework);
  res.status(201).json(db.prepare('SELECT * FROM controls WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const { name, family, domain, regulation_id, section_id, effectiveness, status, last_tested, owner, apps_count, description, type, frequency, framework } = req.body;
  db.prepare(`UPDATE controls SET name=?,family=?,domain=?,regulation_id=?,section_id=?,effectiveness=?,status=?,last_tested=?,owner=?,apps_count=?,description=?,type=?,frequency=?,framework=? WHERE id=?`)
    .run(name, family, domain, regulation_id, section_id, effectiveness, status, last_tested, owner, apps_count || 0, description, type, frequency, framework, req.params.id);
  res.json(db.prepare('SELECT * FROM controls WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM controls WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
