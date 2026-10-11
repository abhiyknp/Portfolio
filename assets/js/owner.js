/* Owner view (#stats): visitor numbers from the GoatCounter API, styled like the rest of the site.
   Not linked anywhere. It stays locked until the owner enters a GoatCounter API key with "Read statistics"
   permission; the key is kept only in that browser (localStorage) and is sent only to GoatCounter. */
(function () {
  'use strict';
  var SITE = 'https://abhiyknp.goatcounter.com', KEY = 'pf-owner-gc';
  var RANGES = [['1', 'Today'], ['7', '7 days'], ['30', '30 days'], ['90', '90 days']];
  var EVENTS = { 'resume-download': 'Résumé downloaded', 'email-click': 'Email link clicked', 'email-copy': 'Email address copied', 'linkedin-click': 'LinkedIn opened', 'compare-used': 'Before/after slider used', 'puzzle-solved': 'Puzzle solved' };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var state = { days: '7', data: null, error: '', loading: false, status: 'Loading…', cache: {}, step: 0, total: 7 };
  var CACHE_MS = 10 * 60 * 1000, CACHE_KEY = 'pf-owner-cache-2';
  try { state.cache = JSON.parse(sessionStorage.getItem(CACHE_KEY)) || {}; } catch (e) {}
  function saveCache() { try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(state.cache)); } catch (e) {} }

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
      }).join('') + '</div><div class="btn-row"><button class="btn ghost" type="button" data-act="own-refresh"' + (state.loading ? ' disabled aria-busy="true"><span class="spin" aria-hidden="true"></span>Loading' : '>Refresh') + '</button><a class="btn ghost" href="' + SITE + '" target="_blank" rel="noopener">Full dashboard ↗</a><button class="btn ghost" type="button" data-act="own-lock">Lock</button></div></div>';
    if (state.error) { host.innerHTML = head + '<p class="owner-err" role="alert">' + state.error + '</p>'; return; }
    if (state.loading || !d) { host.innerHTML = head + loader(); return; }

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

  /* Loading state: a progress bar, what is happening now, and a placeholder of the layout that is coming. */
  /* Loading state, "chaos to clarity": the messy questions behind each figure drift on the page, and each one settles
     into a clean, ticked label as its figures arrive. Same order as the requests in load(). */
  var CHAOS = [
    ['how many people came??', 'Visitors', 3, 8, -6],
    ['which pages do they actually read', 'Pages and actions', 50, 5, 4],
    ['LinkedIn or Google or what?', 'Sources', 22, 31, -3],
    ['anyone from outside India?', 'Countries', 55, 36, 6],
    ['phone or laptop…', 'Screen sizes', 5, 60, 5],
    ['chrome? safari?', 'Browsers', 40, 66, -5],
    ['windows / mac / android??', 'Operating systems', 54, 72, 3]
  ];
  function loader() {
    return '<div class="owner-load" aria-busy="true">' +
      '<div class="owner-prog" role="progressbar" aria-label="Loading visitor stats" aria-valuemin="0" aria-valuemax="' + state.total + '" aria-valuenow="' + state.step + '"><i style="width:' + (state.step / state.total * 100).toFixed(1) + '%"></i></div>' +
      '<p class="owner-status" role="status" id="own-status"><span class="spin" aria-hidden="true"></span><span id="own-status-t">' + esc(state.status) + '</span></p>' +
      '<div class="panel owner-chaos" aria-hidden="true"><div class="oc-targets">' + CHAOS.map(function (c) { return '<span class="oc-chip oc-ghost">✓ ' + c[1] + '</span>'; }).join('') + '</div>' +
        CHAOS.map(function (c, i) { return '<span class="oc-chip oc-mess" data-i="' + i + '" style="left:' + c[2] + '%;top:' + c[3] + '%;--r:' + c[4] + 'deg;--d:' + (i * -0.7).toFixed(1) + 's">' + c[0] + '</span>'; }).join('') +
        '<p class="oc-cap">Turning questions into numbers…</p></div></div>';
  }
  /* Move chip i onto its place in the neat row and swap its text for the clean label. */
  function settle(i) {
    var box = document.querySelector('.owner-chaos'); if (!box) return;
    var chip = box.querySelector('.oc-mess[data-i="' + i + '"]'), ghost = box.querySelectorAll('.oc-ghost')[i];
    if (!chip || !ghost) return;
    chip.classList.add('oc-done'); chip.textContent = '✓ ' + CHAOS[i][1];
    chip.style.left = ghost.offsetLeft + 'px'; chip.style.top = ghost.offsetTop + 'px';
    if (box.querySelectorAll('.oc-done').length === CHAOS.length) { box.classList.add('oc-clear'); box.querySelector('.oc-cap').textContent = 'Clarity.'; status('All figures in.'); }
  }
  window.addEventListener('resize', function () { document.querySelectorAll('.owner-chaos .oc-done').forEach(function (c) { settle(+c.getAttribute('data-i')); }); });

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
  function wait(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }
  function status(t) { state.status = t; var el = document.getElementById('own-status-t'); if (el) el.textContent = t; }
  function progress(i) {
    state.step = i; var bar = document.querySelector('.owner-prog');
    if (bar) { bar.setAttribute('aria-valuenow', String(i)); bar.firstChild.style.width = (i / state.total * 100).toFixed(1) + '%'; }
    for (var k = 0; k < i; k++) settle(k);
  }
  /* Wait with a visible countdown: "Trying again in 8 seconds…", "7 seconds…" and so on. */
  function countdown(secs, lead) {
    return new Promise(function (res) {
      (function tick(n) { status(lead + ' Trying again in ' + n + ' second' + (n === 1 ? '' : 's') + '…'); if (n <= 0) return res(); setTimeout(function () { tick(n - 1); }, 1000); })(secs);
    });
  }
  /* GoatCounter allows 4 API requests per second and 500 per hour from one address, and the browser's permission
     check before each request counts too. A refused permission check shows up as a network error rather than a 429,
     so both are retried: wait as long as GoatCounter asks (or 3, 8, 15, then 30 seconds), up to four times. */
  function api(path, params, tries) {
    tries = tries || 0;
    var q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
    var retry = function (secs, why) {
      if (tries >= 4) throw { msg: why === 'net' ? 'Could not reach GoatCounter from this page. Check your connection, wait a few minutes and press Refresh, or open the <a href="' + SITE + '" target="_blank" rel="noopener">full dashboard</a>.' : 'GoatCounter is still limiting requests. Wait a few minutes, then press Refresh.' };
      secs = Math.min(60, Math.max(1, secs || [3, 8, 15, 30][tries]));
      return countdown(secs, why === 'net' ? 'GoatCounter did not answer.' : 'GoatCounter asked to slow down.').then(function () { status('Trying again…'); return api(path, params, tries + 1); });
    };
    return fetch(SITE + '/api/v0/' + path + '?' + q, { headers: { Authorization: 'Bearer ' + getKey() } }).then(function (r) {
      if (r.status === 401 || r.status === 403) throw { auth: true };
      if (r.status === 429) { var hdr = parseFloat(r.headers.get('X-Rate-Limit-Reset') || r.headers.get('Retry-After') || ''); return retry(isFinite(hdr) && hdr > 0 ? Math.ceil(hdr) : 0, 'limit'); }
      if (!r.ok) throw { msg: 'GoatCounter returned an error (' + r.status + '). Try Refresh, or open the full dashboard.' };
      return r.json();
    }, function () { return retry(0, 'net'); });
  }
  function load(force) {
    var hit = state.cache[state.days];
    if (!force && hit && Date.now() - hit.t < CACHE_MS) { state.token = {}; state.loading = false; state.error = ''; state.data = hit.data; draw(); return; }
    var days = +state.days, end = new Date(), start = new Date(); start.setDate(end.getDate() - (days - 1));
    /* GoatCounter reads a bare date as midnight, which would leave out today. Send exact times instead: from the
       start of the first day to the end of the current hour (GoatCounter counts by the hour). */
    var from = new Date(start); from.setHours(0, 0, 0, 0);
    var to = new Date(end); to.setMinutes(0, 0, 0); to.setHours(to.getHours() + 1);
    var iso = function (d) { return d.toISOString().replace(/\.\d{3}Z$/, 'Z'); };
    var p = { start: iso(from), end: iso(to) }, out = {}, day0 = ymd(start), day1 = ymd(end);
    var token = state.token = {};
    state.loading = true; state.error = ''; state.status = 'Connecting to GoatCounter…'; state.step = 0; draw();
    /* One request every 1.2 seconds keeps well inside GoatCounter's rate limit. */
    var steps = [
      ['total', 'stats/total', p, 'visitor totals'],
      ['hits', 'stats/hits', { start: p.start, end: p.end, limit: 100, daily: true }, 'pages and actions'],
      ['refs', 'stats/toprefs', { start: p.start, end: p.end, limit: 10 }, 'sources'],
      ['locations', 'stats/locations', { start: p.start, end: p.end, limit: 10 }, 'countries'],
      ['sizes', 'stats/sizes', { start: p.start, end: p.end, limit: 10 }, 'screen sizes'],
      ['browsers', 'stats/browsers', { start: p.start, end: p.end, limit: 10 }, 'browsers'],
      ['systems', 'stats/systems', { start: p.start, end: p.end, limit: 10 }, 'operating systems']
    ];
    steps.reduce(function (chain, s, i) {
      return chain.then(function () {
        if (state.token !== token) throw { stale: true };
        status('Loading ' + s[3] + ' (' + (i + 1) + ' of ' + steps.length + ')…');
        return (i ? wait(1200) : Promise.resolve()).then(function () { return api(s[1], s[2]); }).then(function (j) { out[s[0]] = j; progress(i + 1); });
      });
    }, Promise.resolve())
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
          label: days === 1 ? 'Today' : 'Last ' + days + ' days (' + label(day0) + ' to ' + label(day1) + ')',
          at: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        };
        state.cache[state.days] = { data: state.data, t: Date.now() }; saveCache();
        return wait(reduce.matches ? 0 : 700).then(function () { if (state.token !== token) return; state.loading = false; draw(); });
      })
      .catch(function (e) {
        if (state.token !== token || (e && e.stale)) return;
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
    else if (a === 'own-refresh') load(true);
    else if (a === 'own-lock') { setKey(''); state.token = {}; state.cache = {}; saveCache(); state.data = null; state.error = ''; draw(); }
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
