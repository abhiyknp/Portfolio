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
    brief: ['ev-brief', 'Source-supported (project brief)'],
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
  function strip(html) { var d = document.createElement('div'); d.innerHTML = String(html).replace(/</g, ' <'); return (d.textContent || '').replace(/\s+/g, ' ').replace(/\s+([,.;:)])/g, '$1').trim(); }
  function clip(text, n) { if (text.length <= n) return text; var c = text.slice(0, n); c = c.slice(0, c.lastIndexOf(' ')); return c.replace(/[,;:.\s]+$/, '') + '…'; }
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
  function tabsHtml(id, items) {
    return '<div class="tabs" data-tabs><div class="tablist" role="tablist">' + items.map(function (t, i) {
      return '<button type="button" role="tab" id="' + id + '-t' + i + '" aria-controls="' + id + '-p' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + t[0] + '</button>';
    }).join('') + '</div>' + items.map(function (t, i) {
      return '<div role="tabpanel" id="' + id + '-p' + i + '" aria-labelledby="' + id + '-t' + i + '" tabindex="0"' + (i ? ' hidden' : '') + '>' + t[1] + '</div>';
    }).join('') + '</div>';
  }
  function block(n, title, body, open, ev, anchor) {
    return '<details class="block"' + (open ? ' open' : '') + (anchor ? ' id="' + anchor + '"' : '') + '><summary><span class="num">' + (n < 10 ? '0' + n : n) + '</span><h3>' + title + '</h3>' + (ev ? badge(ev) : '') + '</summary><div class="block-body"><div class="prose">' + body + '</div></div></details>';
  }

  /* ---------------- Home (executive view) ---------------- */
  var CASE_INSIDE = {
    rajmarg: ['Clickable end-to-end workflow', 'Requirements, stories and rules', 'Integrations: GIS, BharatKosh, eSign', 'UAT, risks and release'],
    datalake: ['Representative data-platform analysis', 'Lineage and reconciliation', 'Access and data quality', 'Clearly labelled scope'],
    healthcare: ['Appointment-to-billing workflow', 'Dashboards and SQL reporting', 'Privacy and access rules', 'Workshops and adoption'],
    'ats-vms': ['Requisition-to-offer workflow', 'Duplicate-candidate rule', 'JAD sessions and gap analysis', 'UAT cases']
  };
  function home() {
    var counts = { s: PF.skills.length, a: PF.artifacts.length, c: PF.cases.length, sc: PF.scenarios.length };
    return '<section class="intro intro-thread" id="intro" aria-label="Introduction"></section>' +
      '<div class="home" id="home-main"><svg class="home-thread" aria-hidden="true"><path class="t-bg"/><path class="t-fg"/></svg><div class="wrap">' +
      '<section class="h-hero" id="hero" data-node aria-labelledby="h-title">' +
        '<figure class="h-photo"><img src="assets/img/abhishek-yadav.webp" alt="Abhishek Yadav, Senior IT Business Analyst" width="560" height="700" fetchpriority="high"></figure>' +
        '<span class="h-status"><i></i> Open to Senior Business Analyst, Product Owner and Product Analyst roles</span>' +
        '<h1 id="h-title">Senior IT<br>Business <span>Analyst.</span></h1>' +
        '<p class="h-state">Turning complexity into clarity.</p>' +
        '<p class="lede" style="max-width:60ch">Seven years as the link between the people who need a system and the teams who build it, turning complex requirements into work they can build, test and release.</p>' +
        '<ul class="h-short" id="summary" aria-label="In short">' +
          '<li>Business Analyst for Digital India Corporation (MeitY): <strong>10+ workflow modules</strong> on the Rajmarg Pravesh portal, which cut highway permission approvals from months to <strong>45 days at most</strong>.</li>' +
          '<li>The full requirements set: BRD, FRD, SRS, RTM, user stories, acceptance criteria and process flows.</li>' +
          '<li>Before that: four years across a <strong>Healthcare Management System</strong> and <strong>ATS and VMS</strong> platforms.</li>' +
        '</ul>' +
        '<div class="btn-row"><button class="btn" type="button" data-act="goto" data-target="work">See my work</button><a class="btn ghost" href="assets/Abhishek_Yadav_Business_Analyst_Resume.pdf" download>Download résumé (PDF)</a></div>' +
        '<div class="glance" aria-label="At a glance">' +
          '<div><span class="v">7+ yrs</span><span class="l">Business analysis, from discovery to production support</span></div>' +
          '<div><span class="v">10+</span><span class="l">Workflow modules owned on Rajmarg Pravesh</span></div>' +
          '<div><span class="v">5</span><span class="l">Domains: government, enterprise, healthcare, HR, e-commerce</span></div>' +
        '</div>' +
      '</section>' +

      '<section id="work" data-node aria-labelledby="work-h">' +
        '<div class="h-head"><p class="kicker">01 · Selected work</p><h2 id="work-h">Complex systems. Clearer delivery.</h2><p>Four projects, each told in five short chapters, with workflows, requirements and test scenarios.</p></div>' +
        '<div class="h-cases">' + PF.cases.map(function (c) {
          return '<a class="h-case" href="#case.' + c.id + '"><span class="n">' + esc(c.domain) + ' · ' + c.period + '</span><h3>' + esc(c.name) + '</h3><p>' + esc(c.lede) + '</p><div class="inside">' + (CASE_INSIDE[c.id] || []).map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div><span class="go">Read the case study →</span></a>';
        }).join('') + '</div>' +
      '</section>' +

      '<section data-node aria-labelledby="how-h">' +
        '<div class="h-head"><p class="kicker">02 · How I work</p><h2 id="how-h">One request, followed all the way to release.</h2></div>' +
        '<div class="h-cards">' +
          '<div class="h-card"><span class="n">01 Discover</span><h3>Find the real problem</h3><p>Separate symptoms, causes and constraints before anyone proposes a feature.</p><span class="out">→ Problem statement · stakeholder map</span></div>' +
          '<div class="h-card"><span class="n">02 Specify</span><h3>Write what to build</h3><p>Numbered, testable requirements and the business rules behind them.</p><span class="out">→ BRD · FRD · SRS</span></div>' +
          '<div class="h-card"><span class="n">03 Deliver</span><h3>Keep the team moving</h3><p>Stories with acceptance criteria, refined and prioritised with stakeholders.</p><span class="out">→ Backlog · user stories</span></div>' +
          '<div class="h-card"><span class="n">04 Validate</span><h3>Prove it works</h3><p>Trace every requirement to a test, run UAT with real users, get sign-off.</p><span class="out">→ RTM · UAT · release notes</span></div>' +
        '</div>' +
        '<div class="h-ba"><h3>Before and after</h3><p class="muted">The same work, before and after analysis. Drag the handle across.</p>' + window.PFX.compareHtml() +
        '<a class="h-pz" href="#puzzle"><span class="kicker">Quick challenge · 2 min</span><strong>Try it yourself: put a shuffled process back in order.</strong><span class="go" aria-hidden="true">→</span></a></div>' +
      '</section>' +

      '<section data-node aria-labelledby="exp-h">' +
        '<div class="h-head"><p class="kicker">03 · Experience</p><h2 id="exp-h">Seven years, four teams.</h2></div>' +
        '<div class="h-exp">' +
          '<div><span class="when">Apr 2025 – now</span><div><h3>Ascra Technologies · Business Analyst</h3><p>Rajmarg Pravesh Portal and NHAI DataLake 3.0 for Digital India Corporation (MeitY): 10+ workflow modules, integrations, UAT, triage, release readiness.</p></div></div>' +
          '<div><span class="when">Apr 2021 – Apr 2025</span><div><h3>Intechglobe · Business Analyst</h3><p>Healthcare Management System: end-to-end business analysis, Scrum delivery, dashboards, workshops and training.</p></div></div>' +
          '<div><span class="when">Feb 2020 – Mar 2021</span><div><h3>Coditro · Business Analyst</h3><p>ATS and VMS: requirements, stories and acceptance criteria, JAD sessions, gap analysis, defect tracking.</p></div></div>' +
          '<div><span class="when">Mar 2019 – Feb 2020</span><div><h3>RTL Technologies · Business Development Analyst</h3><p>Client requirement analysis, proposals, market research and client presentations.</p></div></div>' +
        '</div>' +
        '<p class="small muted">M.S. Data Science, Chandigarh University · B.Tech Information Technology, AKTU · English and Hindi</p>' +
        '<div class="h-deeper"><p class="kicker">Go deeper</p><div class="h-deeper-links">' +
          '<a href="#skills"><strong>Skills Library</strong><span>' + counts.s + ' skills, with method, example and interview answers</span></a>' +
          '<a href="#studio"><strong>Artifact Studio</strong><span>' + counts.a + ' sample deliverables, BRD to release checklist</span></a>' +
          '<a href="#scenarios"><strong>Decision scenarios</strong><span>' + counts.sc + ' situations, with the reasoning behind each option</span></a>' +
          '<a href="#evidence"><strong>Evidence map</strong><span>Every skill mapped to a project and an artifact</span></a>' +
        '</div></div>' +
      '</section>' +

      '<section class="h-contact" id="contact" data-node aria-labelledby="ct-h">' +
        '<p class="kicker">04 · Let\'s talk</p><h2 id="ct-h">Clear requirements. Better delivery.</h2>' +
        '<p class="muted" style="max-width:56ch">Open to Senior Business Analyst, Product Owner and Product Analyst roles.</p>' +
        '<div class="copy-line" style="justify-content:center"><code id="email-text">ba.abhiy@gmail.com</code><button class="btn ghost" type="button" data-act="copy" data-copy="ba.abhiy@gmail.com">Copy email</button><span class="small muted" id="copy-status" aria-live="polite"></span></div>' +
        '<div class="btn-row" style="justify-content:center"><a class="btn" href="mailto:ba.abhiy@gmail.com">Email me</a><a class="btn ghost" href="assets/Abhishek_Yadav_Business_Analyst_Resume.pdf" download>Download résumé (PDF)</a><a class="btn ghost" href="https://www.linkedin.com/in/abhiyknp" target="_blank" rel="noopener">LinkedIn ↗</a></div>' +
      '</section>' +
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
  function sec(n, title, body, ev, anchor) {
    return '<section class="sec"' + (anchor ? ' id="' + anchor + '"' : '') + '><div class="sec-h">' + (n ? '<span class="num">' + (n < 10 ? '0' + n : n) + '</span>' : '') + '<h3>' + title + '</h3>' + (ev ? badge(ev) : '') + '</div><div class="prose">' + body + '</div></section>';
  }
  function skillView(id) {
    var s = skill(id); if (!s) return notFound();
    var idx = PF.skills.indexOf(s), prev = PF.skills[idx - 1], next = PF.skills[idx + 1];
    var a = art(s.artifact);
    var T = [
      ['Understand', [
        ['Definition', '<p>' + s.def + '</p>'],
        ['Why it matters', '<p>' + s.why + '</p>'],
        ['When to use it, and when not to', '<div class="two"><div><h4>Use it when</h4>' + list(s.use) + '</div><div><h4>Avoid or adapt when</h4>' + list(s.avoid) + '</div></div>']]],
      ['How I do it', [
        ['Step-by-step method', '<ol>' + s.steps.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>', 'recommended'],
        ['Realistic business scenario', '<p>' + s.scenario + '</p>', 'illustrative'],
        ['Enterprise software example', '<p>' + s.enterprise + '</p>', 'illustrative'],
        ['Sample inputs and outputs', '<div class="two"><div><h4>Inputs</h4>' + list(s.inputs) + '</div><div><h4>Outputs</h4>' + list(s.outputs) + '</div></div>']]],
      ['Proof and practice', [
        ['Example artifact', a ? '<p>' + esc(s.artifactNote) + '</p><p class="small muted"><strong>' + esc(a.name) + '</strong>: ' + esc(a.purpose) + '</p><div class="btn-row"><button class="btn" type="button" data-act="artifact-preview" data-id="' + a.id + '">Preview artifact</button><a class="btn ghost" href="#studio.' + a.id + '">Open in Artifact Studio</a></div>' : '', 'illustrative'],
        ['Common mistakes and how to avoid them', '<div class="mistakes">' + s.mistakes.map(function (m) { return '<div><p class="m">' + m[0] + '</p><p class="f">' + m[1] + '</p></div>'; }).join('') + '</div>'],
        ['Collaboration', '<dl class="collab">' + [['Business stakeholders', 'biz'], ['Designers', 'design'], ['Developers', 'dev'], ['Testers', 'qa'], ['Product owner / manager', 'pm']].map(function (r) { return s.collab[r[1]] && s.collab[r[1]] !== '-' ? '<div><dt>' + r[0] + '</dt><dd>' + s.collab[r[1]] + '</dd></div>' : ''; }).join('') + '</dl>'],
        ['Relevant tools', '<div class="chips">' + s.tools.map(function (t) { return '<span class="chip" style="cursor:default">' + esc(t) + '</span>'; }).join('') + '</div>'],
        ['Related skills and case studies', '<div class="chips">' + s.related.map(skillLink).join('') + '</div><div class="chips">' + s.cases.map(caseLink).join('') + '</div>']]],
      ['Interview', [
        ['Interview questions', '<div class="qa"><p class="q">' + esc(s.q.q) + '</p></div>' + (s.more.length ? '<p class="small muted">Follow-up questions to prepare:</p>' + list(s.more.map(esc)) : '')],
        ['Model answer', '<div class="qa"><p class="q">"' + esc(s.q.q) + '"</p><p>' + esc(s.q.a) + '</p></div>'],
        ['How I describe this without overstating', '<p>' + esc(s.honest) + '</p><p class="small muted">Evidence note: ' + esc(s.evNote) + '</p>']]]
    ];
    var n = 0;
    var panels = T.map(function (tab) { return [tab[0], '<div class="secs">' + tab[1].map(function (x) { n++; return sec(n, x[0], x[1], x[2]); }).join('') + '</div>']; });
    return '<div class="wrap page"><nav class="crumbs" aria-label="Breadcrumb"><a href="#skills">Skills Library</a><span aria-hidden="true">/</span><span>' + AREAS[s.area] + '</span></nav>' +
      '<header class="page-head"><p class="kicker"><span class="area-letter">' + s.area + '</span>' + AREAS[s.area] + '</p><h1 style="font-size:clamp(2.2rem,5.4vw,3.8rem)">' + esc(s.name) + '</h1><p class="lede">' + esc(s.sum) + '</p>' +
        '<div class="illus-flag">' + badge(s.ev) + '<span class="small muted">' + esc(s.evNote) + '</span></div></header>' +
      '<div class="skill-tabs">' + tabs('sk-' + s.id, panels) + '</div>' +
      '<nav class="pager" aria-label="More skills">' + (prev ? '<a class="btn ghost" href="#skill.' + prev.id + '">← ' + esc(prev.name) + '</a>' : '<span></span>') + (next ? '<a class="btn ghost" href="#skill.' + next.id + '">' + esc(next.name) + ' →</a>' : '') + '</nav></div>';
  }

  /* ---------------- Case studies ---------------- */
  var CHAPTERS = [
    ['The problem', 'Context, people, my role, goals', [0, 1, 2, 3]],
    ['Discovery', 'Before, pain points, how I found out', [4, 5, 6]],
    ['The solution', 'Requirements, stories, workflow, UX, data', [7, 8, 9, 10, 11]],
    ['Quality and delivery', 'Edge cases, UAT, risks, backlog, release', [12, 13, 14, 15, 16, 17]],
    ['Results and lessons', 'What to measure, what I learned', [18, 19]]
  ];
  function casesView() {
    return '<div class="wrap page"><header class="page-head"><p class="kicker">Case studies</p><h1 style="font-size:clamp(2.4rem,6vw,4.4rem)">Complex systems. Clearer delivery.</h1><p class="lede">Four projects from my résumé, each told in five chapters with workflows, requirements, stories, tests and backlog examples. Labels show what is documented and what is a realistic illustration.</p></header><div class="h-cases">' +
      PF.cases.map(function (c) { return '<a class="h-case" href="#case.' + c.id + '"><span class="n">' + esc(c.domain) + ' · ' + c.period + '</span><h3>' + esc(c.name) + '</h3><p>' + esc(c.lede) + '</p><div class="inside">' + (CASE_INSIDE[c.id] || []).map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div><span class="go">Read the case study →</span></a>'; }).join('') + '</div></div>';
  }
  function caseView(id) {
    var c = cs(id); if (!c) return notFound();
    var panels = CHAPTERS.map(function (ch, ci) {
      var body = '<div class="secs">' + ch[2].map(function (k) { return sec(k + 1, PF.caseTitles[k], c.sections[k].html, c.sections[k].ev, 'cs-' + k); }).join('') + '</div>' +
        '<div class="chap-foot"><span>Chapter ' + (ci + 1) + ' of ' + CHAPTERS.length + '</span>' + (CHAPTERS[ci + 1] ? '<button class="btn" type="button" data-act="next-chapter" data-i="' + (ci + 1) + '">Next: ' + CHAPTERS[ci + 1][0] + ' →</button>' : '<a class="btn ghost" href="#cases">All case studies</a>') + '</div>';
      return ['<b>Chapter ' + (ci + 1) + '</b><span>' + ch[0] + '</span><small>' + ch[1] + '</small>', body];
    });
    return '<div class="wrap page"><nav class="crumbs" aria-label="Breadcrumb"><a href="#cases">Case studies</a><span aria-hidden="true">/</span><span>' + esc(c.short) + '</span></nav>' +
      '<header class="page-head"><p class="kicker">' + esc(c.domain) + '</p><h1 style="font-size:clamp(2.4rem,6vw,4.6rem)">' + esc(c.name) + '</h1><p class="lede">' + esc(c.lede) + '</p><p class="small muted">' + esc(c.org) + ' · ' + c.period + '</p></header>' +
      '<section class="panel stack" aria-label="At a glance"><p class="kicker">At a glance · what the sources say</p><div class="facts">' + c.facts.map(function (f) { return '<div><span class="k">' + esc(f[0]) + '</span><span>' + esc(f[1]) + '</span>' + badge(f[2]) + '</div>'; }).join('') + '</div></section>' +
      '<div class="chapters" id="chapters">' + tabsHtml('ch-' + c.id, panels) + '</div>' +
      '<section class="panel stack" aria-label="Skills and artifacts"><p class="kicker">In this case study</p><div class="two"><div><h4 class="small muted">Skills applied (' + c.skills.length + ')</h4><div class="chips">' + c.skills.map(skillLink).join('') + '</div></div><div><h4 class="small muted">Sample artifacts (' + c.artifacts.length + ')</h4><div class="chips">' + c.artifacts.map(artLink).join('') + '</div></div></div></section></div>';
  }

  /* ---------------- Artifact Studio ---------------- */
  var STAGES = [
    ['Discover and align', 'Understand the problem and agree on decisions'],
    ['Specify', 'Describe exactly what to build'],
    ['Plan and build', 'Turn requirements into the team\'s work'],
    ['Test and trace', 'Prove it works and nothing is missing'],
    ['Release and measure', 'Ship safely and check the result']
  ];
  var META = {
    impact: [0, 'A list of everything a proposed change will affect, with an owner and an action for each.', 'Product owner, engineering lead, QA', 'For every change request'],
    minutes: [0, 'A short record of what was decided, by whom and why, and who does what next.', 'Everyone who attended, plus absent decision-makers', 'After every workshop or decision meeting'],
    sql: [0, 'Database queries that answer business questions directly from the data, such as where applications are stuck.', 'Business Analyst, product owner, reporting team', 'During discovery, testing and reporting'],
    brd: [1, 'The agreed statement of what the business needs and why, signed off before the build starts.', 'Sponsor, process owner, product owner', 'After discovery, before detailed design'],
    frd: [1, 'A table of exactly how the system must behave for each function, including errors and exceptions.', 'Developers, testers, designers', 'After the BRD is approved'],
    srs: [1, 'The complete specification of the system: functions, integrations, permissions and quality targets.', 'Architects, vendors, testers, auditors', 'For contracted or multi-team builds'],
    bpmn: [1, 'A diagram of who does what, in which order, including decisions and return paths.', 'Business, design, development and testing', 'During discovery and specification'],
    decision: [1, 'A grid that shows which outcome applies to every combination of conditions, so no case is missed.', 'Policy owners, developers, testers', 'Whenever several rules combine'],
    api: [1, 'A plain-language contract for how two systems talk: what is sent, what comes back, and what happens when something fails.', 'Developers, integration partners, testers', 'Before an integration is built'],
    story: [2, 'One small piece of work, written from the user\'s side, with the conditions it must meet to be accepted.', 'Developers, testers, product owner', 'In backlog refinement, before a sprint'],
    jira: [2, 'The team\'s ordered list of work (epics, stories and bugs) with the reason behind the order.', 'Scrum team, product owner', 'Every sprint'],
    confluence: [2, 'How the project\'s documents are organised, so anyone can find the current version.', 'The whole team and stakeholders', 'Set up at the start, used throughout'],
    rtm: [3, 'A table that links each business objective to its requirements, stories, tests and release, so nothing is lost.', 'Business Analyst, QA, product owner, auditors', 'Throughout the project; checked before UAT'],
    uat: [3, 'The plan, test cases and sign-off for business users to confirm the system works for their real tasks.', 'Business users, QA, product owner', 'Before each release'],
    defect: [3, 'A bug report with everything a developer needs to reproduce and fix the problem.', 'Testers, developers, the triage meeting', 'Whenever testing finds a problem'],
    release: [4, 'A checklist that confirms a release is ready: scope, quality, people, support and rollback.', 'Product owner, engineering, support', 'At the go/no-go meeting'],
    kpi: [4, 'Precise definitions of each measure on a dashboard, so everyone calculates it the same way.', 'Managers, analysts, product owner', 'Before building a dashboard, and when measuring outcomes']
  };
  function studioOrder() { var o = []; STAGES.forEach(function (_, k) { PF.artifacts.forEach(function (a) { if (META[a.id] && META[a.id][0] === k) o.push(a); }); }); return o; }
  function studioView() {
    return '<div class="wrap page"><header class="page-head"><p class="kicker">Artifact Studio</p><h1 style="font-size:clamp(2.4rem,6vw,4.4rem)">The documents behind the work.</h1>' +
      '<p class="lede">Examples of the documents a Business Analyst produces, in the order they appear in a project. Open any one to see the example, who uses it and what a good one looks like.</p></header>' +
      '<ol class="studio-how"><li><b>1</b>Pick a project stage below.</li><li><b>2</b>Open a document to see the full example.</li><li><b>3</b>Use the tabs to look at it from the business, functional, technical and testing sides.</li></ol>' +
      '<p class="note">Every example was written for this portfolio with invented IDs and sample data. None is a client document.</p>' +
      STAGES.map(function (st, k) {
        var items = PF.artifacts.filter(function (a) { return META[a.id] && META[a.id][0] === k; });
        return '<section class="stage-block" aria-labelledby="stg-' + k + '"><div class="stage-head"><span class="stage-n">Stage ' + (k + 1) + '</span><h2 id="stg-' + k + '">' + st[0] + '</h2><p>' + st[1] + '</p></div><div class="grid g3">' +
          items.map(function (a) { var m = META[a.id]; return '<a class="card" href="#studio.' + a.id + '"><h3>' + esc(a.name) + '</h3><p class="small">' + esc(m[1]) + '</p><p class="small muted"><b>Used by:</b> ' + esc(m[2]) + '</p><span class="card-foot"><span>Open the example</span><span aria-hidden="true">→</span></span></a>'; }).join('') +
          '</div></section>';
      }).join('') + '</div>';
  }
  function artifactView(id) {
    var a = art(id); if (!a) return notFound();
    var m = META[a.id] || [0, a.purpose, '', ''], order = studioOrder(), i = order.indexOf(a), prev = order[i - 1], next = order[i + 1];
    var users = PF.skills.filter(function (s) { return s.artifact === a.id; }).map(function (s) { return s.id; });
    var sk = a.skills.concat(users.filter(function (x) { return a.skills.indexOf(x) < 0; }));
    return '<div class="wrap page"><nav class="crumbs" aria-label="Breadcrumb"><a href="#studio">Artifact Studio</a><span aria-hidden="true">/</span><span>Stage ' + (m[0] + 1) + ': ' + STAGES[m[0]][0] + '</span></nav>' +
      '<header class="page-head"><p class="kicker">Stage ' + (m[0] + 1) + ' · ' + STAGES[m[0]][0] + ' ' + badge('illustrative') + '</p><h1 style="font-size:clamp(2.2rem,5.4vw,3.8rem)">' + esc(a.name) + '</h1><p class="lede">' + esc(m[1]) + '</p></header>' +
      '<div class="grid g3"><div class="panel stack"><h3 class="kicker">Why it exists</h3><p>' + esc(a.purpose) + '</p><p class="small muted"><b>Problem it solves:</b> ' + esc(a.problem) + '</p></div><div class="panel stack"><h3 class="kicker">Who uses it</h3><p>' + esc(m[2]) + '</p></div><div class="panel stack"><h3 class="kicker">When it is used</h3><p>' + esc(m[3]) + '</p></div></div>' +
      '<div class="read-tip"><b>How to read this example</b><span>' + esc(a.howto) + ' Switch between the tabs to see different views.</span></div>' +
      '<section class="stack" aria-label="The example"><h2 style="font-size:var(--t-xl)">The example</h2>' + tabs('art-' + a.id, a.tabs) + '</section>' +
      '<section class="panel stack"><h3 class="kicker">What a good one looks like</h3><ul class="check">' + a.good.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul></section>' +
      '<section class="two"><div class="stack"><h2 style="font-size:var(--t-lg)">Skills it demonstrates</h2><div class="chips">' + sk.map(skillLink).join('') + '</div></div><div class="stack"><h2 style="font-size:var(--t-lg)">Used in case studies</h2><div class="chips">' + a.cases.map(caseLink).join('') + '</div></div></section>' +
      '<nav class="pager" aria-label="More artifacts">' + (prev ? '<a class="btn ghost" href="#studio.' + prev.id + '">← ' + esc(prev.name) + '</a>' : '<span></span>') + (next ? '<a class="btn ghost" href="#studio.' + next.id + '">' + esc(next.name) + ' →</a>' : '') + '</nav></div>';
  }

  /* ---------------- Scenarios ---------------- */
  function scenariosView() {
    return '<div class="wrap page"><header class="page-head"><p class="kicker">Deep-dive · Decision scenarios</p><h1>Decision scenarios</h1><p class="lede">Business situations with several possible responses. Choose one to see the reasoning, rule, user experience, workflow and timing effect, acceptance criteria, tests and backlog items.</p><p class="note">Educational simulations. They are not descriptions of production behaviour on any project.</p></header>' +
      '<a class="h-pz" href="#puzzle"><span class="kicker">Quick challenge · 2 min</span><strong>Chaos to clarity: put a shuffled permission process back in order.</strong><span class="go" aria-hidden="true">→</span></a><div class="grid g3">' +
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
  /* Privacy notice, terms of use and accessibility statement (content in data/legal.js). */
  function legalView(key) {
    var d = PF.legal[key];
    return '<div class="wrap page legal"><header class="page-head"><p class="kicker">Site information</p><h1>' + d.title + '</h1><p class="lede">' + d.lede + '</p><p class="small muted">Last updated ' + PF.legal.updated + '</p></header>' +
      '<nav class="legal-toc" aria-label="On this page"><ol>' + d.sections.map(function (s, i) { return '<li><a href="#' + key + '" data-act="jump-sec" data-target="lg-' + i + '">' + s[0] + '</a></li>'; }).join('') + '</ol></nav>' +
      d.sections.map(function (s, i) { return '<section class="legal-sec" id="lg-' + i + '" aria-labelledby="lg-h-' + i + '"><h2 id="lg-h-' + i + '">' + s[0] + '</h2>' + s[1] + '</section>'; }).join('') +
      '<p class="legal-more small muted">Also see: ' + ['privacy', 'terms', 'accessibility'].filter(function (k) { return k !== key; }).map(function (k) { return '<a href="#' + k + '">' + PF.legal[k].title + '</a>'; }).join(' · ') + '</p></div>';
  }
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
      return '<tr><td><a href="#skill.' + s.id + '">' + esc(s.name) + '</a><span class="muted small">' + s.area + ' · ' + AREAS[s.area] + '</span></td><td>' + esc(s.sum) + '</td><td>' + esc(clip(strip(s.scenario), 160)) + ' ' + badge('illustrative') + '</td><td>' + (a ? '<a href="#studio.' + a.id + '">' + esc(a.name) + '</a>' : '') + '</td><td>' + s.cases.map(function (c) { var x = cs(c); return x ? '<a href="#case.' + x.id + '">' + esc(x.short) + '</a>' : ''; }).join(', ') + '</td><td>' + esc(s.q.q) + '</td><td>' + badge(s.ev) + '<span class="muted small" style="display:block;margin-top:.3rem">' + esc(s.evNote) + '</span></td></tr>';
    }).join('') + '</table>' : '<div class="empty">No skills match these filters.</div>';
  }

  function notFound() { return '<div class="wrap page"><h1>Page not found</h1><p>That link does not match a page. <a href="#home">Go to the overview</a> or press <span class="kbd">/</span> to search.</p></div>'; }

  /* ---------------- Router ---------------- */
  var current = '', navStack = [], scrollMemo = {};
  function pageLabel(h) {
    var p = h.split('.'), v = p[0], id = p.slice(1).join('.'), x;
    var L = { home: 'Overview', skills: 'Skills Library', cases: 'Case studies', studio: 'Artifact Studio', scenarios: 'Scenarios', evidence: 'Evidence map', puzzle: 'Process puzzle', stats: 'Visitor stats', privacy: 'Privacy notice', terms: 'Terms of use', accessibility: 'Accessibility statement' };
    if (v === 'skill' && (x = skill(id))) return x.name;
    if (v === 'case' && (x = cs(id))) return x.short;
    if (v === 'studio' && id && (x = art(id))) return x.name;
    if (v === 'scenario' && (x = byId(PF.scenarios, id))) return x.short;
    return L[v] || 'Overview';
  }
  function parentOf(h) { var v = h.split('.')[0]; return { skill: 'skills', case: 'cases', scenario: 'scenarios', puzzle: 'scenarios' }[v] || (v === 'studio' && h.indexOf('.') > -1 ? 'studio' : 'home'); }
  function route() {
    var h = decodeURIComponent(location.hash.slice(1)) || 'home';
    if (h === 'summary' || h === 'contact' || h === 'toggle-goatcounter') { h = 'home'; }
    /* Remember where the reader was, and whether this navigation goes back one step. */
    if (current) scrollMemo[current] = scrollY;
    var goingBack = navStack.length > 1 && navStack[navStack.length - 2] === h && current !== h;
    if (goingBack) navStack.pop(); else if (navStack[navStack.length - 1] !== h) navStack.push(h);
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
      case 'puzzle': html = window.PFX.puzzleView(); navKey = 'scenarios'; break;
      case 'stats': html = window.PFOwner.view(); navKey = 'stats'; break;
      case 'evidence': html = evidenceView(); break;
      case 'privacy': case 'terms': case 'accessibility': html = legalView(view); navKey = ''; break;
      default: html = notFound(); navKey = '';
    }
    closeModal();
    main.innerHTML = html;
    document.body.setAttribute('data-route', view === 'home' ? 'home' : 'page');
    document.querySelectorAll('[data-nav]').forEach(function (a) { if (a.getAttribute('data-nav') === navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    var h1 = main.querySelector('h1');
    document.title = view === 'home' ? 'Abhishek Yadav, Business Analyst' : (h1 ? h1.textContent + ' · ' : '') + 'Abhishek Yadav';
    window.PFW.hydrate(main); window.PFX.hydrate(main); window.PFOwner.hydrate(main); hydrateTabs(main);
    if (view === 'skills') { drawLib(); }
    if (view === 'evidence') { drawEvidence(); }
    if (stopIntro) { stopIntro(); stopIntro = null; }
    if (view === 'home') { mountIntro(); }
    layoutThread();
    closeMenu();
    if (view !== 'home') {
      var target = navStack.length > 1 ? navStack[navStack.length - 2] : parentOf(h), pg = main.querySelector('.page');
      if (pg) pg.insertAdjacentHTML('afterbegin', '<div class="back-row"><button class="back-btn" type="button" data-act="back" data-to="' + esc(target) + '">← Back to ' + esc(pageLabel(target)) + '</button></div>');
    }
    if (current !== h) {
      if (goingBack && scrollMemo[h] != null) { var y = scrollMemo[h]; window.scrollTo(0, y); requestAnimationFrame(function () { window.scrollTo(0, y); }); }
      else window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
    var anchor = decodeURIComponent(location.hash.slice(1));
    if (anchor === 'summary' || anchor === 'contact') { var t = document.getElementById(anchor); if (t) t.scrollIntoView(); }
    current = h;
    onScroll();
    document.dispatchEvent(new CustomEvent('pf:route', { detail: { view: view } }));
  }

  /* Home: thread intro and the gold thread that runs down the overview. */
  var stopIntro = null, threadLen = 0;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function setTb() { var hd = document.querySelector('.site-header'); document.documentElement.style.setProperty('--tb', (hd ? hd.offsetHeight : 64) + 'px'); }
  function mountIntro() {
    var host = document.getElementById('intro');
    if (!host || !window.PFIntros) return;
    host.classList.toggle('i-static', reduceMotion.matches);
    var skip = '<button class="i-skip" type="button" data-act="skip-intro">Skip intro</button>';
    host.innerHTML = '<section class="i-sec i-chaos"><div class="i-stage" role="img" aria-label="Animated introduction: stakeholder phrases fade away as four words form the line: Turning complexity into clarity.">' + skip + '</div></section>';
    stopIntro = window.PFIntros.chaos(host.querySelector('.i-chaos'), { sub: '<span class="i-name">That is the job.</span><span>Here is how I do it ↓</span>', fadeOut: true });
  }
  function layoutThread() {
    var home = document.getElementById('home-main'); if (!home) { threadLen = 0; return; }
    var svg = home.querySelector('.home-thread'), H = home.offsetHeight;
    svg.setAttribute('viewBox', '0 0 24 ' + H); svg.setAttribute('height', H); svg.style.height = H + 'px';
    var seg = (H - 80) / 14, d = 'M12 0 V40 ';
    for (var i = 0; i < 14; i++) { var y = 40 + seg * (i + 1); d += 'C ' + (i % 2 ? 2 : 22) + ' ' + (y - seg * 0.66).toFixed(1) + ', ' + (i % 2 ? 22 : 2) + ' ' + (y - seg * 0.33).toFixed(1) + ', 12 ' + y.toFixed(1) + ' '; }
    svg.querySelectorAll('path').forEach(function (p) { p.setAttribute('d', d); });
    var fg = svg.querySelector('.t-fg'); threadLen = fg.getTotalLength(); fg.style.strokeDasharray = threadLen;
    home.querySelectorAll('.node-dot').forEach(function (n) { n.remove(); });
    home.querySelectorAll('[data-node]').forEach(function (sct) { var dot = document.createElement('span'); dot.className = 'node-dot'; dot.style.top = (sct.offsetTop + 64) + 'px'; home.appendChild(dot); sct.__dot = dot; });
    drawThread();
  }
  function drawThread() {
    var home = document.getElementById('home-main'); if (!home || !threadLen) return;
    var r = home.getBoundingClientRect(), reach = innerHeight * 0.62 - r.top, p = Math.max(0, Math.min(1, reach / home.offsetHeight));
    home.querySelector('.t-fg').style.strokeDashoffset = reduceMotion.matches ? 0 : (threadLen * (1 - p)).toFixed(1);
    home.querySelectorAll('[data-node]').forEach(function (sct) { if (sct.__dot) sct.__dot.classList.toggle('on', reduceMotion.matches || sct.offsetTop + 64 < reach); });
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
    INDEX = [{ t: 'Page', n: 'Overview and 60-second summary', h: '#home', k: 'home executive summary contact' }, { t: 'Page', n: 'Skills Library', h: '#skills', k: '' }, { t: 'Page', n: 'Artifact Studio', h: '#studio', k: '' }, { t: 'Page', n: 'Decision scenarios', h: '#scenarios', k: '' }, { t: 'Page', n: 'Evidence map', h: '#evidence', k: 'skills evidence matrix' }, { t: 'Page', n: 'Process puzzle: chaos to clarity', h: '#puzzle', k: 'game challenge quick order workflow' }, { t: 'Page', n: 'Privacy notice', h: '#privacy', k: 'privacy data cookies goatcounter analytics' }, { t: 'Page', n: 'Terms of use', h: '#terms', k: 'terms conditions licence credits copyright' }, { t: 'Page', n: 'Accessibility statement', h: '#accessibility', k: 'accessibility wcag keyboard screen reader' }]
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
    var dark = cur !== 'light';
    var nextT = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', nextT);
    try { localStorage.setItem('pf-theme', nextT); } catch (e) {}
    document.getElementById('theme-btn').setAttribute('aria-label', 'Switch to ' + (nextT === 'dark' ? 'light' : 'dark') + ' theme');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act], [data-f]'); if (!t) return;
    var act = t.getAttribute('data-act'), f = t.getAttribute('data-f');
    if (f === 'area' || f === 'ev') { lib[f] = t.getAttribute('data-v'); store('pf-lib', lib); t.parentNode.querySelectorAll('[data-f="' + f + '"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); }); drawLib(); return; }
    if (f === 'evm') { evf.ev = t.getAttribute('data-v'); t.parentNode.querySelectorAll('[data-f="evm"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); }); drawEvidence(); return; }
    switch (act) {
      case 'menu': var o = !nav.classList.contains('open'); nav.classList.toggle('open', o); t.setAttribute('aria-expanded', String(o)); break;
      case 'theme': themeCycle(); break;
      case 'palette': e.preventDefault(); openPalette(); break;
      case 'close-modal': closeModal(); break;
      case 'close-modal-nav': closeModal(); break;
      case 'goto': var el = document.getElementById(t.getAttribute('data-target')); if (el) { el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } break;
      case 'jump': e.preventDefault(); var b = document.getElementById(t.getAttribute('data-target')); if (b) { b.open = true; b.scrollIntoView(); b.querySelector('summary').focus({ preventScroll: true }); } break;
      case 'jump-sec': e.preventDefault(); var sec = document.getElementById(t.getAttribute('data-target')); if (sec) { sec.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); var hh = sec.querySelector('h2'); hh.setAttribute('tabindex', '-1'); hh.focus({ preventScroll: true }); } break;
      case 'back': if (navStack.length > 1) history.back(); else location.hash = t.getAttribute('data-to'); break;
      case 'skip-intro': var hero = document.getElementById('hero'); if (hero) { window.scrollTo(0, hero.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tb')) || 64)); var h1 = document.getElementById('h-title'); h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); } break;
      case 'next-chapter': var tb2 = document.querySelectorAll('#chapters [role="tab"]')[+t.getAttribute('data-i')]; if (tb2) { tb2.click(); document.getElementById('chapters').scrollIntoView(); tb2.focus({ preventScroll: true }); } break;
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
  var kmEl = document.getElementById('ch-km'), phEl = document.getElementById('ch-phase'), fillEl = document.getElementById('ch-fill'), ticking = false;
  var PHASES = ['Discover', 'Specify', 'Trace', 'Release'];
  /* Scroll offset where the pinned intro ends and the overview begins (0 when there is no animated intro). */
  function introBase() {
    var el = document.getElementById('intro'); if (!el || el.classList.contains('is-static') || el.classList.contains('i-static')) return 0;
    var tb = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tb')) || 0;
    return el.getBoundingClientRect().top + scrollY + el.offsetHeight - (innerHeight - tb);
  }
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
      drawThread();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setTb(); layoutThread(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTb(); layoutThread(); });

  setTb();
  route();
})();
