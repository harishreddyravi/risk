const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'risk.db');

let _sqlDb = null;
let _inTx = false;

function _save() {
  if (_inTx) return;
  fs.writeFileSync(DB_PATH, Buffer.from(_sqlDb.export()));
}

function _lastInsert() {
  const stmt = _sqlDb.prepare('SELECT last_insert_rowid() as id, changes() as ch');
  stmt.step();
  const row = stmt.getAsObject();
  stmt.free();
  return { lastInsertRowid: Number(row.id || 0), changes: Number(row.ch || 0) };
}

class Statement {
  constructor(sql) { this._sql = sql; }
  _bind(args) {
    if (args.length === 1 && args[0] !== null && typeof args[0] === 'object' && !Array.isArray(args[0])) return args[0];
    return args;
  }
  all(...args) {
    const stmt = _sqlDb.prepare(this._sql);
    const p = this._bind(args);
    if (Array.isArray(p) ? p.length : Object.keys(p).length) stmt.bind(p);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }
  get(...args) {
    const stmt = _sqlDb.prepare(this._sql);
    const p = this._bind(args);
    if (Array.isArray(p) ? p.length : Object.keys(p).length) stmt.bind(p);
    let row = undefined;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  run(...args) {
    const p = this._bind(args);
    _sqlDb.run(this._sql, p);
    const info = _lastInsert();
    _save();
    return info;
  }
}

class DB {
  prepare(sql) { return new Statement(sql); }
  exec(sql) {
    for (const s of sql.split(';').map(x => x.trim()).filter(Boolean)) _sqlDb.run(s);
    _save();
    return this;
  }
  pragma(str) { _sqlDb.run(`PRAGMA ${str}`); return this; }
  transaction(fn) {
    return (...fnArgs) => {
      _sqlDb.run('BEGIN');
      _inTx = true;
      try {
        const result = fn(...fnArgs);
        _sqlDb.run('COMMIT');
        _inTx = false;
        _save();
        return result;
      } catch (e) {
        _inTx = false;
        try { _sqlDb.run('ROLLBACK'); } catch (_) {}
        throw e;
      }
    };
  }
}

const db = new DB();

async function init() {
  const SQL = await initSqlJs();
  _sqlDb = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  _sqlDb.run('PRAGMA foreign_keys = ON');

  // Regulations
  _sqlDb.run(`CREATE TABLE IF NOT EXISTS regulations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    coverage INTEGER NOT NULL DEFAULT 0
  )`);
  _sqlDb.run(`CREATE TABLE IF NOT EXISTS reg_sections (
    id TEXT PRIMARY KEY,
    regulation_id TEXT NOT NULL,
    section_id TEXT NOT NULL,
    label TEXT NOT NULL,
    expected_controls INTEGER NOT NULL DEFAULT 0
  )`);

  // Applications (string PK matching design IDs like "RBANK-CORE")
  _sqlDb.run(`CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tier INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL DEFAULT '',
    owner TEXT,
    users INTEGER DEFAULT 0,
    residual_risk INTEGER DEFAULT 50,
    inherent_risk INTEGER DEFAULT 60,
    likelihood INTEGER DEFAULT 3,
    impact INTEGER DEFAULT 3,
    control_score REAL DEFAULT 3.0,
    regulatory_score REAL DEFAULT 3.0,
    open_issues INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  _sqlDb.run(`CREATE TABLE IF NOT EXISTS app_regulations (
    app_id TEXT NOT NULL,
    regulation_id TEXT NOT NULL,
    PRIMARY KEY (app_id, regulation_id)
  )`);

  // Controls (string PK like "AC-001")
  _sqlDb.run(`CREATE TABLE IF NOT EXISTS controls (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    family TEXT NOT NULL,
    domain TEXT NOT NULL DEFAULT '',
    regulation_id TEXT,
    section_id TEXT,
    effectiveness INTEGER DEFAULT 70,
    status TEXT DEFAULT 'Effective',
    last_tested TEXT,
    owner TEXT,
    apps_count INTEGER DEFAULT 0,
    description TEXT,
    type TEXT DEFAULT 'Preventive',
    frequency TEXT DEFAULT 'Continuous',
    framework TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // Issues (string PK like "ISS-2841")
  _sqlDb.run(`CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    aging INTEGER DEFAULT 0,
    control_id TEXT,
    regulation_id TEXT,
    section_id TEXT,
    app_id TEXT,
    owner TEXT,
    due_date TEXT,
    ai_confidence REAL DEFAULT 0.85,
    remediation TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  // Trend data
  _sqlDb.run(`CREATE TABLE IF NOT EXISTS trend_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    value INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`);

  // AI Findings
  _sqlDb.run(`CREATE TABLE IF NOT EXISTS findings (
    id TEXT PRIMARY KEY,
    headline TEXT NOT NULL,
    detail TEXT,
    severity TEXT NOT NULL,
    confidence REAL NOT NULL DEFAULT 0.9
  )`);
  _sqlDb.run(`CREATE TABLE IF NOT EXISTS finding_citations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    finding_id TEXT NOT NULL,
    regulation_id TEXT NOT NULL,
    section_id TEXT NOT NULL,
    label TEXT NOT NULL
  )`);

  _save();
}

module.exports = db;
module.exports.init = init;
