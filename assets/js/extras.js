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

  /* ---------------- Process puzzle ---------------- */
  var P = null;
  function shuffle(n) {
    var a; do { a = []; for (var i = 0; i < n; i++) a.push(i); for (var j = n - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)), t = a[j]; a[j] = a[k]; a[k] = t; } }
    while (a.every(function (v, i) { return v === i; }));
    return a;
  }
  function reset() { var n = PF.puzzle.length; P = { tray: shuffle(n), slots: new Array(n).fill(null), locked: new Array(n).fill(false), checks: 0, msg: '', done: false }; }
  function puzzleView() {
    reset();
    return '<div class="wrap page"><header class="page-head"><p class="kicker">Quick challenge · about 2 minutes</p><h1>Chaos to clarity: put the process in order</h1>' +
      '<p class="lede">Seven steps of a highway permission application have been shuffled. Put them back in the order they happen. This is the first thing I do on any project: turn scattered activity into one clear flow.</p>' +
      '<p class="note"><span class="ev ev-ill">Illustrative example</span> A simplified version of the permission lifecycle in the Rajmarg Pravesh case study, not the production workflow.</p></header>' +
      '<div id="puzzle" class="pz"></div><p class="sr-only" id="pz-live" aria-live="polite"></p></div>';
  }
  function drawPuzzle(focus) {
    var host = document.getElementById('puzzle'); if (!host) return;
    var S = PF.puzzle, filled = P.slots.filter(function (s) { return s !== null; }).length;
    if (P.done) {
      host.innerHTML = '<div class="pz-done"><p class="kicker">Clarity</p><h2>Solved' + (P.checks === 1 ? ' on the first check.' : ' in ' + P.checks + ' checks.') + '</h2>' +
        '<p class="muted">From a pile of activities to one flow that every team can read. Each step has an owner and a reason for its place.</p>' +
        '<ol class="pz-flow">' + S.map(function (s, i) { return '<li style="--d:' + i + '"><span class="pz-n">' + (i + 1) + '</span><div><span class="pz-lane">' + s.lane + '</span><p>' + s.t + '</p><p class="small muted">' + s.hint + '</p></div></li>'; }).join('') + '</ol>' +
        '<div class="btn-row"><a class="btn" href="#case.rajmarg">See the full workflow in the case study</a><button class="btn ghost" type="button" data-act="pz-again">Play again</button><a class="btn ghost" href="#scenarios">Try a decision scenario</a></div></div>';
      var h = host.querySelector('h2'); h.setAttribute('tabindex', '-1'); h.focus();
      return;
    }
    host.innerHTML =
      '<div class="pz-grid">' +
        '<section class="pz-col" aria-labelledby="pz-tray-h"><h2 id="pz-tray-h" class="pz-h">The pile <span class="small muted">(' + P.tray.length + ' left)</span></h2>' +
          (P.tray.length ? '<ul class="pz-tray">' + P.tray.map(function (i) { return '<li><button class="pz-card" type="button" data-act="pz-place" data-i="' + i + '"><span>' + S[i].t + '</span><span class="pz-act" aria-hidden="true">Add →</span></button></li>'; }).join('') + '</ul>'
            : '<p class="small muted">All steps placed. Check your order.</p>') +
        '</section>' +
        '<section class="pz-col" aria-labelledby="pz-flow-h"><h2 id="pz-flow-h" class="pz-h">Your flow</h2><ol class="pz-slots">' + P.slots.map(function (v, k) {
          if (v === null) return '<li class="pz-slot empty"><span class="pz-n">' + (k + 1) + '</span><span class="small muted">Empty</span></li>';
          if (P.locked[k]) return '<li class="pz-slot ok"><span class="pz-n">' + (k + 1) + '</span><span>' + S[v].t + '</span><span class="pz-tick" aria-label="Correct">✓</span></li>';
          return '<li class="pz-slot"><span class="pz-n">' + (k + 1) + '</span><button class="pz-card placed" type="button" data-act="pz-remove" data-k="' + k + '" aria-label="Step ' + (k + 1) + ': ' + S[v].t + '. Return to the pile"><span>' + S[v].t + '</span><span class="pz-act" aria-hidden="true">↩</span></button></li>';
        }).join('') + '</ol>' +
        '<div class="btn-row"><button class="btn" type="button" data-act="pz-check"' + (filled < S.length ? ' disabled' : '') + '>Check my order</button><button class="btn ghost" type="button" data-act="pz-again">Shuffle again</button></div>' +
        '<p class="pz-msg">' + P.msg + '</p>' +
        '</section>' +
      '</div>';
    var f = focus && host.querySelector(focus); if (!f) f = host.querySelector('.pz-tray .pz-card') || host.querySelector('[data-act="pz-check"]:not([disabled])');
    if (focus !== null && f) f.focus({ preventScroll: true });
  }
  function announce(t) { var l = document.getElementById('pz-live'); if (l) { l.textContent = ''; setTimeout(function () { l.textContent = t; }, 50); } }
  function act(a, el) {
    var S = PF.puzzle;
    if (a === 'pz-place') {
      var i = +el.getAttribute('data-i'), k = P.slots.indexOf(null); if (k < 0) return;
      P.slots[k] = i; P.tray.splice(P.tray.indexOf(i), 1); P.msg = '';
      drawPuzzle(P.tray.length ? '.pz-tray .pz-card' : '[data-act="pz-check"]');
    } else if (a === 'pz-remove') {
      var k2 = +el.getAttribute('data-k'), v = P.slots[k2]; P.slots[k2] = null; P.tray.push(v); P.msg = '';
      drawPuzzle('[data-act="pz-place"][data-i="' + v + '"]');
    } else if (a === 'pz-check') {
      P.checks++;
      var wrong = [];
      P.slots.forEach(function (v, k) { if (v === k) P.locked[k] = true; else { wrong.push(v); P.slots[k] = null; } });
      if (!wrong.length) { P.done = true; track('puzzle-solved'); drawPuzzle(); announce('Solved. All seven steps are in order.'); return; }
      P.tray = wrong.concat(P.tray);
      var right = S.length - wrong.length;
      P.msg = (right === 0 ? 'None in the right place yet, so all steps are back in the pile.' : right + ' of ' + S.length + ' in the right place. ' + (right === 1 ? 'That one is' : 'Those are') + ' locked; the rest are back in the pile.') + ' Hint: ' + S[wrong[0]].hint;
      drawPuzzle(); announce(P.msg);
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
