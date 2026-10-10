/* Portfolio application: hash router, views, search and filters, tabs, accordions, modal, command palette, progress. */
(function () {
  'use strict';

  var AREAS = {
    A: 'Business analysis and requirements engineering',
    B: 'Agile, Scrum and product delivery',
    C: 'JIRA and Confluence',
    D: 'UX, user research and design collaboration',
    E: 'APIs, integrations and technical analysis',
    F: 'Data, reporting and decision support',
    G: 'Testing, UAT and quality assurance',
    H: 'Stakeholder management and communication',
    I: 'Product Owner and Product Analyst readiness'
  };
  var EV = {
    source: ['ev-source', 'Source-supported experience'],
    brief: ['ev-brief', 'Source-supported (owner brief)'],
    illustrative: ['ev-ill', 'Illustrative example'],
    recommended: ['ev-rec', 'Recommended approach'],
    mixed: ['ev-mixed', 'Mixed, see inline labels']
  };
  var main = document.getElementById('main');
  var byId = function (list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; };
  var skill = function (id) { return byId(PF.skills, id); };
  var art = function (id) { return byId(PF.artifacts, id); };
  var cs = function (id) { return byId(PF.cases, id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function badge(ev) { var e = EV[ev] || EV.illustrative; return '<span class="ev ' + e[0] + '">' + e[1] + '</span>'; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function strip(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent || ''; }
  function list(items) { return '<ul>' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>'; }
  function skillLink(id) { var s = skill(id); return s ? '<a class="chip" href="#skill.' + s.id + '">' + esc(s.name) + '</a>' : ''; }
  function artLink(id) { var a = art(id); return a ? '<a class="chip" href="#studio.' + a.id + '">' + esc(a.name) + '</a>' : ''; }
  function caseLink(id) { var c = cs(id); return c ? '<a class="chip" href="#case.' + c.id + '">' + esc(c.name) + '</a>' : ''; }
  var SEARCH_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M13 13l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  function tabs(id, items) {
    return '<div class="tabs" data-tabs><div class="tablist" role="tablist">' + items.map(function (t, i) {
      return '<button type="button" role="tab" id="' + id + '-t' + i + '" aria-controls="' + id + '-p' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(t[0]) + '</button>';
    }).join('') + '</div>' + items.map(function (t, i) {
      return '<div role="tabpanel" id="' + id + '-p' + i + '" aria-labelledby="' + id + '-t' + i + '" tabindex="0"' + (i ? ' hidden' : '') + '>' + t[1] + '</div>';
    }).join('') + '</div>';
  }
  function block(n, title, body, open, ev, anchor) {
    return '<details class="block"' + (open ? ' open' : '') + (anchor ? ' id="' + anchor + '"' : '') + '><summary><span class="num">' + (n < 10 ? '0' + n : n) + '</span><h3>' + title + '</h3>' + (ev ? badge(ev) : '') + '</summary><div class="block-body"><div class="prose">' + body + '</div></div></details>';
  }

  /* ---------------- Home (executive view) ---------------- */
  var CHAIN = [
    ['OBJ-1', 'Business objective', 'Reduce avoidable clarification cycles between reviewers and applicants.', 'brd'],
    ['BR-02', 'Business requirement', 'Applicants must be able to respond, including documents, within the same application.', 'brd'],
    ['FR-10', 'Functional requirement', 'The applicant responds with a note and documents. Each requested document must have a file. A lapsed response window follows RULE-04.', 'frd'],
    ['PERMIT-102', 'User story', 'As an applicant, I want to respond to a clarification in one step, so that my application returns to the reviewer without delay.', 'jira'],
    ['AC-2', 'Acceptance criterion', 'Given a raised clarification, when the applicant submits the requested document, then status becomes Clarification Responded and the file returns to the reviewer\'s queue.', 'story'],
    ['TC-06', 'Test case', 'Applicant uploads both requested PDFs and submits. Expect the status change, a reviewer-queue entry marked "changed", and a history event.', 'uat'],
    ['R5', 'Release', 'Ships with release notes for applicants and reviewers, an updated SOP section, and UAT sign-off with residual risks recorded.', 'release']
  ];
  var CAPS = [
    { t: 'Requirements engineering, end to end', d: 'BRD, FRD, SRS, RTM, user stories and acceptance criteria on every BA role since 2020.', s: ['brd', 'frd', 'srs', 'rtm'], a: 'rtm', c: 'rajmarg' },
    { t: 'Multi-role workflow and rules design', d: 'Workflow design across 10+ modules for a national permission portal with reviewing and approving authorities.', s: ['process', 'rules'], a: 'bpmn', c: 'rajmarg' },
    { t: 'Integration requirements', d: 'Business requirements for GIS workflows, BharatKosh payment, eSign, role-based access, APIs and legacy migration.', s: ['integrations', 'api', 'migration', 'rbac'], a: 'api', c: 'rajmarg' },
    { t: 'UAT, defect triage and release readiness', d: 'Led UAT planning, triage, release validation, sign-offs and production readiness.', s: ['uat', 'triage', 'release'], a: 'uat', c: 'rajmarg' },
    { t: 'Backlog prioritisation with government stakeholders', d: 'Prioritised backlogs with MoRTH, NHAI, DIC, engineering, QA and UI/UX teams for Agile releases.', s: ['backlog', 'scrum', 'jira'], a: 'jira', c: 'rajmarg' },
    { t: 'Data, dashboards and reporting', d: 'Power BI dashboards and SQL analysis on the Healthcare Management System; M.S. in Data Science.', s: ['powerbi', 'sqlanalysis', 'metrics'], a: 'kpi', c: 'healthcare' }
  ];
  function home() {
    var counts = { s: PF.skills.length, a: PF.artifacts.length, c: PF.cases.length, sc: PF.scenarios.length };
    return '<section class="intro" id="intro" aria-label="Introduction"></section>' +
      '<div class="wrap">' +
      '<section class="hero" id="hero" aria-labelledby="h-title">' +
        '<p class="kicker"><span class="km">km 0+000</span> Senior IT Business Analyst · Product Owner and Product Analyst readiness</p>' +
        '<h1 id="h-title">I turn policy and process into <em>traceable</em>, testable software.</h1>' +
        '<p class="lede">Seven years of business analysis across government, healthcare, HR tech and enterprise systems. Currently working on the Rajmarg Pravesh portal for Digital India Corporation (MeitY), across MoRTH and NHAI initiatives.</p>' +
        '<div class="btn-row"><button class="btn" type="button" data-act="goto" data-target="summary">Read the 60-second summary</button><a class="btn ghost" href="#skills">Explore the BA knowledge base</a><button class="btn ghost" type="button" data-act="goto" data-target="contact">Contact</button></div>' +
        '<div class="hero-meta"><span>Noida, India</span><span>Ascra Technologies LLP · Apr 2025 – present</span><span>M.S. Data Science · B.Tech IT</span></div>' +
      '</section>' +
      '<div class="page" style="padding-top:0">' +
      '<section class="glance" aria-label="At a glance">' +
        '<div><span class="v">7+ yrs</span><span class="l">Business analysis, from discovery to production support</span></div>' +
        '<div><span class="v">10+</span><span class="l">Workflow modules owned on Rajmarg Pravesh</span></div>' +
        '<div><span class="v">5</span><span class="l">Domains: government, enterprise, healthcare, HR, e-commerce</span></div>' +
        '<div><span class="v">4</span><span class="l">Flagship case studies, with evidence labels</span></div>' +
      '</section>' +

      '<section class="section summary60" id="summary" aria-labelledby="sum-h">' +
        '<div class="stack"><p class="kicker"><span class="km">km 1+200</span> Executive view</p><h2 id="sum-h">In about 60 seconds</h2><p class="muted">Every line here comes from the résumé. Deeper pages explain how the work is done, with illustrative examples clearly labelled.</p>' + badge('source') + '</div>' +
        '<ol>' +
          '<li>Business Analyst at <strong>Ascra Technologies</strong>, delivering business analysis and product ownership support for Digital India Corporation (MeitY) on MoRTH and NHAI initiatives.</li>' +
          '<li>Owns business analysis and product delivery across <strong>10+ workflow modules</strong> of the Rajmarg Pravesh portal, from requirement discovery to UAT, production release and post-production support.</li>' +
          '<li>Writes the full requirements set: BRD, FRD, SRS, RTM, user stories, acceptance criteria, functional specifications and process workflows.</li>' +
          '<li>Defines business requirements for <strong>GIS workflows, BharatKosh payment, eSign, role-based access, APIs, workflow automation and legacy data migration</strong>.</li>' +
          '<li>Leads UAT planning, defect triage, release validation and stakeholder sign-off; produces wireframes (Figma), workflows (Visio), SOPs and user manuals.</li>' +
          '<li>Before that: four years on a <strong>Healthcare Management System</strong> (Power BI and SQL dashboards, workshops, training), then ATS and VMS platforms, then business development analysis.</li>' +
        '</ol>' +
      '</section>' +

      '<section class="section" aria-labelledby="cap-h"><div class="section-head"><div class="stack"><p class="kicker"><span class="km">km 2+600</span> Strongest capabilities</p><h2 id="cap-h">Where the evidence is strongest</h2></div><p class="muted">Each capability links to the skill explanation, a sample artifact and the case study where it applies.</p></div>' +
        '<div class="grid g3">' + CAPS.map(function (c) {
          return '<article class="card cap"><div class="meta">' + badge('source') + '</div><h3>' + c.t + '</h3><p class="small muted">' + c.d + '</p><div class="chips">' + c.s.map(skillLink).join('') + '</div><div class="card-foot"><a href="#studio.' + c.a + '">Artifact: ' + esc(art(c.a).name) + '</a><a href="#case.' + c.c + '">' + esc(cs(c.c).short) + ' case</a></div></article>';
        }).join('') + '</div></section>' +

      '<section class="section" aria-labelledby="chain-h"><div class="section-head"><div class="stack"><p class="kicker"><span class="km">km 4+100</span> How the work connects</p><h2 id="chain-h">From objective to release, one thread</h2></div><p class="muted">Select a link in the chain. This is how one requirement is traced through every deliverable. ' + badge('illustrative') + '</p></div>' +
        '<div class="panel stack"><div class="chain" role="group" aria-label="Traceability chain">' + CHAIN.map(function (c, i) {
          return (i ? '<span class="arrow" aria-hidden="true">→</span>' : '') + '<button type="button" data-act="chain" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + c[0] + '</button>';
        }).join('') + '</div><div class="chain-out" id="chain-out" aria-live="polite"></div></div></section>' +

      '<section class="section" aria-labelledby="proj-h"><div class="section-head"><div class="stack"><p class="kicker"><span class="km">km 5+800</span> Flagship projects</p><h2 id="proj-h">Case studies</h2></div><p class="muted">Each case has 20 sections and labels every claim: résumé-backed, owner-described, illustrative or recommended.</p></div>' +
        '<div class="grid g2">' + PF.cases.map(caseCard).join('') + '</div></section>' +

      '<section class="section" aria-labelledby="exp-h"><div class="section-head"><div class="stack"><p class="kicker"><span class="km">km 7+300</span> Experience</p><h2 id="exp-h">Career route</h2></div></div>' +
        '<div class="timeline">' +
          tl('Apr 2025 – present', 'Business Analyst · Ascra Technologies LLP', 'Rajmarg Pravesh Portal, NHAI DataLake 3.0. BA and product ownership support for DIC (MeitY) on MoRTH and NHAI initiatives; 10+ workflow modules; UAT, triage, release readiness.', ['rajmarg', 'datalake']) +
          tl('Apr 2021 – Apr 2025', 'Business Analyst · Intechglobe Pvt. Ltd.', 'Healthcare Management System. End-to-end BA; Confluence and Visio documentation; Scrum delivery; Figma, Power BI, SQL and Excel; workshops, demos, training, change management.', ['healthcare']) +
          tl('Feb 2020 – Mar 2021', 'Business Analyst · Coditro LLP', 'ATS and VMS. BRD, FRD, SRS, RTM; stories and acceptance criteria; refinement, sprint planning, GAP analysis, JAD sessions, defect tracking; Figma and Visio.', ['ats-vms']) +
          tl('Mar 2019 – Feb 2020', 'Business Development Analyst · RTL Technologies', 'Client requirement analysis, proposals, requirement documents and project reports; market and competitor research; client presentations.', []) +
        '</div></section>' +

      '<section class="section" aria-labelledby="deep-h"><div class="section-head"><div class="stack"><p class="kicker"><span class="km">km 9+000</span> Deep-dive view</p><h2 id="deep-h">For a 15 to 30 minute review</h2></div></div>' +
        '<div class="grid g4">' +
          deep('#skills', 'Skills Library', counts.s + ' skills, each with method, scenario, artifact, mistakes, collaboration, interview question and model answer.') +
          deep('#studio', 'Artifact Studio', counts.a + ' sample deliverables, from BRD to release checklist, with business, functional, technical and testing views.') +
          deep('#scenarios', 'Decision scenarios', counts.sc + ' interactive situations. Choose an option to see reasoning, rules, UX, workflow, criteria and tests.') +
          deep('#evidence', 'Evidence map', 'Every skill mapped to a project, an artifact, a case study and an interview question, with its evidence status.') +
        '</div></section>' +

      '<section class="section" aria-labelledby="leg-h"><div class="stack"><p class="kicker">Reading the labels</p><h2 id="leg-h">How claims are marked</h2></div>' +
        '<div class="legend panel">' +
          '<div>' + badge('source') + '<p class="small">Stated in the résumé. Safe to discuss as personal experience.</p></div>' +
          '<div>' + badge('brief') + '<p class="small">From the owner\'s own project description (for example, the Rajmarg Pravesh lifecycle), beyond what the résumé lists.</p></div>' +
          '<div>' + badge('illustrative') + '<p class="small">A realistic example written for this portfolio. Not a project document, incident or result.</p></div>' +
          '<div>' + badge('recommended') + '<p class="small">How the work should be done; practice capability rather than a documented project claim.</p></div>' +
        '</div></section>' +

      '<section class="section" id="contact" aria-labelledby="ct-h"><div class="stack"><p class="kicker"><span class="km">km 12+000</span> Contact</p><h2 id="ct-h">Talk about a Senior BA, Product Owner or Product Analyst role</h2></div>' +
        '<div class="contact">' +
          '<div class="panel stack"><h3>Email</h3><div class="copy-line"><code id="email-text">ba.abhiy@gmail.com</code><button class="btn ghost" type="button" data-act="copy" data-copy="ba.abhiy@gmail.com">Copy</button><span class="small muted" id="copy-status" aria-live="polite"></span></div><a href="mailto:ba.abhiy@gmail.com">Open in your email app</a></div>' +
          '<div class="panel stack"><h3>LinkedIn</h3><p class="small muted">linkedin.com/in/abhiyknp</p><a class="btn" href="https://www.linkedin.com/in/abhiyknp" target="_blank" rel="noopener">View LinkedIn profile</a></div>' +
          '<div class="panel stack"><h3>Start anywhere</h3><p class="small muted">Press <span class="kbd">/</span> to search every skill, artifact, case study and scenario.</p><button class="btn ghost" type="button" data-act="palette">Search the knowledge base</button></div>' +
        '</div></section>' +
      '</div></div>';
  }
  function tl(when, title, body, cases) {
    return '<div class="tl-item"><span class="tl-when">' + when + '</span><h3>' + title + '</h3><p class="small muted">' + body + '</p>' + (cases.length ? '<div class="chips">' + cases.map(caseLink).join('') + '</div>' : '') + '</div>';
  }
  function deep(href, t, d) { return '<a class="card" href="' + href + '"><h3>' + t + '</h3><p class="small muted">' + d + '</p><span class="card-foot"><span>Open</span><span aria-hidden="true">→</span></span></a>'; }
  function caseCard(c) {
    var n = { source: 0, illustrative: 0 };
    c.sections.forEach(function (s) { if (s.ev === 'source' || s.ev === 'mixed') n.source++; else n.illustrative++; });
    return '<a class="card" href="#case.' + c.id + '"><div class="meta"><span class="kicker">' + esc(c.domain) + '</span></div><h3>' + esc(c.name) + '</h3><p class="small muted">' + esc(c.org) + ' · ' + c.period + '</p><p class="small">' + esc(c.lede) + '</p><span class="card-foot"><span>' + n.source + ' sections with source evidence · ' + n.illustrative + ' illustrative or recommended</span><span aria-hidden="true">→</span></span></a>';
  }

  /* ---------------- Skills Library ---------------- */
  var lib = store('pf-lib') || { q: '', area: 'all', ev: 'all' };
  function skillsView() {
    return '<div class="wrap page"><header class="page-head"><p class="kicker">Deep-dive · Skills Library</p><h1>Skills Library</h1><p class="lede">' + PF.skills.length + ' skills across nine areas. Each opens a 15-part explanation: definition, method, scenario, artifact, mistakes, collaboration, interview question and model answer.</p></header>' +
      '<div class="filters"><label class="search" for="lib-q">' + SEARCH_ICON + '<span class="sr-only" hidden>Search skills</span><input id="lib-q" type="search" placeholder="Search skills, tools or techniques, for example JQL, decision table, BharatKosh" value="' + esc(lib.q) + '" autocomplete="off" aria-label="Search skills"></label>' +
        '<div class="filter-row" role="group" aria-label="Filter by area"><span>Area</span><button class="chip" type="button" data-f="area" data-v="all" aria-pressed="' + (lib.area === 'all') + '">All</button>' +
          Object.keys(AREAS).map(function (k) { return '<button class="chip" type="button" data-f="area" data-v="' + k + '" aria-pressed="' + (lib.area === k) + '" title="' + AREAS[k] + '">' + k + ' · ' + AREAS[k].split(',')[0].split(' and ')[0] + '</button>'; }).join('') + '</div>' +
        '<div class="filter-row" role="group" aria-label="Filter by evidence"><span>Evidence</span>' + ['all', 'source', 'recommended'].map(function (k) { return '<button class="chip" type="button" data-f="ev" data-v="' + k + '" aria-pressed="' + (lib.ev === k) + '">' + (k === 'all' ? 'All' : EV[k][1]) + '</button>'; }).join('') + '<span class="result-count" id="lib-count" aria-live="polite"></span></div></div>' +
      '<div id="lib-results" class="stack" style="gap:var(--s-6)"></div></div>';
  }
  function skillMatches(s, q) {
    if (!q) return true;
    var hay = (s.name + ' ' + s.tags.join(' ') + ' ' + s.sum + ' ' + strip(s.def) + ' ' + (s.tools || []).join(' ') + ' ' + AREAS[s.area]).toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (t) { return hay.indexOf(t) > -1; });
  }
  function drawLib() {
    var out = document.getElementById('lib-results'); if (!out) return;
    var res = PF.skills.filter(function (s) { return (lib.area === 'all' || s.area === lib.area) && (lib.ev === 'all' || s.ev === lib.ev) && skillMatches(s, lib.q.trim()); });
    document.getElementById('lib-count').textContent = res.length + ' of ' + PF.skills.length + ' skills';
    if (!res.length) { out.innerHTML = '<div class="empty"><p>No skills match "' + esc(lib.q) + '" with these filters.</p><p><button class="btn ghost" type="button" data-act="lib-reset">Clear search and filters</button></p></div>'; return; }
    out.innerHTML = Object.keys(AREAS).map(function (k) {
      var items = res.filter(function (s) { return s.area === k; });
      if (!items.length) return '';
      return '<section class="area-block"><h2><span class="area-letter">' + k + '</span>' + AREAS[k] + '</h2><div class="grid g3">' + items.map(function (s) {
        return '<a class="card" href="#skill.' + s.id + '"><div class="meta">' + badge(s.ev) + '</div><h3>' + esc(s.name) + '</h3><p class="small muted">' + esc(s.sum) + '</p><span class="card-foot"><span>Artifact: ' + esc((art(s.artifact) || {}).name || '') + '</span><span aria-hidden="true">→</span></span></a>';
      }).join('') + '</div></section>';
    }).join('');
  }

  /* ---------------- Skill detail ---------------- */
  function skillView(id) {
    var s = skill(id); if (!s) return notFound();
    var idx = PF.skills.indexOf(s), prev = PF.skills[idx - 1], next = PF.skills[idx + 1];
    var a = art(s.artifact);
    var titles = ['Definition', 'Why it matters', 'When to use it, and when not to', 'Step-by-step method', 'Realistic business scenario', 'Enterprise software example', 'Sample inputs and outputs', 'Common mistakes and how to avoid them', 'Collaboration', 'Relevant tools', 'Example artifact', 'Related skills and dependencies', 'Interview questions', 'Model answer', 'Explaining it without overstating'];
    var bodies = [
      '<p>' + s.def + '</p>',
      '<p>' + s.why + '</p>',
      '<div class="two"><div><h4>Use it when</h4>' + list(s.use) + '</div><div><h4>Avoid or adapt when</h4>' + list(s.avoid) + '</div></div>',
      '<ol>' + s.steps.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>',
      '<p>' + s.scenario + '</p>',
      '<p>' + s.enterprise + '</p>',
      '<div class="two"><div><h4>Inputs</h4>' + list(s.inputs) + '</div><div><h4>Outputs</h4>' + list(s.outputs) + '</div></div>',
      '<div class="mistakes">' + s.mistakes.map(function (m) { return '<div><p class="m">' + m[0] + '</p><p class="f">' + m[1] + '</p></div>'; }).join('') + '</div>',
      '<dl class="collab">' + [['Business stakeholders', 'biz'], ['Designers', 'design'], ['Developers', 'dev'], ['Testers', 'qa'], ['Product owner / manager', 'pm']].map(function (r) { return s.collab[r[1]] && s.collab[r[1]] !== '-' ? '<div><dt>' + r[0] + '</dt><dd>' + s.collab[r[1]] + '</dd></div>' : ''; }).join('') + '</dl>',
      '<div class="chips">' + s.tools.map(function (t) { return '<span class="chip" style="cursor:default">' + esc(t) + '</span>'; }).join('') + '</div>',
      a ? '<p>' + esc(s.artifactNote) + '</p><p class="small muted"><strong>' + esc(a.name) + '</strong>: ' + esc(a.purpose) + '</p><div class="btn-row"><button class="btn" type="button" data-act="artifact-preview" data-id="' + a.id + '">Preview artifact</button><a class="btn ghost" href="#studio.' + a.id + '">Open in Artifact Studio</a></div>' : '',
      '<div class="chips">' + s.related.map(skillLink).join('') + '</div><p class="small muted">Case studies: </p><div class="chips">' + s.cases.map(caseLink).join('') + '</div>',
      '<div class="qa"><p class="q">' + esc(s.q.q) + '</p></div>' + (s.more.length ? '<p class="small muted">Follow-up questions to prepare:</p>' + list(s.more.map(esc)) : ''),
      '<div class="qa"><p class="q">"' + esc(s.q.q) + '"</p><p>' + esc(s.q.a) + '</p></div>',
      '<p>' + esc(s.honest) + '</p><p class="small muted">Evidence note: ' + esc(s.evNote) + '</p>'
    ];
    var evs = [null, null, null, 'recommended', 'illustrative', 'illustrative', null, null, null, null, 'illustrative', null, null, null, null];
    var openSet = [0, 1, 2];
    var toc = titles.map(function (t, i) { return '<a href="#skill.' + s.id + '" data-act="jump" data-target="sk-' + i + '">' + (i + 1) + '. ' + t + '</a>'; }).join('');
    return '<div class="wrap page"><nav class="crumbs" aria-label="Breadcrumb"><a href="#skills">Skills Library</a><span aria-hidden="true">/</span><span>' + AREAS[s.area] + '</span></nav>' +
      '<header class="page-head"><p class="kicker"><span class="area-letter">' + s.area + '</span>' + AREAS[s.area] + '</p><h1>' + esc(s.name) + '</h1><p class="lede">' + esc(s.sum) + '</p>' +
        '<div class="illus-flag">' + badge(s.ev) + '<span class="small muted">' + esc(s.evNote) + '</span></div></header>' +
      '<div class="detail"><div class="stack"><div class="tool-row"><p class="small muted">Sections 1 to 3 are open. Expand the rest for method, examples, artifacts and interview preparation.</p><button class="btn ghost" type="button" data-act="expand-all">Expand all</button></div>' +
        '<div class="blocks">' + titles.map(function (t, i) { return block(i + 1, t, bodies[i], openSet.indexOf(i) > -1, evs[i], 'sk-' + i); }).join('') + '</div>' +
        '<nav class="pager" aria-label="More skills">' + (prev ? '<a class="btn ghost" href="#skill.' + prev.id + '">← ' + esc(prev.name) + '</a>' : '<span></span>') + (next ? '<a class="btn ghost" href="#skill.' + next.id + '">' + esc(next.name) + ' →</a>' : '') + '</nav></div>' +
        '<aside class="toc" aria-label="On this page"><span class="toc-title">On this page</span>' + toc + '</aside></div></div>';
  }

  /* ---------------- Case studies ---------------- */
  function casesView() {
    return '<div class="wrap page"><header class="page-head"><p class="kicker">Deep-dive · Case studies</p><h1>Case studies</h1><p class="lede">Four projects from the résumé, each explored in 20 sections. Labels show what is documented and what is a realistic illustration.</p></header><div class="grid g2">' + PF.cases.map(caseCard).join('') + '</div></div>';
  }
  function caseView(id) {
    var c = cs(id); if (!c) return notFound();
    var toc = PF.caseTitles.map(function (t, i) { return '<a href="#case.' + c.id + '" data-act="jump" data-target="cs-' + i + '">' + (i + 1) + '. ' + t + '</a>'; }).join('');
    return '<div class="wrap page"><nav class="crumbs" aria-label="Breadcrumb"><a href="#cases">Case studies</a><span aria-hidden="true">/</span><span>' + esc(c.short) + '</span></nav>' +
      '<header class="page-head"><p class="kicker">' + esc(c.domain) + '</p><h1>' + esc(c.name) + '</h1><p class="lede">' + esc(c.lede) + '</p><p class="small muted">' + esc(c.org) + ' · ' + c.period + '</p></header>' +
      '<section class="panel stack" aria-label="Evidence summary"><h2 style="font-size:var(--t-lg)">What the sources say</h2><div class="facts">' + c.facts.map(function (f) { return '<div><span class="k">' + esc(f[0]) + '</span><span>' + esc(f[1]) + '</span>' + badge(f[2]) + '</div>'; }).join('') + '</div>' +
        '<div class="two"><div><h4 class="small muted">Skills applied</h4><div class="chips">' + c.skills.map(skillLink).join('') + '</div></div><div><h4 class="small muted">Artifacts</h4><div class="chips">' + c.artifacts.map(artLink).join('') + '</div></div></div></section>' +
      '<div class="detail"><div class="stack"><div class="tool-row"><p class="small muted">Sections 1 to 3 are open; the rest expand on demand.</p><button class="btn ghost" type="button" data-act="expand-all">Expand all</button></div><div class="blocks">' +
        c.sections.map(function (s, i) { return block(i + 1, PF.caseTitles[i], s.html, i < 3, s.ev, 'cs-' + i); }).join('') +
      '</div></div><aside class="toc" aria-label="Sections"><span class="toc-title">20 sections</span>' + toc + '</aside></div></div>';
  }

  /* ---------------- Artifact Studio ---------------- */
  var studioKind = 'all';
  function studioView() {
    var kinds = []; PF.artifacts.forEach(function (a) { if (kinds.indexOf(a.kind) < 0) kinds.push(a.kind); });
    return '<div class="wrap page"><header class="page-head"><p class="kicker">Deep-dive · Artifact Studio</p><h1>Artifact Studio</h1><p class="lede">' + PF.artifacts.length + ' sample deliverables you can inspect. Each explains its purpose, the problem it solves, how to use it and what a good version looks like.</p><p class="note">All artifacts are educational reconstructions with invented IDs and sample data. None is a client document.</p></header>' +
      '<div class="filter-row" role="group" aria-label="Filter by type"><span>Type</span><button class="chip" type="button" data-f="kind" data-v="all" aria-pressed="' + (studioKind === 'all') + '">All</button>' + kinds.map(function (k) { return '<button class="chip" type="button" data-f="kind" data-v="' + k + '" aria-pressed="' + (studioKind === k) + '">' + k + '</button>'; }).join('') + '</div>' +
      '<div class="grid g3" id="studio-grid">' + studioCards() + '</div></div>';
  }
  function studioCards() {
    return PF.artifacts.filter(function (a) { return studioKind === 'all' || a.kind === studioKind; }).map(function (a) {
      return '<a class="card" href="#studio.' + a.id + '"><div class="meta"><span class="kicker">' + a.kind + '</span>' + badge('illustrative') + '</div><h3>' + esc(a.name) + '</h3><p class="small muted">' + esc(a.purpose) + '</p><span class="card-foot"><span>' + a.tabs.length + ' view' + (a.tabs.length > 1 ? 's' : '') + '</span><span aria-hidden="true">→</span></span></a>';
    }).join('');
  }
  function artifactView(id) {
    var a = art(id); if (!a) return notFound();
    var i = PF.artifacts.indexOf(a), prev = PF.artifacts[i - 1], next = PF.artifacts[i + 1];
    var users = PF.skills.filter(function (s) { return s.artifact === a.id; }).map(function (s) { return s.id; });
    var sk = a.skills.concat(users.filter(function (x) { return a.skills.indexOf(x) < 0; }));
    return '<div class="wrap page"><nav class="crumbs" aria-label="Breadcrumb"><a href="#studio">Artifact Studio</a><span aria-hidden="true">/</span><span>' + a.kind + '</span></nav>' +
      '<header class="page-head"><p class="kicker">' + a.kind + ' ' + badge('illustrative') + '</p><h1>' + esc(a.name) + '</h1><p class="lede">' + esc(a.purpose) + '</p></header>' +
      '<div class="grid g3"><div class="panel stack"><h3 class="kicker">Problem it solves</h3><p>' + esc(a.problem) + '</p></div><div class="panel stack"><h3 class="kicker">How to use it</h3><p>' + esc(a.howto) + '</p></div><div class="panel stack"><h3 class="kicker">What good looks like</h3><ul class="check small">' + a.good.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul></div></div>' +
      '<section class="stack" aria-label="Artifact">' + tabs('art-' + a.id, a.tabs) + '</section>' +
      '<section class="two"><div class="stack"><h2 style="font-size:var(--t-lg)">Skills it demonstrates</h2><div class="chips">' + sk.map(skillLink).join('') + '</div></div><div class="stack"><h2 style="font-size:var(--t-lg)">Used in case studies</h2><div class="chips">' + a.cases.map(caseLink).join('') + '</div></div></section>' +
      '<nav class="pager" aria-label="More artifacts">' + (prev ? '<a class="btn ghost" href="#studio.' + prev.id + '">← ' + esc(prev.name) + '</a>' : '<span></span>') + (next ? '<a class="btn ghost" href="#studio.' + next.id + '">' + esc(next.name) + ' →</a>' : '') + '</nav></div>';
  }

  /* ---------------- Scenarios ---------------- */
  function scenariosView() {
    return '<div class="wrap page"><header class="page-head"><p class="kicker">Deep-dive · Decision scenarios</p><h1>Decision scenarios</h1><p class="lede">Business situations with several possible responses. Choose one to see the reasoning, rule, user experience, workflow and timing effect, acceptance criteria, tests and backlog items.</p><p class="note">Educational simulations. They are not descriptions of production behaviour on any project.</p></header><div class="grid g3">' +
      PF.scenarios.map(function (s) { return '<a class="card" href="#scenario.' + s.id + '"><div class="meta">' + badge('illustrative') + '<span class="kicker">' + s.options.length + ' options</span></div><h3>' + esc(s.short) + '</h3><p class="small muted">' + esc(s.situation) + '</p><span class="card-foot"><span>Explore</span><span aria-hidden="true">→</span></span></a>'; }).join('') + '</div></div>';
  }
  var OPT_FIELDS = [['reasoning', 'Reasoning and trade-offs'], ['rule', 'Business rule'], ['ux', 'UX and notifications'], ['workflow', 'Workflow and TAT effect'], ['ac', 'Acceptance criteria'], ['tests', 'Test cases'], ['jira', 'JIRA story']];
  function scenarioView(id) {
    var s = byId(PF.scenarios, id); if (!s) return notFound();
    var L = 'ABCDE';
    return '<div class="wrap page"><nav class="crumbs" aria-label="Breadcrumb"><a href="#scenarios">Decision scenarios</a><span aria-hidden="true">/</span><span>' + esc(s.short) + '</span></nav>' +
      '<header class="page-head"><p class="kicker">Scenario ' + badge('illustrative') + '</p><h1>' + esc(s.name) + '</h1></header>' +
      '<div class="situation"><strong>Situation</strong><p>' + esc(s.situation) + '</p><p class="small muted">' + esc(s.context) + '</p></div>' +
      '<section class="stack" aria-labelledby="opt-h"><h2 id="opt-h" style="font-size:var(--t-xl)">What would you do?</h2><div class="options">' + s.options.map(function (o, i) {
        return '<button class="opt" type="button" data-act="opt" data-sc="' + s.id + '" data-o="' + o.id + '" aria-pressed="false"><span class="letter">' + L[i] + '</span><span>' + esc(o.label) + '</span></button>';
      }).join('') + '</div><div id="opt-out" aria-live="polite"><p class="muted small">Choose an option. You can switch between them to compare.</p></div>' +
      '<details class="block"><summary><h3>Compare all options side by side</h3></summary><div class="block-body"><div class="tw"><table><tr><th>Option</th><th>Verdict</th><th>Reasoning</th></tr>' + s.options.map(function (o, i) { return '<tr><td>' + L[i] + '. ' + esc(o.label) + '</td><td><span class="verdict ' + o.verdict + '">' + o.verdict + '</span></td><td>' + esc(o.reasoning) + '</td></tr>'; }).join('') + '</table></div></div></details></section>' +
      '<section class="panel stack"><h2 style="font-size:var(--t-lg)">Takeaways</h2>' + list(s.takeaways.map(esc)) + '<div class="two"><div><h4 class="small muted">Related skills</h4><div class="chips">' + s.skills.map(skillLink).join('') + '</div></div><div><h4 class="small muted">Related artifacts</h4><div class="chips">' + s.artifacts.map(artLink).join('') + '</div></div></div></section></div>';
  }
  function showOption(scId, oId) {
    var s = byId(PF.scenarios, scId), o = byId(s.options, oId), out = document.getElementById('opt-out');
    document.querySelectorAll('.opt').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-o') === oId)); });
    var fields = OPT_FIELDS.filter(function (f) { return o[f[0]]; }).map(function (f) { return [f[1], '<div class="prose"><p>' + esc(o[f[0]]) + '</p></div>']; });
    out.innerHTML = '<div class="panel stack"><div class="illus-flag"><span class="verdict ' + o.verdict + '">' + o.verdict + '</span><strong>' + esc(o.label) + '</strong></div>' + (fields.length > 1 ? tabs('opt-' + o.id, fields) : fields[0][1]) + '</div>';
    hydrateTabs(out);
  }

  /* ---------------- Evidence map ---------------- */
  var evf = { ev: 'all', area: 'all', q: '' };
  function evidenceView() {
    return '<div class="wrap page"><header class="page-head"><p class="kicker">Deep-dive · Evidence map</p><h1>Skills-to-evidence map</h1><p class="lede">Where each skill is demonstrated: the explanation, the project or illustrative scenario, the artifact, the case study and the interview question, with an evidence status rather than a proficiency score.</p></header>' +
      '<div class="filters"><label class="search" for="ev-q">' + SEARCH_ICON + '<input id="ev-q" type="search" placeholder="Filter by skill or tool" autocomplete="off" aria-label="Filter the evidence map" value="' + esc(evf.q) + '"></label>' +
        '<div class="filter-row" role="group" aria-label="Evidence status"><span>Evidence</span>' + ['all', 'source', 'recommended'].map(function (k) { return '<button class="chip" type="button" data-f="evm" data-v="' + k + '" aria-pressed="' + (evf.ev === k) + '">' + (k === 'all' ? 'All' : EV[k][1]) + '</button>'; }).join('') +
        '<label class="field" for="ev-area" style="display:flex;gap:.5rem;align-items:center;min-width:0;max-width:100%;flex:1 1 16rem"><span class="small">Area</span><select id="ev-area"><option value="all">All areas</option>' + Object.keys(AREAS).map(function (k) { return '<option value="' + k + '"' + (evf.area === k ? ' selected' : '') + '>' + k + ' · ' + AREAS[k] + '</option>'; }).join('') + '</select></label><span class="result-count" id="ev-count" aria-live="polite"></span></div></div>' +
      '<div class="tw" id="ev-table"></div></div>';
  }
  function drawEvidence() {
    var host = document.getElementById('ev-table'); if (!host) return;
    var rows = PF.skills.filter(function (s) { return (evf.ev === 'all' || s.ev === evf.ev) && (evf.area === 'all' || s.area === evf.area) && skillMatches(s, evf.q.trim()); });
    document.getElementById('ev-count').textContent = rows.length + ' skills';
    host.innerHTML = rows.length ? '<table class="ev-table" style="min-width:1100px"><tr><th>Skill</th><th>Practical explanation</th><th>Project or scenario</th><th>Artifact</th><th>Case study</th><th>Interview question</th><th>Evidence status</th></tr>' + rows.map(function (s) {
      var a = art(s.artifact);
      return '<tr><td><a href="#skill.' + s.id + '">' + esc(s.name) + '</a><span class="muted small">' + s.area + ' · ' + AREAS[s.area] + '</span></td><td>' + esc(s.sum) + '</td><td>' + esc(strip(s.scenario).slice(0, 150)) + '… ' + badge('illustrative') + '</td><td>' + (a ? '<a href="#studio.' + a.id + '">' + esc(a.name) + '</a>' : '') + '</td><td>' + s.cases.map(function (c) { var x = cs(c); return x ? '<a href="#case.' + x.id + '">' + esc(x.short) + '</a>' : ''; }).join(', ') + '</td><td>' + esc(s.q.q) + '</td><td>' + badge(s.ev) + '<span class="muted small" style="display:block;margin-top:.3rem">' + esc(s.evNote) + '</span></td></tr>';
    }).join('') + '</table>' : '<div class="empty">No skills match these filters.</div>';
  }

  function notFound() { return '<div class="wrap page"><h1>Page not found</h1><p>That link does not match a page. <a href="#home">Go to the overview</a> or press <span class="kbd">/</span> to search.</p></div>'; }

  /* ---------------- Router ---------------- */
  var current = '';
  function route() {
    var h = decodeURIComponent(location.hash.slice(1)) || 'home';
    if (h === 'summary' || h === 'contact') { h = 'home'; }
    var parts = h.split('.'), view = parts[0], id = parts.slice(1).join('.');
    var html, navKey = view;
    switch (view) {
      case 'home': html = home(); break;
      case 'skills': html = skillsView(); break;
      case 'skill': html = skillView(id); navKey = 'skills'; break;
      case 'cases': html = casesView(); break;
      case 'case': html = caseView(id); navKey = 'cases'; break;
      case 'studio': html = id ? artifactView(id) : studioView(); break;
      case 'scenarios': html = scenariosView(); break;
      case 'scenario': html = scenarioView(id); navKey = 'scenarios'; break;
      case 'evidence': html = evidenceView(); break;
      default: html = notFound(); navKey = '';
    }
    closeModal();
    main.innerHTML = html;
    document.body.setAttribute('data-route', view === 'home' ? 'home' : 'page');
    document.querySelectorAll('[data-nav]').forEach(function (a) { if (a.getAttribute('data-nav') === navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    var h1 = main.querySelector('h1');
    document.title = view === 'home' ? 'Abhishek Yadav, Business Analyst' : (h1 ? h1.textContent + ' · ' : '') + 'Abhishek Yadav';
    window.PFW.hydrate(main); hydrateTabs(main);
    if (view === 'skills') { drawLib(); }
    if (view === 'evidence') { drawEvidence(); }
    if (view === 'home') { chain(0); if (window.PFIntro) window.PFIntro.mount(document.getElementById('intro')); }
    else if (window.PFIntro) window.PFIntro.unmount();
    closeMenu();
    if (current !== h) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
    var anchor = decodeURIComponent(location.hash.slice(1));
    if (anchor === 'summary' || anchor === 'contact') { var t = document.getElementById(anchor); if (t) t.scrollIntoView(); }
    current = h;
    onScroll();
    document.dispatchEvent(new CustomEvent('pf:route', { detail: { view: view } }));
  }

  function wrapTables(root) {
    root.querySelectorAll('table').forEach(function (t) {
      if (t.parentNode.classList.contains('tw') || t.parentNode.classList.contains('tw-auto')) return;
      var w = document.createElement('div'); w.className = 'tw-auto'; t.parentNode.insertBefore(w, t); w.appendChild(t);
    });
  }
  function hydrateTabs(root) {
    wrapTables(root);
    root.querySelectorAll('[data-tabs]').forEach(function (tb) {
      if (tb.__init) return; tb.__init = true;
      var btns = Array.prototype.slice.call(tb.querySelector('.tablist').children);
      function sel(i, focus) {
        btns.forEach(function (b, k) {
          b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1;
          document.getElementById(b.getAttribute('aria-controls')).hidden = k !== i;
        });
        if (focus) btns[i].focus();
      }
      btns.forEach(function (b, i) {
        b.addEventListener('click', function () { sel(i); });
        b.addEventListener('keydown', function (e) {
          var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? btns.length - 1 : null;
          if (n === null) return; e.preventDefault(); sel((n + btns.length) % btns.length, true);
        });
      });
    });
  }
  function chain(i) {
    var out = document.getElementById('chain-out'); if (!out) return;
    var c = CHAIN[i];
    document.querySelectorAll('[data-act="chain"]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-i') === i)); });
    out.innerHTML = '<h4><span class="mono">' + c[0] + '</span> · ' + c[1] + '</h4><p>' + esc(c[2]) + '</p><p class="small"><a href="#studio.' + c[3] + '">See it in the ' + esc(art(c[3]).name) + ' →</a></p>';
  }

  /* ---------------- Modal and palette ---------------- */
  var modal = document.getElementById('modal'), modalBody = document.getElementById('modal-body'), lastFocus = null;
  function openModal(html) {
    lastFocus = document.activeElement;
    modalBody.innerHTML = html; modal.hidden = false; document.body.style.overflow = 'hidden';
    window.PFW.hydrate(modalBody); hydrateTabs(modalBody);
    var f = modalBody.querySelector('input, button, a, [tabindex="0"]') || modal.querySelector('.modal-close'); f.focus();
  }
  function closeModal() { if (modal.hidden) return; modal.hidden = true; document.body.style.overflow = ''; modalBody.innerHTML = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  modal.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(modal.querySelectorAll('a[href], button, input, select, [tabindex="0"]'), function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  function artifactPreview(id) {
    var a = art(id);
    openModal('<p class="kicker">' + a.kind + ' ' + badge('illustrative') + '</p><h2 id="modal-title">' + esc(a.name) + '</h2><p class="muted">' + esc(a.purpose) + '</p>' + tabs('pv-' + a.id, a.tabs) + '<div class="btn-row"><a class="btn" href="#studio.' + a.id + '" data-act="close-modal-nav">Open full artifact in the Studio</a></div>');
  }
  var INDEX = null;
  function buildIndex() {
    INDEX = [{ t: 'Page', n: 'Overview and 60-second summary', h: '#home', k: 'home executive summary contact' }, { t: 'Page', n: 'Skills Library', h: '#skills', k: '' }, { t: 'Page', n: 'Artifact Studio', h: '#studio', k: '' }, { t: 'Page', n: 'Decision scenarios', h: '#scenarios', k: '' }, { t: 'Page', n: 'Evidence map', h: '#evidence', k: 'skills evidence matrix' }]
      .concat(PF.skills.map(function (s) { return { t: 'Skill', n: s.name, h: '#skill.' + s.id, k: s.tags.join(' ') + ' ' + s.tools.join(' ') + ' ' + s.sum + ' ' + s.evNote + ' ' + strip(s.def + ' ' + s.scenario + ' ' + s.enterprise) }; }))
      .concat(PF.cases.map(function (c) { return { t: 'Case study', n: c.name, h: '#case.' + c.id, k: c.domain + ' ' + c.org + ' ' + c.lede + ' ' + c.facts.map(function (f) { return f[1]; }).join(' ') }; }))
      .concat(PF.artifacts.map(function (a) { return { t: 'Artifact', n: a.name, h: '#studio.' + a.id, k: a.kind + ' ' + a.purpose + ' ' + a.problem + ' ' + strip(a.tabs.map(function (t) { return t[1]; }).join(' ')).slice(0, 4000) }; }))
      .concat(PF.scenarios.map(function (s) { return { t: 'Scenario', n: s.name, h: '#scenario.' + s.id, k: s.situation }; }));
  }
  function openPalette() {
    if (!INDEX) buildIndex();
    openModal('<h2 id="modal-title" style="font-size:var(--t-lg)">Search the knowledge base</h2><label class="search" for="pal-q">' + SEARCH_ICON + '<input id="pal-q" class="palette-input" type="search" placeholder="Try: acceptance criteria, BharatKosh, KPI, migration" autocomplete="off" aria-label="Search" aria-controls="pal-res"></label><div class="palette-results" id="pal-res" role="listbox" aria-label="Results"></div><p class="small muted">Use the arrow keys and Enter to open. Escape closes.</p>');
    var q = document.getElementById('pal-q'), res = document.getElementById('pal-res'), active = 0;
    function draw() {
      var terms = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      var hits = INDEX.filter(function (r) { var hay = (r.n + ' ' + r.k + ' ' + r.t).toLowerCase(); return terms.every(function (t) { return hay.indexOf(t) > -1; }); })
        .sort(function (a, b) { var ta = terms[0] || ''; return (b.n.toLowerCase().indexOf(ta) > -1) - (a.n.toLowerCase().indexOf(ta) > -1); }).slice(0, 40);
      active = 0;
      res.innerHTML = hits.length ? hits.map(function (r, i) { return '<a href="' + r.h + '" role="option" data-act="close-modal-nav"' + (i === 0 ? ' class="active" aria-selected="true"' : '') + '><span class="t">' + r.t + '</span><span>' + esc(r.n) + '</span></a>'; }).join('') : '<p class="muted">No matches. Try a broader word.</p>';
    }
    q.addEventListener('input', draw);
    q.addEventListener('keydown', function (e) {
      var items = res.querySelectorAll('a'); if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); items[active].classList.remove('active'); items[active].removeAttribute('aria-selected');
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[active].classList.add('active'); items[active].setAttribute('aria-selected', 'true'); items[active].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') { e.preventDefault(); location.hash = items[active].getAttribute('href'); closeModal(); }
    });
    draw();
  }

  /* ---------------- Menu, theme, events ---------------- */
  var nav = document.getElementById('site-nav'), menuBtn = document.querySelector('[data-act="menu"]');
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  function themeCycle() {
    var root = document.documentElement, cur = root.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var nextT = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', nextT);
    try { localStorage.setItem('pf-theme', nextT); } catch (e) {}
    document.getElementById('theme-btn').setAttribute('aria-label', 'Switch to ' + (nextT === 'dark' ? 'light' : 'dark') + ' theme');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act], [data-f]'); if (!t) return;
    var act = t.getAttribute('data-act'), f = t.getAttribute('data-f');
    if (f === 'area' || f === 'ev') { lib[f] = t.getAttribute('data-v'); store('pf-lib', lib); t.parentNode.querySelectorAll('[data-f="' + f + '"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); }); drawLib(); return; }
    if (f === 'kind') { studioKind = t.getAttribute('data-v'); t.parentNode.querySelectorAll('[data-f="kind"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); }); document.getElementById('studio-grid').innerHTML = studioCards(); return; }
    if (f === 'evm') { evf.ev = t.getAttribute('data-v'); t.parentNode.querySelectorAll('[data-f="evm"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); }); drawEvidence(); return; }
    switch (act) {
      case 'menu': var o = !nav.classList.contains('open'); nav.classList.toggle('open', o); t.setAttribute('aria-expanded', String(o)); break;
      case 'theme': themeCycle(); break;
      case 'palette': e.preventDefault(); openPalette(); break;
      case 'close-modal': closeModal(); break;
      case 'close-modal-nav': closeModal(); break;
      case 'goto': var el = document.getElementById(t.getAttribute('data-target')); if (el) { el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } break;
      case 'jump': e.preventDefault(); var b = document.getElementById(t.getAttribute('data-target')); if (b) { b.open = true; b.scrollIntoView(); b.querySelector('summary').focus({ preventScroll: true }); } break;
      case 'chain': chain(+t.getAttribute('data-i')); break;
      case 'skip-intro': var hero = document.getElementById('hero'); if (hero) { window.scrollTo(0, hero.getBoundingClientRect().top + scrollY - 70); var h1 = document.getElementById('h-title'); h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); } break;
      case 'expand-all': var blocks = main.querySelectorAll('.blocks > details'), anyClosed = Array.prototype.some.call(blocks, function (d) { return !d.open; }); blocks.forEach(function (d) { d.open = anyClosed; }); t.textContent = anyClosed ? 'Collapse all' : 'Expand all'; break;
      case 'artifact-preview': artifactPreview(t.getAttribute('data-id')); break;
      case 'opt': showOption(t.getAttribute('data-sc'), t.getAttribute('data-o')); break;
      case 'lib-reset': lib = { q: '', area: 'all', ev: 'all' }; store('pf-lib', lib); route(); break;
      case 'copy':
        var txt = t.getAttribute('data-copy'), st = document.getElementById('copy-status');
        var fallback = function () { var r = document.createRange(); r.selectNodeContents(document.getElementById('email-text')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); st.textContent = 'Selected. Press Ctrl+C or Cmd+C to copy.'; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { st.textContent = 'Copied'; }, fallback); else fallback();
        break;
    }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'lib-q') { lib.q = e.target.value; store('pf-lib', lib); drawLib(); }
    if (e.target.id === 'ev-q') { evf.q = e.target.value; drawEvidence(); }
  });
  document.addEventListener('change', function (e) { if (e.target.id === 'ev-area') { evf.area = e.target.value; drawEvidence(); } });
  document.addEventListener('keydown', function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '');
    if ((e.key === '/' && !typing && modal.hidden) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); openPalette(); }
    if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
  });
  window.addEventListener('hashchange', route);

  /* ---------------- Reading progress as chainage ---------------- */
  var kmEl = document.getElementById('ch-km'), phEl = document.getElementById('ch-phase'), fillEl = document.getElementById('ch-fill'), sceneEl = document.querySelector('.scene'), ticking = false;
  var PHASES = ['Discover', 'Specify', 'Trace', 'Release'];
  /* Scroll offset where the pinned intro ends and the overview begins (0 when there is no animated intro). */
  function introBase() { var el = document.getElementById('intro'); return el && !el.classList.contains('is-static') ? el.offsetTop + el.offsetHeight - innerHeight : 0; }
  window.PFIntroBase = introBase;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      /* On the overview the chip counts from the end of the intro, and hides while the intro plays. */
      var b0 = document.body.getAttribute('data-route') === 'home' ? introBase() : 0;
      var max = Math.max(1, document.documentElement.scrollHeight - innerHeight - b0), p = Math.min(1, Math.max(0, (scrollY - b0) / max));
      document.getElementById('chainage').classList.toggle('is-hidden', b0 > 0 && scrollY < b0 - 2);
      var km = p * 12, whole = Math.floor(km), m = Math.round((km - whole) * 1000);
      if (m === 1000) { whole++; m = 0; }
      kmEl.textContent = 'km ' + whole + '+' + ('00' + m).slice(-3);
      phEl.textContent = PHASES[Math.min(3, Math.floor(p * 4))];
      fillEl.style.width = (p * 100).toFixed(1) + '%';
      if (document.body.getAttribute('data-route') === 'home') {
        var base = introBase(), past = scrollY - base;
        sceneEl.style.setProperty('--scene-o', past < 0 ? '0' : (Math.min(1, past / (innerHeight * 0.25) + 0.001) * (1 - 0.8 * Math.min(1, past / (innerHeight * 0.9)))).toFixed(3));
      }
      else sceneEl.style.removeProperty('--scene-o');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* Static fallback illustration for no-WebGL / blocked CDN. Deterministic, decorative. */
  (function fallbackArt() {
    var host = document.getElementById('scene-fallback'), cols = [5, 8, 11, 12, 6], s = '<svg viewBox="0 0 600 460" preserveAspectRatio="xMidYMid meet">', pts = [];
    cols.forEach(function (n, c) { pts[c] = []; for (var i = 0; i < n; i++) pts[c].push([70 + c * 115, 40 + (380 / (n - 1 || 1)) * i]); });
    for (var c = 1; c < cols.length; c++) pts[c].forEach(function (p, i) { var q = pts[c - 1][Math.floor(i * pts[c - 1].length / pts[c].length)]; s += '<line x1="' + q[0] + '" y1="' + q[1] + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="var(--ink-3)" stroke-opacity=".45" stroke-width="1"/>'; });
    var colours = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-1)'];
    pts.forEach(function (col, c) { col.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="' + colours[c] + '"/>'; }); });
    host.innerHTML = s + '</svg>';
  })();

  route();
})();
