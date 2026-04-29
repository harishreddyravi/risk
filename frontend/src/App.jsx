import React, { useState, useEffect } from 'react';
import './styles.css';
import Topbar from './components/Topbar.jsx';
import Sidenav from './components/Sidenav.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Regulations from './pages/Regulations.jsx';
import Controls from './pages/Controls.jsx';
import Applications from './pages/Applications.jsx';
import Issues from './pages/Issues.jsx';
import Findings from './pages/Findings.jsx';
import AppDrawer from './drawers/AppDrawer.jsx';
import IssueDrawer from './drawers/IssueDrawer.jsx';
import CitationDrawer from './drawers/CitationDrawer.jsx';
import Copilot from './drawers/Copilot.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const [view, setView] = useState('dashboard');
  const [copilotOn, setCopilotOn] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'banking');
  }, []);

  function openApp(app) { setDrawer({ type: 'app', item: app }); }
  function openIssue(issue) { setDrawer({ type: 'issue', item: issue }); }
  function openCitation(reg, section) { setDrawer({ type: 'citation', reg, section }); }
  function openFinding(f) {
    if (f.issue_ids?.length > 0 && data) {
      const linked = data.issues.find(i => i.id === f.issue_ids[0]);
      if (linked) { openIssue(linked); return; }
    }
    if (f.citations?.length > 0) {
      const c = f.citations[0];
      openCitation(c.regulation_id, c.section_id);
    }
  }
  function closeDrawer() { setDrawer(null); }

  const counts = data ? {
    regs: data.regulations?.length,
    controls: data.controls?.length,
    apps: data.applications?.length,
    issues: data.issues?.filter(i => i.status !== 'Accepted Risk').length,
    findings: data.findings?.length,
  } : {};

  const pageProps = { data, onOpenApp: openApp, onOpenIssue: openIssue, onOpenCitation: openCitation, onOpenFinding: openFinding };

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 16, color: 'var(--crit)' }}>Failed to load dashboard data</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>{error}</div>
        <button className="btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Topbar copilotOn={copilotOn} setCopilotOn={setCopilotOn} />
      <Sidenav view={view} setView={setView} counts={counts} />
      <main className="main">
        <div className="main-inner">
          {!data ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-4)' }}>Loading…</div>
          ) : (
            <>
              {view === 'dashboard'    && <Dashboard    {...pageProps} />}
              {view === 'regulations'  && <Regulations  {...pageProps} />}
              {view === 'controls'     && <Controls     {...pageProps} />}
              {view === 'applications' && <Applications {...pageProps} />}
              {view === 'issues'       && <Issues       {...pageProps} />}
              {view === 'findings'     && <Findings     {...pageProps} />}
            </>
          )}
        </div>
      </main>

      {drawer?.type === 'app' && (
        <AppDrawer app={drawer.item} data={data} onClose={closeDrawer}
          onOpenIssue={openIssue} onOpenCitation={openCitation} />
      )}
      {drawer?.type === 'issue' && (
        <IssueDrawer issue={drawer.item} data={data} onClose={closeDrawer}
          onOpenCitation={openCitation} />
      )}
      {drawer?.type === 'citation' && (
        <CitationDrawer reg={drawer.reg} section={drawer.section} data={data}
          onClose={closeDrawer} onOpenIssue={openIssue} />
      )}

      {copilotOn && (
        <Copilot onClose={() => setCopilotOn(false)} data={data} onOpenCitation={openCitation} />
      )}
    </div>
  );
}
