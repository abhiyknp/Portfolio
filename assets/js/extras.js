/* Before/after slider and the "Chaos to clarity" process puzzle. Content lives in data/extras.js. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function track(name) { document.dispatchEvent(new CustomEvent('pf:track', { detail: name })); }

  /* ---------------- Before/after slider ---------------- */
  function compareHtml() {
    return '<div class="cmp-wrap" data-widget="compare">' +
      '<div class="chips" role="group" aria-label="Choose an example">' + PF.compare.map(function (c, i) {
        return '<button class="chip" type="button" data-act="cmp-pick" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + c.tab + '</button>';
      }).join('') + '</div><div class="cmp-host"></div></div>';
  }
  function drawCompare(wrap, i) {
    var c = PF.compare[i], host = wrap.querySelector('.cmp-host');
    var sk = (PF.skills || []).filter(function (s) { return s.id === c.skill; })[0];
    host.innerHTML =
      '<div class="cmp" style="--pos:50%">' +
        '<div class="cmp-layer cmp-before"><span class="cmp-tag">Before</span><div class="cmp-note">' + c.before + '</div></div>' +
        '<div class="cmp-layer cmp-after"><span class="cmp-tag">After</span><div class="cmp-body">' + c.after + '</div></div>' +
        '<div class="cmp-line" aria-hidden="true"><span class="cmp-knob"><svg viewBox="0 0 24 24"><path d="M9 6l-5 6 5 6M15 6l5 6-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>' +
      '</div>' +
      '<div class="cmp-ctl"><button class="btn ghost" type="button" data-act="cmp-set" data-v="100">Show before</button>' +
        '<input class="cmp-range" type="range" min="0" max="100" step="1" value="50" aria-label="Divider position: left shows before, right shows after">' +
        '<button class="btn ghost" type="button" data-act="cmp-set" data-v="0">Show after</button></div>' +
      '<p class="small muted cmp-foot"><span class="ev ev-ill">Illustrative example</span> Drag the handle, or use the buttons. ' + (sk ? 'Related skill: <a href="#skill.' + sk.id + '">' + sk.name + '</a>' : '') + '</p>';
    var box = host.querySelector('.cmp'), range = host.querySelector('.cmp-range'), knob = host.querySelector('.cmp-knob');
    function set(v, user) {
      v = Math.max(0, Math.min(100, v));
      box.style.setProperty('--pos', v + '%'); range.value = Math.round(v);
      range.setAttribute('aria-valuetext', v >= 99 ? 'Before only' : v <= 1 ? 'After only' : Math.round(v) + '% before, ' + Math.round(100 - v) + '% after');
      if (user && !wrap._used) { wrap._used = true; track('compare-used'); }
    }
    wrap._set = set; set(50);
    range.addEventListener('input', function () { set(+range.value, true); });
    function fromPointer(e) { var r = box.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100, true); }
    knob.parentNode.addEventListener('pointerdown', function (e) {
      e.preventDefault(); knob.parentNode.setPointerCapture(e.pointerId); box.classList.add('dragging');
      var move = function (ev) { fromPointer(ev); }, up = function () { box.classList.remove('dragging'); knob.parentNode.removeEventListener('pointermove', move); knob.parentNode.removeEventListener('pointerup', up); knob.parentNode.removeEventListener('pointercancel', up); };
      knob.parentNode.addEventListener('pointermove', move); knob.parentNode.addEventListener('pointerup', up); knob.parentNode.addEventListener('pointercancel', up);
    });
  }
  /* A one-time nudge when the slider first scrolls into view, so it reads as something to drag. */
  function nudge(wrap) {
    if (reduce.matches || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; io.disconnect();
      var t0 = null;
      (function step(t) {
        if (wrap._used || !wrap.isConnected) return;
        if (t0 === null) t0 = t; var k = (t - t0) / 1600; if (k >= 1) { wrap._set(50); return; }
        wrap._set(50 + Math.sin(k * Math.PI * 2) * 18 * (1 - k)); requestAnimationFrame(step);
      })(performance.now());
    }, { threshold: 0.6 });
    io.observe(wrap.querySelector('.cmp'));
  }

  /* ---------------- Process puzzle: three levels, score, stars, hints ---------------- */
  var P = null, BEST_KEY = 'pf-pz-best', HINT_COST = 15, MISS_COST = 20;
  var RANKS = [[9, 'Senior Business Analyst material', 'Every step in place, first time. You think the way a delivery team needs.'], [7, 'Sharp analyst', 'Nearly flawless. You clearly know how requirements become releases.'], [4, 'Getting the flow', 'The shape is there. One more round and it will be second nature.'], [0, 'Curious mind', 'Every analyst starts here. Play again and watch the hints.']];
  function getBest() { try { return JSON.parse(localStorage.getItem(BEST_KEY)) || null; } catch (e) { return null; } }
  function setBest(b) { try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) { /* storage unavailable */ } }
  function shuffle(n) {
    var a; do { a = []; for (var i = 0; i < n; i++) a.push(i); for (var j = n - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)), t = a[j]; a[j] = a[k]; a[k] = t; } }
    while (a.every(function (v, i) { return v === i; }));
    return a;
  }
  function startLevel(L) {
    var n = PF.puzzle[L].steps.length;
    P.L = L; P.tray = shuffle(n); P.slots = new Array(n).fill(null); P.locked = new Array(n).fill(false);
    P.checks = 0; P.hints = 0; P.msg = ''; P.marks = null; P.phase = 'play';
  }
  function reset() { P = { score: 0, stars: [], streak: 0, t0: Date.now() }; startLevel(0); }
  function levelStars() { return P.checks === 1 && !P.hints ? 3 : (P.checks <= 2 && P.hints <= 1 ? 2 : 1); }
  function starsHtml(n, max, cls) { var s = ''; for (var i = 0; i < (max || 3); i++) s += '<span class="pz-star' + (i < n ? ' on' : '') + '" style="--d:' + i + '" aria-hidden="true">★</span>'; return '<span class="pz-stars ' + (cls || '') + '" role="img" aria-label="' + n + ' of ' + (max || 3) + ' stars">' + s + '</span>'; }
  function fmtTime(ms) { var s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function puzzleView() {
    reset();
    return '<div class="wrap page"><header class="page-head"><p class="kicker">Quick challenge · three levels · about 3 minutes</p><h1>Chaos to clarity: from request to release</h1>' +
      '<p class="lede">One request, followed all the way to release. In each level the steps have been shuffled: put them back in order. Correct steps lock in, hints cost points, and a clean first check earns three stars.</p></header>' +
      '<div id="puzzle" class="pz"></div><p class="sr-only" id="pz-live" aria-live="polite"></p></div>';
  }
  function hud() {
    var lv = PF.puzzle.map(function (l, i) {
      var st = i < P.stars.length ? 'done' : (i === P.L ? 'now' : '');
      return '<li class="pz-lv ' + st + '"' + (i === P.L && P.phase === 'play' ? ' aria-current="step"' : '') + '><span class="pz-lv-n">' + (i + 1) + '</span><span class="pz-lv-name">' + l.name + '</span>' + (i < P.stars.length ? starsHtml(P.stars[i], 3, 'mini') : '') + '</li>';
    }).join('');
    return '<div class="pz-hud"><ol class="pz-levels" aria-label="Levels">' + lv + '</ol>' +
      '<div class="pz-score" aria-label="Score"><span class="k">Score</span><span class="v" id="pz-score">' + P.score + '</span>' + (P.streak > 1 ? '<span class="pz-streak">Streak ×' + P.streak + '</span>' : '') + '</div></div>';
  }
  function drawPuzzle(focus) {
    var host = document.getElementById('puzzle'); if (!host) return;
    var lvl = PF.puzzle[P.L], S = lvl.steps, filled = P.slots.filter(function (s) { return s !== null; }).length, h;
    if (P.phase === 'final') {
      var total = P.stars.reduce(function (a, b) { return a + b; }, 0), rank = RANKS.filter(function (r) { return total >= r[0]; })[0], best = getBest(), isBest = !best || P.score > best.score;
      if (isBest) setBest({ score: P.score, stars: total });
      host.innerHTML = '<div class="pz-done">' + burst() + '<p class="kicker">Clarity reached</p><h2>' + rank[1] + '</h2>' + starsHtml(total, 9, 'big') +
        '<p class="muted">' + rank[2] + '</p>' +
        '<div class="pz-tally"><div><span class="v">' + P.score + '</span><span class="k">Points' + (isBest ? ' · new best' : ' · best ' + best.score) + '</span></div><div><span class="v">' + total + '/9</span><span class="k">Stars</span></div><div><span class="v">' + fmtTime(P.elapsed) + '</span><span class="k">Time</span></div></div>' +
        '<ol class="pz-flow">' + PF.puzzle.map(function (l, i) { return '<li style="--d:' + i + '"><span class="pz-n">' + (i + 1) + '</span><div><span class="pz-lane">' + l.name + ' · ' + starsHtml(P.stars[i], 3, 'mini') + '</span><p>' + l.lesson + '</p></div></li>'; }).join('') + '</ol>' +
        '<p class="small muted">This is how I run every project: one clear flow from the first request to a measured result.</p>' +
        '<div class="btn-row"><a class="btn" href="#cases">See it on real projects</a><button class="btn ghost" type="button" data-act="pz-again">Play again</button><a class="btn ghost" href="mailto:ba.abhiy@gmail.com">Email me</a></div></div>';
      h = host.querySelector('h2'); h.setAttribute('tabindex', '-1'); h.focus();
      return;
    }
    if (P.phase === 'level') {
      var st = P.stars[P.L], last = P.L === PF.puzzle.length - 1;
      host.innerHTML = hud() + '<div class="pz-level-done">' + (st === 3 ? burst() : '') + '<p class="kicker">Level ' + (P.L + 1) + ' complete</p><h2>' + (st === 3 ? 'Perfect flow.' : st === 2 ? 'Well ordered.' : 'Sorted.') + '</h2>' + starsHtml(st, 3, 'big') +
        '<p class="pz-gain">+' + P.gain + ' points' + (P.bonus ? ' <span>(includes a streak bonus of ' + P.bonus + ')</span>' : '') + '</p>' +
        '<div class="pz-lesson"><span class="pz-lane">Why this order</span><p>' + lvl.lesson + '</p></div>' +
        '<ol class="pz-flow compact">' + S.map(function (s, i) { return '<li style="--d:' + i + '"><span class="pz-n">' + (i + 1) + '</span><div><span class="pz-lane">' + s.lane + '</span><p>' + s.t + '</p></div></li>'; }).join('') + '</ol>' +
        '<div class="btn-row"><button class="btn" type="button" data-act="pz-next">' + (last ? 'See my result →' : 'Next level: ' + PF.puzzle[P.L + 1].name + ' →') + '</button></div></div>';
      h = host.querySelector('h2'); h.setAttribute('tabindex', '-1'); h.focus();
      return;
    }
    var M = P.marks || {};
    host.innerHTML = hud() +
      '<div class="pz-brief"><p class="kicker">' + lvl.kicker + '</p><p>' + lvl.intro + '</p></div>' +
      '<div class="pz-grid">' +
        '<section class="pz-col" aria-labelledby="pz-tray-h"><h2 id="pz-tray-h" class="pz-h">The pile <span class="small muted">(' + P.tray.length + ' left)</span></h2>' +
          (P.tray.length ? '<ul class="pz-tray">' + P.tray.map(function (i) { return '<li><button class="pz-card" type="button" data-act="pz-place" data-i="' + i + '"><span>' + S[i].t + '</span><span class="pz-act" aria-hidden="true">Add →</span></button></li>'; }).join('') + '</ul>'
            : '<p class="small muted">All steps placed. Check your order.</p>') +
        '</section>' +
        '<section class="pz-col" aria-labelledby="pz-flow-h"><h2 id="pz-flow-h" class="pz-h">Your flow <span class="pz-meter" aria-hidden="true"><i style="width:' + (filled / S.length * 100) + '%"></i></span></h2><ol class="pz-slots">' + P.slots.map(function (v, k) {
          if (v === null) return '<li class="pz-slot empty"><span class="pz-n">' + (k + 1) + '</span><span class="small muted">' + (k === P.slots.indexOf(null) ? 'Next step goes here' : 'Empty') + '</span></li>';
          if (P.locked[k]) return '<li class="pz-slot ok' + (M[k] === 'new' ? ' pop' : '') + '"><span class="pz-n">' + (k + 1) + '</span><span>' + S[v].t + '</span><span class="pz-tick" aria-label="Correct">✓</span></li>';
          return '<li class="pz-slot' + (M[k] === 'bad' ? ' bad' : '') + '"><span class="pz-n">' + (k + 1) + '</span><button class="pz-card placed" type="button" data-act="pz-remove" data-k="' + k + '" aria-label="Step ' + (k + 1) + ': ' + S[v].t + '. Return to the pile"><span>' + S[v].t + '</span><span class="pz-act" aria-hidden="true">↩</span></button></li>';
        }).join('') + '</ol>' +
        '<div class="btn-row"><button class="btn" type="button" data-act="pz-check"' + (filled < S.length || P.marks ? ' disabled' : '') + '>Check my order</button><button class="btn ghost" type="button" data-act="pz-hint"' + (P.locked.every(Boolean) || P.marks ? ' disabled' : '') + '>Hint <span class="pz-cost">−' + HINT_COST + '</span></button></div>' +
        '<p class="pz-msg">' + P.msg + '</p>' +
        '</section>' +
      '</div>';
    var f = focus && host.querySelector(focus); if (!f) f = host.querySelector('.pz-tray .pz-card') || host.querySelector('[data-act="pz-check"]:not([disabled])');
    if (focus !== null && f) f.focus({ preventScroll: true });
  }
  function burst() {
    if (reduce.matches) return '';
    var s = '<div class="pz-burst" aria-hidden="true">';
    for (var i = 0; i < 18; i++) s += '<i style="--a:' + (i * 20) + 'deg;--r:' + (90 + (i % 3) * 40) + 'px;--d:' + (i % 4) * 40 + 'ms"></i>';
    return s + '</div>';
  }
  function bumpScore(to) {
    var el = document.getElementById('pz-score'); if (!el) return;
    var from = +el.textContent; if (reduce.matches || from === to) { el.textContent = to; return; }
    var t0 = performance.now();
    (function step(t) { var p = Math.min(1, (t - t0) / 600); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
  }
  function announce(t) { var l = document.getElementById('pz-live'); if (l) { l.textContent = ''; setTimeout(function () { l.textContent = t; }, 50); } }
  function finishLevel() {
    var st = levelStars(), base = Math.max(20, 100 - (P.checks - 1) * MISS_COST - P.hints * HINT_COST) + st * 10;
    P.streak = st === 3 ? P.streak + 1 : 0;
    P.bonus = P.streak > 1 ? (P.streak - 1) * 25 : 0;
    P.gain = base + P.bonus; P.stars.push(st); P.phase = 'level';
    var before = P.score; P.score += P.gain;
    drawPuzzle(); var el = document.getElementById('pz-score'); if (el) { el.textContent = before; bumpScore(P.score); }
    announce('Level ' + (P.L + 1) + ' complete. ' + st + ' of 3 stars, plus ' + P.gain + ' points.');
  }
  function act(a, el) {
    if (!P) return;
    var S = PF.puzzle[P.L].steps;
    if (a === 'pz-place') {
      var i = +el.getAttribute('data-i'), k = P.slots.indexOf(null); if (k < 0) return;
      P.slots[k] = i; P.tray.splice(P.tray.indexOf(i), 1); P.msg = '';
      drawPuzzle(P.tray.length ? '.pz-tray .pz-card' : '[data-act="pz-check"]');
    } else if (a === 'pz-remove') {
      var k2 = +el.getAttribute('data-k'), v = P.slots[k2]; P.slots[k2] = null; P.tray.push(v); P.msg = '';
      drawPuzzle('[data-act="pz-place"][data-i="' + v + '"]');
    } else if (a === 'pz-hint') {
      var at = P.locked.indexOf(false); if (at < 0) return;
      P.hints++; P.score = Math.max(0, P.score - HINT_COST);
      var occ = P.slots[at]; if (occ !== null && occ !== at) P.tray.push(occ);
      var was = P.slots.indexOf(at); if (was >= 0 && was !== at) P.slots[was] = null;
      var ti = P.tray.indexOf(at); if (ti >= 0) P.tray.splice(ti, 1);
      P.slots[at] = at; P.locked[at] = true; P.marks = null;
      P.msg = 'Step ' + (at + 1) + ' is now locked in. ' + S[at].hint;
      drawPuzzle(); announce(P.msg);
      if (P.locked.every(Boolean)) { P.checks = Math.max(1, P.checks); finishLevel(); }
    } else if (a === 'pz-check') {
      P.checks++;
      var wrong = [], marks = {};
      P.slots.forEach(function (v, k) { if (P.locked[k]) return; if (v === k) { P.locked[k] = true; marks[k] = 'new'; } else { wrong.push(v); marks[k] = 'bad'; } });
      if (!wrong.length) { finishLevel(); return; }
      var right = P.locked.filter(Boolean).length;
      P.msg = (right === 0 ? 'None in the right place yet.' : right + ' of ' + S.length + ' in place and locked.') + ' The others go back to the pile. Hint: ' + S[wrong[0]].hint;
      P.marks = marks; drawPuzzle(null); announce(P.msg);
      setTimeout(function () {
        if (!P || P.phase !== 'play') return;
        P.slots.forEach(function (v, k) { if (!P.locked[k]) P.slots[k] = null; });
        P.tray = wrong.concat(P.tray); P.marks = null; drawPuzzle();
      }, reduce.matches ? 0 : 900);
    } else if (a === 'pz-next') {
      if (P.L < PF.puzzle.length - 1) { startLevel(P.L + 1); drawPuzzle(); }
      else { P.phase = 'final'; P.elapsed = Date.now() - P.t0; track('puzzle-solved'); drawPuzzle(); announce('All three levels complete.'); }
    } else if (a === 'pz-again') { reset(); drawPuzzle(); }
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act]'); if (!t) return;
    var a = t.getAttribute('data-act');
    if (a === 'cmp-pick') {
      var wrap = t.closest('[data-widget="compare"]');
      wrap.querySelectorAll('[data-act="cmp-pick"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); });
      drawCompare(wrap, +t.getAttribute('data-i'));
    } else if (a === 'cmp-set') { t.closest('[data-widget="compare"]')._set(+t.getAttribute('data-v'), true); }
    else if (a.indexOf('pz-') === 0) act(a, t);
  });

  window.PFX = {
    compareHtml: compareHtml,
    puzzleView: puzzleView,
    hydrate: function (root) {
      root.querySelectorAll('[data-widget="compare"]').forEach(function (w) { drawCompare(w, 0); nudge(w); });
      if (root.querySelector('#puzzle')) drawPuzzle(null);
    }
  };
})();
