/* Interactive widgets: swimlane flows, decision table, KPI dashboard, ERD. Hydrated after each route render. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function wrap(text, max) {
    var words = String(text).split(' '), lines = [], cur = '';
    words.forEach(function (w) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else { cur = (cur + ' ' + w).trim(); } });
    if (cur) lines.push(cur);
    return lines;
  }

  /* ---------- Swimlane flow ---------- */
  function renderFlow(host) {
    var def = PF.flows[host.getAttribute('data-flow')];
    if (!def) return;
    var id = 'f' + (++uid);
    var LW = 118, CW = 148, LH = 112, TW = 124, TH = 58, GD = 34, ER = 17;
    var cols = 0; def.nodes.forEach(function (n) { cols = Math.max(cols, n.col); });
    var W = LW + (cols + 1) * CW + 20, H = def.lanes.length * LH;
    var byId = {};
    def.nodes.forEach(function (n) {
      n.x = LW + n.col * CW + CW / 2; n.y = n.lane * LH + LH / 2 - 6;
      n.hw = n.kind === 'task' ? TW / 2 : n.kind === 'gateway' ? GD : ER;
      n.hh = n.kind === 'task' ? TH / 2 : n.kind === 'gateway' ? GD : ER;
      byId[n.id] = n;
    });
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="group" aria-label="' + esc(def.title) + '">';
    s += '<defs><marker id="' + id + 'a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L10 5L0 10z"/></marker>' +
         '<marker id="' + id + 'b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="arrowhead back" d="M0 0L10 5L0 10z"/></marker></defs>';
    def.lanes.forEach(function (l, i) {
      s += '<rect class="lane-bg' + (i % 2 ? ' alt' : '') + '" x="0" y="' + i * LH + '" width="' + W + '" height="' + LH + '"/>';
      s += '<line class="lane-line" x1="0" x2="' + W + '" y1="' + (i + 1) * LH + '" y2="' + (i + 1) * LH + '"/>';
      wrap(l, 14).forEach(function (t, k, arr) { s += '<text class="lane-label" x="12" y="' + (i * LH + LH / 2 - (arr.length - 1) * 7 + k * 14 + 4) + '">' + esc(t) + '</text>'; });
    });
    s += '<line class="lane-line" x1="' + (LW - 8) + '" x2="' + (LW - 8) + '" y1="0" y2="' + H + '"/>';
    def.edges.forEach(function (e) {
      var a = byId[e[0]], b = byId[e[1]], d, back = b.col < a.col || (b.col === a.col && b.lane < a.lane && a.kind === 'gateway' && e[2] && /missing|re-|no/.test(e[2])), lx, ly;
      if (b.col > a.col) {
        var mx = a.x + a.hw + (b.x - b.hw - a.x - a.hw) / 2;
        if (a.lane === b.lane) { d = 'M' + (a.x + a.hw) + ' ' + a.y + ' H' + (b.x - b.hw); lx = mx; ly = a.y - 7; }
        else { d = 'M' + (a.x + a.hw) + ' ' + a.y + ' H' + mx + ' V' + b.y + ' H' + (b.x - b.hw); lx = mx + 4; ly = a.y + (b.y > a.y ? 16 : -8); }
      } else if (b.col === a.col) {
        var up = b.y < a.y, off = back ? 14 : 0;
        d = 'M' + (a.x + off) + ' ' + (up ? a.y - a.hh : a.y + a.hh) + ' V' + (up ? b.y + b.hh : b.y - b.hh);
        lx = a.x + off + 6; ly = (a.y + b.y) / 2;
      } else {
        var below = b.lane > a.lane, same = a.lane === b.lane, sx = a.x - 12, tx = b.x - 12, yy;
        if (same) { yy = a.y + a.hh + 22; d = 'M' + sx + ' ' + (a.y + a.hh) + ' V' + yy + ' H' + tx + ' V' + (b.y + b.hh); }
        else if (below) { yy = b.y - b.hh - 16; d = 'M' + sx + ' ' + (a.y + a.hh) + ' V' + yy + ' H' + tx + ' V' + (b.y - b.hh); }
        else { yy = b.y + b.hh + 16; d = 'M' + sx + ' ' + (a.y - a.hh) + ' V' + yy + ' H' + tx + ' V' + (b.y + b.hh); }
        lx = (sx + tx) / 2; ly = yy - 5;
      }
      s += '<path class="edge' + (back ? ' back' : '') + '" d="' + d + '" marker-end="url(#' + id + (back ? 'b' : 'a') + ')"/>';
      if (e[2]) {
        var tw = e[2].length * 6.4 + 8;
        s += '<rect class="edge-label-bg" x="' + (lx - tw / 2) + '" y="' + (ly - 10) + '" width="' + tw + '" height="14" rx="2"/><text class="edge-label" text-anchor="middle" x="' + lx + '" y="' + ly + '">' + esc(e[2]) + '</text>';
      }
    });
    def.nodes.forEach(function (n) {
      s += '<g class="node ' + n.kind + '" tabindex="0" role="button" data-node="' + n.id + '" aria-label="' + esc(def.lanes[n.lane] + ': ' + n.label) + '">';
      if (n.kind === 'task') {
        s += '<rect class="shape" x="' + (n.x - TW / 2) + '" y="' + (n.y - TH / 2) + '" width="' + TW + '" height="' + TH + '" rx="8"/>';
        var ls = wrap(n.label, 19);
        ls.forEach(function (t, k) { s += '<text text-anchor="middle" x="' + n.x + '" y="' + (n.y - (ls.length - 1) * 7 + k * 14 + 4) + '">' + esc(t) + '</text>'; });
      } else {
        if (n.kind === 'gateway') s += '<path class="shape" d="M' + n.x + ' ' + (n.y - GD) + ' L' + (n.x + GD) + ' ' + n.y + ' L' + n.x + ' ' + (n.y + GD) + ' L' + (n.x - GD) + ' ' + n.y + 'Z"/><text text-anchor="middle" x="' + n.x + '" y="' + (n.y + 5) + '" style="font-weight:700">?</text>';
        else s += '<circle class="shape" cx="' + n.x + '" cy="' + n.y + '" r="' + ER + '"/>';
        var gl = wrap(n.label, 22), base = n.y + n.hh + 13;
        gl.forEach(function (t, k) { s += '<text text-anchor="middle" x="' + n.x + '" y="' + (base + k * 12.5) + '" style="font-size:10.5px">' + esc(t) + '</text>'; });
      }
      s += '</g>';
    });
    s += '</svg>';
    host.innerHTML = '<div class="flow"><div class="flow-legend"><span><i></i>Forward path</span><span><i class="back"></i>Return or exception path</span><span>Select a step for detail</span></div>' +
      '<div class="flow-scroll" tabindex="0" aria-label="Workflow diagram, scrolls sideways">' + s + '</div>' +
      '<div class="panel flow-detail" aria-live="polite"><p class="muted">Select any step to see the role, resulting status, business rule and related requirement. The model is illustrative.</p></div></div>';
    var detail = host.querySelector('.flow-detail');
    function show(nid) {
      var n = byId[nid];
      host.querySelectorAll('.node').forEach(function (g) { g.classList.toggle('sel', g.getAttribute('data-node') === nid); });
      detail.innerHTML = '<div class="illus-flag"><strong>' + esc(n.label) + '</strong><span class="ev ev-ill">Illustrative</span></div><dl>' +
        '<dt>Role</dt><dd>' + esc(def.lanes[n.lane]) + '</dd>' +
        '<dt>Step type</dt><dd>' + ({ start: 'Start event', end: 'End event', task: 'Task', gateway: 'Decision (gateway)' }[n.kind]) + '</dd>' +
        (n.status ? '<dt>Status</dt><dd>' + esc(n.status) + '</dd>' : '') +
        (n.rule ? '<dt>Rule</dt><dd>' + esc(n.rule) + '</dd>' : '') +
        (n.req ? '<dt>Requirement</dt><dd>' + esc(n.req) + '</dd>' : '') +
        (n.note ? '<dt>Detail</dt><dd>' + esc(n.note) + '</dd>' : '') + '</dl>';
    }
    host.querySelectorAll('.node').forEach(function (g) {
      g.addEventListener('click', function () { show(g.getAttribute('data-node')); });
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); show(g.getAttribute('data-node')); } });
    });
  }

  /* ---------- Decision table ---------- */
  var DT = {
    conds: [
      { id: 'a', label: 'All mandatory documents attached?', opts: ['Yes', 'No'] },
      { id: 'b', label: 'Document content valid on review?', opts: ['Valid', 'Invalid or illegible'] },
      { id: 'c', label: 'Eligibility under policy', opts: ['Eligible', 'Unclear', 'Not eligible'] }
    ],
    rules: [
      { id: 'R1', a: 'No', b: '–', c: '–', out: 'Block submission; list missing items', cls: 'block-out', rule: 'RULE-01', status: 'Draft (cannot submit)', clock: 'Not started' },
      { id: 'R2', a: 'Yes', b: '–', c: 'Not eligible', out: 'Reject with policy reason', cls: 'reject-out', rule: 'Policy eligibility; reason mandatory', status: 'Rejected (terminal)', clock: 'Stops' },
      { id: 'R3', a: 'Yes', b: 'Invalid or illegible', c: 'Eligible', out: 'Clarification: replace the named document', cls: '', rule: 'RULE-04, RULE-06', status: 'Clarification Raised', clock: 'Paused until response' },
      { id: 'R4', a: 'Yes', b: 'Invalid or illegible', c: 'Unclear', out: 'Clarification: replace document and provide evidence', cls: '', rule: 'RULE-04, RULE-06', status: 'Clarification Raised', clock: 'Paused until response' },
      { id: 'R5', a: 'Yes', b: 'Valid', c: 'Unclear', out: 'Clarification: additional evidence', cls: '', rule: 'RULE-04, RULE-06', status: 'Clarification Raised', clock: 'Paused until response' },
      { id: 'R6', a: 'Yes', b: 'Valid', c: 'Eligible', out: 'Proceed to inspection', cls: '', rule: '–', status: 'Inspection', clock: 'Running' }
    ]
  };
  function renderDecision(host) {
    var id = 'dt' + (++uid), state = { a: 'Yes', b: 'Invalid or illegible', c: 'Eligible' };
    function match(r) { return ['a', 'b', 'c'].every(function (k) { return r[k] === '–' || r[k] === state[k]; }); }
    function draw() {
      var hit = DT.rules.filter(match)[0];
      var t = '<div class="tw"><table class="dt-table"><tr><th>Condition / outcome</th>' + DT.rules.map(function (r) { return '<th class="' + (r === hit ? 'hit' : '') + '">' + r.id + '</th>'; }).join('') + '</tr>';
      DT.conds.forEach(function (c) { t += '<tr><td>' + c.label + '</td>' + DT.rules.map(function (r) { return '<td class="' + (r === hit ? 'hit' : '') + '">' + r[c.id] + '</td>'; }).join('') + '</tr>'; });
      t += '<tr><td><strong>Action</strong></td>' + DT.rules.map(function (r) { return '<td class="' + (r === hit ? 'hit' : '') + '">' + r.out + '</td>'; }).join('') + '</tr></table></div>';
      host.querySelector('.dt-out').innerHTML = '<div class="outcome ' + hit.cls + '" aria-live="polite"><div class="illus-flag"><strong>' + hit.id + ': ' + hit.out + '</strong><span class="ev ev-ill">Illustrative rule set</span></div><div class="small">Rule: ' + hit.rule + ' · Resulting status: ' + hit.status + ' · Authority clock: ' + hit.clock + '</div></div>' + t +
        '<p class="note">Rules are evaluated in order; R1 takes precedence (an incomplete application never reaches review). "–" means the condition does not matter. Each column is one test case.</p>';
    }
    host.innerHTML = '<div class="stack"><div class="dt-controls">' + DT.conds.map(function (c) {
      return '<div class="field"><label for="' + id + c.id + '">' + c.label + '</label><select id="' + id + c.id + '" data-k="' + c.id + '">' + c.opts.map(function (o) { return '<option' + (state[c.id] === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></div>';
    }).join('') + '</div><div class="dt-out stack"></div></div>';
    host.querySelectorAll('select').forEach(function (sel) { sel.addEventListener('change', function () { state[sel.getAttribute('data-k')] = sel.value; draw(); }); });
    draw();
  }

  /* ---------- KPI dashboard (sample data) ---------- */
  var KPI = {
    stages: ['Scrutiny', 'Inspection', 'Recommendation', 'Approval', 'Payment verification'],
    median: { excl: [4.5, 6.0, 2.0, 3.0, 1.5], incl: [9.5, 6.0, 2.0, 3.0, 1.5] },
    mean: { excl: [6.8, 8.1, 2.6, 4.2, 2.9], incl: [14.2, 8.1, 2.6, 4.2, 2.9] },
    ageing: [['0–7 days', 142], ['8–15', 96], ['16–30', 71], ['31–60', 38], ['60+', 17]]
  };
  function barsH(labels, values, unit, maxV) {
    var W = 460, rowH = 30, L = 150, R = 52, H = labels.length * rowH + 26;
    var max = maxV || Math.max.apply(null, values), ticks = [], step = max > 12 ? 5 : 2;
    for (var t = 0; t <= max; t += step) ticks.push(t);
    var x = function (v) { return L + (W - L - R) * v / max; };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Bar chart">';
    ticks.forEach(function (t) { s += '<line class="grid-line" x1="' + x(t) + '" x2="' + x(t) + '" y1="0" y2="' + (H - 22) + '"/><text class="axis-label" text-anchor="middle" x="' + x(t) + '" y="' + (H - 6) + '">' + t + '</text>'; });
    labels.forEach(function (l, i) {
      var y = i * rowH + 6, w = Math.max(2, x(values[i]) - L);
      s += '<text class="axis-label" x="' + (L - 8) + '" y="' + (y + 13) + '" text-anchor="end">' + esc(l) + '</text>';
      s += '<rect class="bar-hit" x="' + L + '" y="' + (y - 4) + '" width="' + (W - L) + '" height="' + rowH + '" data-tip="' + esc(l + ': ' + values[i] + ' ' + unit) + '"/>';
      s += '<path class="bar" d="M' + L + ' ' + y + ' H' + (L + w - 4) + ' Q' + (L + w) + ' ' + y + ' ' + (L + w) + ' ' + (y + 4) + ' V' + (y + 14) + ' Q' + (L + w) + ' ' + (y + 18) + ' ' + (L + w - 4) + ' ' + (y + 18) + ' H' + L + 'Z"/>';
      s += '<text class="val-label" x="' + (L + w + 6) + '" y="' + (y + 13) + '">' + values[i] + '</text>';
    });
    return s + '</svg>';
  }
  function barsV(pairs, unit) {
    var W = 460, H = 220, B = 28, T = 16, L = 34, max = 160;
    var y = function (v) { return T + (H - B - T) * (1 - v / max); };
    var bw = (W - L) / pairs.length;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Column chart of open applications by age">';
    [0, 40, 80, 120, 160].forEach(function (t) { s += '<line class="grid-line" x1="' + L + '" x2="' + W + '" y1="' + y(t) + '" y2="' + y(t) + '"/><text class="axis-label" x="' + (L - 6) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + t + '</text>'; });
    pairs.forEach(function (p, i) {
      var x0 = L + i * bw + bw * 0.22, w = bw * 0.56, top = y(p[1]), base = y(0);
      s += '<rect class="bar-hit" x="' + (L + i * bw) + '" y="' + T + '" width="' + bw + '" height="' + (H - B - T) + '" data-tip="' + esc(p[0] + ': ' + p[1] + ' ' + unit) + '"/>';
      s += '<path class="bar' + (i >= 3 ? ' alt' : '') + '" d="M' + x0 + ' ' + base + ' V' + (top + 4) + ' Q' + x0 + ' ' + top + ' ' + (x0 + 4) + ' ' + top + ' H' + (x0 + w - 4) + ' Q' + (x0 + w) + ' ' + top + ' ' + (x0 + w) + ' ' + (top + 4) + ' V' + base + 'Z"/>';
      s += '<text class="val-label" text-anchor="middle" x="' + (x0 + w / 2) + '" y="' + (top - 5) + '">' + p[1] + '</text>';
      s += '<text class="axis-label" text-anchor="middle" x="' + (x0 + w / 2) + '" y="' + (H - 8) + '">' + esc(p[0]) + '</text>';
    });
    return s + '</svg>';
  }
  function tipify(box) {
    var tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; box.appendChild(tip);
    box.addEventListener('mousemove', function (ev) {
      var t = ev.target.closest && ev.target.closest('[data-tip]');
      if (!t) { tip.hidden = true; return; }
      var r = box.getBoundingClientRect();
      tip.textContent = t.getAttribute('data-tip'); tip.hidden = false;
      tip.style.left = Math.min(r.width - 60, Math.max(60, ev.clientX - r.left)) + 'px'; tip.style.top = (ev.clientY - r.top) + 'px';
    });
    box.addEventListener('mouseleave', function () { tip.hidden = true; });
  }
  function renderKpi(host) {
    var id = 'k' + (++uid), st = { incl: false, mean: false };
    host.innerHTML = '<div class="stack"><div class="toggle-row"><span class="sample-flag">Sample data · not project results</span>' +
      '<label class="switch" for="' + id + 'i"><input type="checkbox" id="' + id + 'i"> Include applicant clarification time</label>' +
      '<label class="switch" for="' + id + 'm"><input type="checkbox" id="' + id + 'm"> Use mean instead of median</label></div>' +
      '<div class="kpi-tiles"></div><div class="charts"><div class="chart" id="' + id + 'c1"></div><div class="chart" id="' + id + 'c2"></div></div>' +
      '<div class="kpi-note note" aria-live="polite"></div>' +
      '<details class="block"><summary><h3>Show the chart data as a table</h3></summary><div class="block-body kpi-table"></div></details></div>';
    var c1 = host.querySelector('#' + id + 'c1'), c2 = host.querySelector('#' + id + 'c2');
    tipify(c1); tipify(c2);
    var total = KPI.ageing.reduce(function (a, p) { return a + p[1]; }, 0);
    c2.insertAdjacentHTML('afterbegin', '<h4>Open applications by age (KPI-02)</h4><div class="small muted">Count of open applications by days since submission. Older buckets in yellow.</div>' + barsV(KPI.ageing, 'applications'));
    function draw() {
      var vals = KPI[st.mean ? 'mean' : 'median'][st.incl ? 'incl' : 'excl'];
      var sum = Math.round(vals.reduce(function (a, b) { return a + b; }, 0) * 10) / 10;
      host.querySelector('.kpi-tiles').innerHTML =
        '<div class="tile"><span class="l">Open applications</span><span class="v">' + total + '</span><span class="d">KPI-01 · snapshot · sample</span></div>' +
        '<div class="tile"><span class="l">' + (st.incl ? 'Total elapsed' : 'Authority') + ' time, sum of stage ' + (st.mean ? 'means' : 'medians') + '</span><span class="v">' + sum + ' d</span><span class="d">KPI-03 variant · sample</span></div>' +
        '<div class="tile"><span class="l">First-review clarification rate</span><span class="v">31%</span><span class="d">KPI-04 · month · sample</span></div>' +
        '<div class="tile"><span class="l">Over 30 days old</span><span class="v">' + (38 + 17) + '</span><span class="d">KPI-02 · snapshot · sample</span></div>';
      c1.querySelectorAll('h4, .small, svg').forEach(function (n) { n.remove(); });
      c1.insertAdjacentHTML('afterbegin', '<h4>' + (st.mean ? 'Mean' : 'Median') + ' days in stage (KPI-03)</h4><div class="small muted">' + (st.incl ? 'Includes time waiting on applicant clarification responses.' : 'Authority time only; clarification pauses excluded per the agreed rule.') + '</div>' + barsH(KPI.stages, vals, 'days', 15));
      host.querySelector('.kpi-note').innerHTML = st.incl || st.mean
        ? '<strong>This view can mislead.</strong> ' + (st.incl ? 'Scrutiny looks twice as slow because applicant waiting time is counted against the authority. ' : '') + (st.mean ? 'Means are pulled up by a few very old files; medians describe the typical file better.' : '')
        : '<strong>Recommended definition:</strong> authority-side median per stage, with applicant time reported separately. Toggle the options to see how definitions change the story.';
      host.querySelector('.kpi-table').innerHTML = '<div class="tw"><table class="num"><tr><th>Stage</th><th>Median excl.</th><th>Median incl.</th><th>Mean excl.</th><th>Mean incl.</th></tr>' +
        KPI.stages.map(function (s, i) { return '<tr><td>' + s + '</td><td>' + KPI.median.excl[i] + '</td><td>' + KPI.median.incl[i] + '</td><td>' + KPI.mean.excl[i] + '</td><td>' + KPI.mean.incl[i] + '</td></tr>'; }).join('') +
        '</table></div><div class="tw"><table class="num"><tr><th>Age bucket</th><th>Open applications</th></tr>' + KPI.ageing.map(function (p) { return '<tr><td>' + p[0] + '</td><td>' + p[1] + '</td></tr>'; }).join('') + '</table></div>';
    }
    host.querySelector('#' + id + 'i').addEventListener('change', function (e) { st.incl = e.target.checked; draw(); });
    host.querySelector('#' + id + 'm').addEventListener('change', function (e) { st.mean = e.target.checked; draw(); });
    draw();
  }

  /* ---------- ERD ---------- */
  function renderErd(host) {
    var E = [
      { n: 'users', x: 20, y: 30, f: [['PK', 'user_id'], ['', 'role'], ['', 'name'], ['', 'mobile']] },
      { n: 'applications', x: 270, y: 20, f: [['PK', 'app_id'], ['FK', 'applicant_id'], ['', 'app_type'], ['', 'highway_no'], ['', 'chainage_from_km'], ['', 'chainage_to_km'], ['', 'status'], ['', 'submitted_at']] },
      { n: 'documents', x: 540, y: 20, f: [['PK', 'doc_id'], ['FK', 'app_id'], ['', 'doc_type'], ['', 'version'], ['', 'valid_to'], ['', 'verification_status']] },
      { n: 'workflow_history', x: 20, y: 230, f: [['PK', 'hist_id'], ['FK', 'app_id'], ['', 'from_status'], ['', 'to_status'], ['FK', 'actor_id'], ['', 'acted_at'], ['', 'remarks']] },
      { n: 'payments', x: 540, y: 220, f: [['PK', 'payment_id'], ['FK', 'app_id'], ['', 'amount'], ['', 'status'], ['', 'gateway_ref'], ['', 'paid_at']] },
      { n: 'inspections', x: 290, y: 280, f: [['PK', 'insp_id'], ['FK', 'app_id'], ['FK', 'inspector_id'], ['', 'scheduled_on'], ['', 'result']] }
    ];
    var w = 190, rh = 17, s = '<svg viewBox="0 0 760 420" width="760" height="420" role="img" aria-label="Illustrative entity relationship diagram">';
    var box = {}; E.forEach(function (e) { box[e.n] = { x: e.x, y: e.y, h: 24 + e.f.length * rh + 6 }; });
    var rels = [['users', 'applications', 'r'], ['applications', 'documents', 'r'], ['applications', 'workflow_history', 'b'], ['applications', 'payments', 'r'], ['applications', 'inspections', 'b'], ['users', 'workflow_history', 'b']];
    rels.forEach(function (r) {
      var a = box[r[0]], b = box[r[1]], x1, y1, x2, y2;
      if (r[2] === 'r') { x1 = a.x + w; y1 = a.y + 34; x2 = b.x; y2 = b.y + 34; }
      else { x1 = a.x + w / 2 + (r[0] === 'users' ? -30 : 0); y1 = a.y + a.h; x2 = b.x + w / 2 + (r[1] === 'inspections' ? 0 : 30); y2 = b.y; if (r[1] === 'workflow_history' && r[0] === 'applications') { x1 = a.x + 30; x2 = b.x + w - 30; } }
      var mid = r[2] === 'r' ? 'M' + x1 + ' ' + y1 + ' C' + (x1 + 40) + ' ' + y1 + ' ' + (x2 - 40) + ' ' + y2 + ' ' + x2 + ' ' + y2 : 'M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + (y1 + 30) + ' ' + x2 + ' ' + (y2 - 30) + ' ' + x2 + ' ' + y2;
      s += '<path class="rel" d="' + mid + '"/>';
      s += '<text class="card-l" x="' + (x1 + (r[2] === 'r' ? 4 : 6)) + '" y="' + (y1 + (r[2] === 'r' ? -4 : 14)) + '">1</text><text class="card-l" x="' + (x2 + (r[2] === 'r' ? -14 : 6)) + '" y="' + (y2 + (r[2] === 'r' ? -4 : -4)) + '">N</text>';
    });
    E.forEach(function (e) {
      var h = box[e.n].h;
      s += '<rect class="ent" x="' + e.x + '" y="' + e.y + '" width="' + w + '" height="' + h + '" rx="4"/><path class="ent-h" d="M' + (e.x + 4) + ' ' + e.y + ' H' + (e.x + w - 4) + ' Q' + (e.x + w) + ' ' + e.y + ' ' + (e.x + w) + ' ' + (e.y + 4) + ' V' + (e.y + 22) + ' H' + e.x + ' V' + (e.y + 4) + ' Q' + e.x + ' ' + e.y + ' ' + (e.x + 4) + ' ' + e.y + 'Z"/>';
      s += '<text class="ent-t" x="' + (e.x + 10) + '" y="' + (e.y + 15) + '">' + e.n + '</text>';
      e.f.forEach(function (f, i) { var yy = e.y + 38 + i * rh; if (f[0]) s += '<text class="ent-k" x="' + (e.x + 8) + '" y="' + yy + '">' + f[0] + '</text>'; s += '<text class="ent-f" x="' + (e.x + 34) + '" y="' + yy + '">' + f[1] + '</text>'; });
    });
    host.innerHTML = '<div class="erd stack"><div class="flow-scroll" tabindex="0" aria-label="Entity relationship diagram, scrolls sideways">' + s + '</svg></div><p class="small muted">PK = primary key; FK = foreign key; 1 to N = one row relates to many. workflow_history stores every status change, so timing questions use history rather than the current status.</p></div>';
  }

  window.PFW = {
    hydrate: function (root) {
      root.querySelectorAll('[data-flow]').forEach(renderFlow);
      root.querySelectorAll('[data-widget="decision"]').forEach(renderDecision);
      root.querySelectorAll('[data-widget="kpi"]').forEach(renderKpi);
      root.querySelectorAll('[data-widget="erd"]').forEach(renderErd);
    }
  };
})();
