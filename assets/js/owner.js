/* Owner view (#stats): visitor numbers from the GoatCounter API, styled like the rest of the site.
   Not linked anywhere. It stays locked until the owner enters a GoatCounter API key with "Read statistics"
   permission; the key is kept only in that browser (localStorage) and is sent only to GoatCounter. */
(function () {
  'use strict';
  var SITE = 'https://abhiyknp.goatcounter.com', KEY = 'pf-owner-gc';
  var RANGES = [['1', 'Today'], ['7', '7 days'], ['30', '30 days'], ['90', '90 days']];
  var EVENTS = { 'resume-download': 'Résumé downloaded', 'email-click': 'Email link clicked', 'email-copy': 'Email address copied', 'linkedin-click': 'LinkedIn opened', 'compare-used': 'Before/after slider used', 'puzzle-solved': 'Puzzle solved' };
  var state = { days: '7', data: null, error: '', loading: false };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function getKey() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function setKey(v) { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) {} }
  function fmt(n) { return Number(n || 0).toLocaleString('en-IN'); }
  function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function cnt(x) { return x.count != null ? x.count : (x.count_unique || 0); }

  /* Friendly names for counted paths: /case/rajmarg → "Case study: Rajmarg Pravesh Portal". */
  function pageName(path) {
    var p = String(path || '').replace(/^\//, '').split('/'), v = p[0], id = p.slice(1).join('/');
    var find = function (list) { return (list || []).filter(function (x) { return x.id === id; })[0]; };
    var x;
    if (v === 'home' || v === '') return 'Overview';
    if (v === 'skills') return 'Skills Library';
    if (v === 'cases') return 'Case studies';
    if (v === 'scenarios') return 'Scenarios';
    if (v === 'evidence') return 'Evidence map';
    if (v === 'puzzle') return 'Process puzzle';
    if (v === 'studio') return id && (x = find(PF.artifacts)) ? 'Artifact: ' + x.name : 'Artifact Studio';
    if (v === 'skill' && (x = find(PF.skills))) return 'Skill: ' + x.name;
    if (v === 'case' && (x = find(PF.cases))) return 'Case study: ' + x.name;
    if (v === 'scenario' && (x = find(PF.scenarios))) return 'Scenario: ' + x.short;
    return path;
  }

  function view() {
    return '<div class="wrap page owner"><header class="page-head"><p class="kicker">Owner view · private</p><h1>Visitor stats</h1>' +
      '<p class="lede">Who is reading the portfolio, what they open and what they do next. Only visible on a device where you have unlocked it.</p></header>' +
      '<div id="owner"></div></div>';
  }

  function draw() {
    var host = document.getElementById('owner'); if (!host) return;
    if (!getKey()) {
      host.innerHTML = '<form class="panel owner-lock" id="owner-form" autocomplete="off">' +
        '<h2>Locked</h2><p class="muted">Enter your GoatCounter API key to see the numbers on this device. The key is stored only in this browser and sent only to GoatCounter.</p>' +
        '<label for="owner-key" class="small">GoatCounter API key</label><input id="owner-key" type="password" spellcheck="false" autocapitalize="off" required>' +
        '<div class="btn-row"><button class="btn" type="submit">Unlock</button></div>' +
        (state.error ? '<p class="owner-err" role="alert">' + state.error + '</p>' : '') +
        '<details class="small"><summary>How to get a key</summary><ol><li>Open <a href="' + SITE + '" target="_blank" rel="noopener">your GoatCounter dashboard</a> and sign in.</li><li>Go to Settings → API → New API key.</li><li>Tick only <b>Read statistics</b>, create the key and copy it here.</li></ol></details></form>';
      return;
    }
    var d = state.data;
    var head = '<div class="owner-bar"><div class="chips" role="group" aria-label="Date range">' + RANGES.map(function (r) {
        return '<button class="chip" type="button" data-act="own-range" data-v="' + r[0] + '" aria-pressed="' + (state.days === r[0]) + '">' + r[1] + '</button>';
      }).join('') + '</div><div class="btn-row"><button class="btn ghost" type="button" data-act="own-refresh">Refresh</button><a class="btn ghost" href="' + SITE + '" target="_blank" rel="noopener">Full dashboard ↗</a><button class="btn ghost" type="button" data-act="own-lock">Lock</button></div></div>';
    if (state.error) { host.innerHTML = head + '<p class="owner-err" role="alert">' + state.error + '</p>'; return; }
    if (state.loading || !d) { host.innerHTML = head + '<p class="muted" role="status">Loading…</p>'; return; }

    var pages = d.hits.filter(function (h) { return !h.event; }), events = d.hits.filter(function (h) { return h.event; });
    var ev = function (name) { var h = events.filter(function (e) { return e.path === name; })[0]; return h ? cnt(h) : 0; };
    var contact = ev('email-click') + ev('email-copy') + ev('linkedin-click');
    var views = pages.reduce(function (s, h) { return s + cnt(h); }, 0);
    var tiles = [
      [fmt(d.total), 'Visitors', 'Unique visitors in the period'],
      [fmt(views), 'Page visits', 'Visitors per page, added up'],
      [fmt(ev('resume-download')), 'Résumé downloads', 'The strongest signal of interest'],
      [fmt(contact), 'Contact clicks', 'Email, copy email and LinkedIn'],
      [fmt(ev('puzzle-solved')), 'Puzzles solved', fmt(ev('compare-used')) + ' used the before/after slider']
    ];
    host.innerHTML = head +
      '<p class="small muted">' + esc(d.label) + ' · updated ' + d.at + '</p>' +
      '<div class="owner-tiles">' + tiles.map(function (t) { return '<div class="owner-tile"><span class="l">' + t[1] + '</span><span class="v">' + t[0] + '</span><span class="small muted">' + t[2] + '</span></div>'; }).join('') + '</div>' +
      '<section class="panel owner-sec"><h2>Visitors per day</h2>' + daily(d.daily) + '</section>' +
      '<div class="owner-grid">' +
        ranked('Most-read pages', pages.map(function (h) { return [pageName(h.path), cnt(h)]; }), 'No page visits yet.') +
        ranked('Actions', events.map(function (h) { return [EVENTS[h.path] || h.title || h.path, cnt(h)]; }), 'No downloads or clicks yet.') +
        ranked('Where visitors came from', d.refs.map(function (r) { return [r.name || 'Direct or unknown', cnt(r)]; }), 'No sources yet.') +
        ranked('Countries', d.locations.map(function (r) { return [r.name || 'Unknown', cnt(r)]; }), 'No locations yet.') +
        ranked('Screen size', d.sizes.map(function (r) { return [r.name || 'Unknown', cnt(r)]; }), 'No data yet.') +
        ranked('Browsers', d.browsers.map(function (r) { return [r.name || 'Unknown', cnt(r)]; }), 'No data yet.') +
        ranked('Operating systems', d.systems.map(function (r) { return [r.name || 'Unknown', cnt(r)]; }), 'No data yet.') +
      '</div>' +
      '<p class="small muted">Your own visits are not counted on a device where this page is unlocked.</p>';
  }

  /* Ranked list: label, a bar scaled to the largest value, and the number. */
  function ranked(title, rows, empty) {
    rows = rows.filter(function (r) { return r[1] > 0; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10);
    var max = rows.reduce(function (m, r) { return Math.max(m, r[1]); }, 0);
    return '<section class="panel owner-sec"><h2>' + title + '</h2>' + (rows.length ? '<ol class="owner-rank">' + rows.map(function (r) {
      return '<li><span class="n">' + esc(r[0]) + '</span><span class="b" aria-hidden="true"><i style="width:' + Math.max(2, r[1] / max * 100).toFixed(1) + '%"></i></span><span class="c">' + fmt(r[1]) + '</span></li>';
    }).join('') + '</ol>' : '<p class="small muted">' + empty + '</p>') + '</section>';
  }

  /* Daily visitors as columns, with a hover readout and a table for screen readers. */
  function daily(rows) {
    if (!rows.length) return '<p class="small muted">No visits yet.</p>';
    var max = Math.max(1, rows.reduce(function (m, r) { return Math.max(m, r[1]); }, 0)), n = rows.length;
    var W = 720, H = 180, gap = n > 45 ? 1 : 2, bw = (W - gap * (n - 1)) / n, s = '', yl = '';
    var nice = Math.max(1, Math.ceil(max / 4)), top = nice * 4;
    for (var g = 0; g <= 4; g++) { var y = H - (g * nice / top) * H; s += '<line class="og" x1="0" x2="' + W + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>'; yl += '<span style="top:' + (y / H * 100).toFixed(2) + '%">' + fmt(g * nice) + '</span>'; }
    rows.forEach(function (r, i) {
      var h = r[1] / top * H, x = i * (bw + gap);
      s += '<g class="ob" data-tip="' + esc(label(r[0]) + ': ' + fmt(r[1]) + ' visitor' + (r[1] === 1 ? '' : 's')) + '"><rect class="hit" x="' + x.toFixed(1) + '" y="0" width="' + (bw + gap).toFixed(1) + '" height="' + H + '"/>' +
        (r[1] ? '<path class="bar" d="' + colPath(x, H - h, bw, h) + '"/>' : '') + '</g>';
    });
    var ticks = [0, Math.floor((n - 1) / 2), n - 1].filter(function (v, i, a) { return a.indexOf(v) === i; });
    var axis = ticks.map(function (i) { return '<span style="left:' + ((i * (bw + gap) + bw / 2) / W * 100).toFixed(2) + '%">' + label(rows[i][0]) + '</span>'; }).join('');
    return '<div class="owner-chart"><div class="owner-plot"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Visitors per day">' + s + '</svg><div class="owner-y" aria-hidden="true">' + yl + '</div></div><div class="owner-axis">' + axis + '</div><div class="owner-tip" hidden></div></div>' +
      '<details class="small"><summary>Show as a table</summary><table><tr><th>Day</th><th>Visitors</th></tr>' + rows.map(function (r) { return '<tr><td>' + label(r[0]) + '</td><td>' + fmt(r[1]) + '</td></tr>'; }).join('') + '</table></details>';
  }
  function colPath(x, y, w, h) { var r = Math.min(4, w / 2, h); return 'M' + x + ' ' + (y + h) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + h) + 'Z'; }
  function label(day) { var d = new Date(day + 'T00:00:00'); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }

  /* ---------------- GoatCounter API ---------------- */
  function api(path, params) {
    var q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch(SITE + '/api/v0/' + path + '?' + q, { headers: { Authorization: 'Bearer ' + getKey(), 'Content-Type': 'application/json' } }).then(function (r) {
      if (r.status === 401 || r.status === 403) throw { auth: true };
      if (r.status === 429) throw { msg: 'GoatCounter is limiting requests. Wait a minute, then press Refresh.' };
      if (!r.ok) throw { msg: 'GoatCounter returned an error (' + r.status + '). Try Refresh, or open the full dashboard.' };
      return r.json();
    });
  }
  function load() {
    var days = +state.days, end = new Date(), start = new Date(); start.setDate(end.getDate() - (days - 1));
    var p = { start: ymd(start), end: ymd(end) }, out = {};
    var token = state.token = {};
    state.loading = true; state.error = ''; draw();
    /* One request at a time keeps well inside GoatCounter's rate limit. */
    var steps = [
      ['total', 'stats/total', p],
      ['hits', 'stats/hits', { start: p.start, end: p.end, limit: 100, daily: true }],
      ['refs', 'stats/toprefs', { start: p.start, end: p.end, limit: 10 }],
      ['locations', 'stats/locations', { start: p.start, end: p.end, limit: 10 }],
      ['sizes', 'stats/sizes', { start: p.start, end: p.end, limit: 10 }],
      ['browsers', 'stats/browsers', { start: p.start, end: p.end, limit: 10 }],
      ['systems', 'stats/systems', { start: p.start, end: p.end, limit: 10 }]
    ];
    steps.reduce(function (chain, s) { return chain.then(function () { return api(s[1], s[2]).then(function (j) { out[s[0]] = j; }); }); }, Promise.resolve())
      .then(function () {
        if (state.token !== token) return;
        var hits = out.hits.hits || [];
        /* Visitors per day: the total endpoint's daily figures where present, otherwise page figures added up. */
        var byDay = {};
        for (var i = 0; i < days; i++) { var dd = new Date(start); dd.setDate(start.getDate() + i); byDay[ymd(dd)] = 0; }
        var tStats = out.total.stats || [];
        if (tStats.length) tStats.forEach(function (s) { if (s.day in byDay) byDay[s.day] = s.daily || 0; });
        else hits.forEach(function (h) { if (!h.event) (h.stats || []).forEach(function (s) { if (s.day in byDay) byDay[s.day] += s.daily || 0; }); });
        state.data = {
          total: out.total.total != null ? out.total.total : out.total.total_unique,
          hits: hits, daily: Object.keys(byDay).sort().map(function (k) { return [k, byDay[k]]; }),
          refs: out.refs.stats || [], locations: out.locations.stats || [], sizes: out.sizes.stats || [], browsers: out.browsers.stats || [], systems: out.systems.stats || [],
          label: days === 1 ? 'Today' : 'Last ' + days + ' days (' + label(p.start) + ' to ' + label(p.end) + ')',
          at: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        };
        state.loading = false; draw();
      })
      .catch(function (e) {
        if (state.token !== token) return;
        state.loading = false; state.data = null;
        if (e && e.auth) { setKey(''); state.error = 'GoatCounter did not accept that key. Check that it has "Read statistics" permission and try again.'; }
        else state.error = (e && e.msg) || 'Could not reach GoatCounter from this page. Check your connection, or open the <a href="' + SITE + '" target="_blank" rel="noopener">full dashboard</a>.';
        draw();
      });
  }

  document.addEventListener('submit', function (e) {
    if (e.target.id !== 'owner-form') return;
    e.preventDefault();
    var v = document.getElementById('owner-key').value.trim(); if (!v) return;
    setKey(v); state.error = ''; load();
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act^="own-"]'); if (!t) return;
    var a = t.getAttribute('data-act');
    if (a === 'own-range') { state.days = t.getAttribute('data-v'); load(); }
    else if (a === 'own-refresh') load();
    else if (a === 'own-lock') { setKey(''); state.data = null; state.error = ''; draw(); }
  });
  /* Hover readout for the daily columns. */
  document.addEventListener('pointermove', function (e) {
    var chart = e.target.closest && e.target.closest('.owner-chart'); var tips = document.querySelectorAll('.owner-tip');
    if (!chart) { tips.forEach(function (t) { t.hidden = true; }); return; }
    var g = e.target.closest('.ob'), tip = chart.querySelector('.owner-tip');
    chart.querySelectorAll('.ob.on').forEach(function (x) { if (x !== g) x.classList.remove('on'); });
    if (!g) { tip.hidden = true; return; }
    g.classList.add('on'); tip.textContent = g.getAttribute('data-tip'); tip.hidden = false;
    var r = chart.getBoundingClientRect(), x = Math.min(r.width - tip.offsetWidth, Math.max(0, e.clientX - r.left - tip.offsetWidth / 2));
    tip.style.left = x + 'px';
  });

  window.PFOwner = {
    view: view,
    hydrate: function (root) { if (!root.querySelector('#owner')) return; if (getKey()) load(); else draw(); },
    isOwner: function () { return !!getKey(); }
  };
})();
