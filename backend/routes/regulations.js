const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
  const regs = db.prepare('SELECT * FROM regulations ORDER BY id').all();
  const sections = db.prepare('SELECT * FROM reg_sections ORDER BY regulation_id, section_id').all();
  res.json(regs.map(r => ({
    ...r,
    sections: sections.filter(s => s.regulation_id === r.id)
  })));
});

router.get('/:id', (req, res) => {
  const reg = db.prepare('SELECT * FROM regulations WHERE id = ?').get(req.params.id);
  if (!reg) return res.status(404).json({ error: 'Not found' });
  const sections = db.prepare('SELECT * FROM reg_sections WHERE regulation_id = ?').all(req.params.id);
  const controls = db.prepare('SELECT * FROM controls WHERE regulation_id = ?').all(req.params.id);
  const issues   = db.prepare('SELECT * FROM issues WHERE regulation_id = ?').all(req.params.id);
  res.json({ ...reg, sections, controls, issues });
});

module.exports = router;
