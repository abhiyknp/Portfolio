/* Intro prototypes for Direction A. Each is a pinned stage driven by the scroll position inside its section.
   1 · Chaos to clarity   3 · The thread is born   5 · Blueprint assembly
   With reduced motion, each renders its final frame without pinning. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function win(t, a, b) { return ease(clamp((t - a) / (b - a), 0, 1)); }
  function band(t, a, b, f) { f = f || 0.04; return clamp(Math.min((t - a) / f, (b - t) / f), 0, 1); }

  /* Shared pinned-section mechanics. */
  function Pinned(host, render) {
    var self = this, cur = 0, target = 0, raf = 0, last = 0, live = true;
    function prog() { var tb = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tb')) || 0, r = host.getBoundingClientRect(), span = host.offsetHeight - (innerHeight - tb); return clamp((tb - r.top) / Math.max(1, span), 0, 1); }
    function frame(now) {
      raf = 0; if (!live) return;
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      cur += (target - cur) * Math.min(1, dt * 7); if (Math.abs(target - cur) < 0.0005) cur = target;
      render(cur); if (cur !== target) raf = requestAnimationFrame(frame);
    }
    function onScroll() { if (!live) return; target = prog(); if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    this.start = function () { if (reduce) { render(1); return; } cur = target = prog(); render(cur); addEventListener('scroll', onScroll, { passive: true }); };
    this.stop = function () { live = false; removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
    this.refresh = function () { render(reduce ? 1 : cur); };
  }

  /* ---------------- 1 · Chaos to clarity ---------------- */
  var NOISE = ['make it faster', 'urgent!!', 'same as last time', 'fewer fields?', 'who approves this?', 'compliance', 'can we add a report?', 'it worked in UAT', 'just a small change', 'ASAP', 'policy says…', 'the vendor said no', 'what does "pending" mean?', 'users are confused', 'need it by Friday', 'is this in scope?', 'the data doesn\'t match', 'Excel export?', 'legacy records', 'one more approval step', 'it\'s a quick fix', 'mobile too?', 'audit wants proof', 'why was it rejected?', 'the SMS never arrived', 'duplicate application', 'which version?', 'who owns this?', 'can\'t find the document', 'payment pending', 'like the old system', 'escalate this'];
  var HEAD = ['Turning', 'complexity', 'into', 'clarity.'];
  function chaos(host, opts) {
    opts = opts || {};
    var stage = host.querySelector('.i-stage'), seed = 5;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var html = '<h2 class="i1-measure" aria-hidden="true">' + HEAD.map(function (w) { return '<span>' + w + '</span>'; }).join(' ') + '</h2>';
    var words = [];
    NOISE.concat(HEAD).forEach(function (w, i) {
      var head = i >= NOISE.length;
      words.push({ w: w, head: head, hi: head ? i - NOISE.length : -1, x: 0.06 + rnd() * 0.84, y: 0.1 + rnd() * 0.8, z: 0.55 + rnd() * 0.75, d: rnd() });
    });
    /* Keep headline words away from the centre so they visibly travel. */
    words.filter(function (o) { return o.head; }).forEach(function (o, k) { o.x = [0.12, 0.72, 0.2, 0.8][k]; o.y = [0.22, 0.18, 0.78, 0.74][k]; o.z = 0.9; });
    html += words.map(function (o, i) { return '<span class="i1-w' + (o.head ? ' h' : '') + (o.hi === 3 ? ' last' : '') + '" data-i="' + i + '">' + o.w.replace(/</g, '&lt;') + '</span>'; }).join('');
    html += '<p class="i-cap i1-c1">Every project starts as noise.</p><p class="i-cap i1-c2">The job is to find what matters.</p>' +
      '<div class="i1-sub">' + (opts.sub || '<span class="i-name">Abhishek Yadav</span><span>Senior IT Business Analyst</span>') + '</div><span class="i-cue">Scroll ↓</span>';
    stage.insertAdjacentHTML('beforeend', html);
    var els = Array.prototype.slice.call(stage.querySelectorAll('.i1-w')), measure = stage.querySelector('.i1-measure'), sub = stage.querySelector('.i1-sub'), c1 = stage.querySelector('.i1-c1'), c2 = stage.querySelector('.i1-c2'), cue = stage.querySelector('.i-cue');
    var T = [], FT = 60, W = 0, H = 0;
    function layout() {
      W = stage.clientWidth; H = stage.clientHeight;
      var sr = stage.getBoundingClientRect(), spans = measure.querySelectorAll('span');
      FT = parseFloat(getComputedStyle(measure).fontSize);
      T = Array.prototype.map.call(spans, function (s) { var r = s.getBoundingClientRect(); return [r.left - sr.left, r.top - sr.top]; });
      els.forEach(function (el, i) { if (words[i].head) el.style.fontSize = FT + 'px'; else el.style.fontSize = (13 + words[i].z * 9) + 'px'; });
    }
    function render(t) {
      var settle = win(t, 0.16, 0.56), drift = t * 60;
      els.forEach(function (el, i) {
        var o = words[i], sx = o.x * W + (o.z - 1) * drift, sy = o.y * H, x, y, s, op;
        if (o.head) {
          var k = win(t, 0.2 + o.hi * 0.05, 0.52 + o.hi * 0.03), s0 = (14 + o.z * 9) / FT;
          x = sx + (T[o.hi][0] - sx) * k; y = sy + (T[o.hi][1] - sy) * k; s = s0 + (1 - s0) * k; op = 0.85 + 0.15 * k;
          el.classList.toggle('lit', t > 0.56);
        } else {
          var f = win(t, 0.14 + o.d * 0.22, 0.36 + o.d * 0.22), cx = sx - W / 2, cy = sy - H / 2;
          x = sx + cx * 0.5 * f; y = sy + cy * 0.5 * f; s = 1 - 0.4 * f; op = (0.35 + 0.6 * (o.z - 0.55) / 0.75) * (1 - f);
        }
        el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')';
        el.style.opacity = op.toFixed(3); el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
      });
      c1.style.opacity = band(t, -0.1, 0.16).toFixed(3); c2.style.opacity = band(t, 0.2, 0.46).toFixed(3);
      var so = win(t, 0.58, 0.72); sub.style.opacity = so.toFixed(3); sub.style.transform = 'translate(-50%,' + ((1 - so) * 14).toFixed(1) + 'px)';
      cue.style.opacity = (win(t, 0.62, 0.7) * (1 - win(t, 0.74, 0.8))).toFixed(3);
      /* Crossfade into the page: the overview rises over the last stretch while the stage fades. */
      if (opts.fadeOut && !reduce) stage.style.opacity = (1 - win(t, 0.8, 0.98)).toFixed(3);
    }
    layout();
    var p = new Pinned(host, render);
    var onR = function () { layout(); p.refresh(); };
    addEventListener('resize', onR);
    if (document.fonts) document.fonts.ready.then(onR);
    p.start();
    return function () { p.stop(); removeEventListener('resize', onR); };
  }

  /* ---------------- 3 · The thread is born ---------------- */
  var THREAD = [
    { d: 'M60 150 C200 150 260 160 344 170', a: 0.04, b: 0.17 },
    { d: 'M344 170 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0', a: 0.17, b: 0.25 },
    { d: 'M396 170 C450 170 460 100 520 100 H700', a: 0.25, b: 0.38 },
    { d: 'M396 170 C450 170 470 200 520 200 H700', a: 0.27, b: 0.4 },
    { d: 'M396 170 C450 170 460 300 520 300 H700', a: 0.29, b: 0.42 },
    { d: 'M650 200 C650 254 566 254 566 206', a: 0.42, b: 0.52, cls: 'loop' },
    { d: 'M700 100 C755 100 760 200 810 200', a: 0.52, b: 0.6 },
    { d: 'M700 200 H810', a: 0.52, b: 0.6 },
    { d: 'M700 300 C755 300 760 200 810 200', a: 0.52, b: 0.6 },
    { d: 'M810 200 C950 200 965 530 790 530 H230', a: 0.6, b: 0.8 },
    { d: 'M230 530 C150 530 130 580 130 640', a: 0.86, b: 0.98 }
  ];
  var TLABELS = [
    ['A question', 60, 128, 0.06, 0.2], ['Decide', 370, 132, 0.2, 0.3], ['Applicant', 524, 88, 0.33, 0.44], ['Reviewer', 524, 188, 0.35, 0.44], ['Approver', 524, 326, 0.37, 0.44],
    ['Clarify · clock paused', 600, 278, 0.47, 0.55], ['One agreed solution', 820, 182, 0.57, 0.66]
  ];
  var TCAPS = [['01', 'It starts with one question.', 0.0, 0.22], ['02', 'Every decision is a knot.', 0.2, 0.32], ['03', 'Roles split the work.', 0.32, 0.45], ['04', 'Some paths loop back.', 0.45, 0.56], ['05', 'Then it comes together.', 0.56, 0.7]];
  /* Portrait variant for phones: the same story flowing top to bottom. */
  var THREAD_P = [
    { d: 'M200 20 V120', a: 0.04, b: 0.17 },
    { d: 'M174 146 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0', a: 0.17, b: 0.25 },
    { d: 'M200 172 C200 212 90 210 90 250 V400', a: 0.25, b: 0.38 },
    { d: 'M200 172 V400', a: 0.27, b: 0.4 },
    { d: 'M200 172 C200 212 310 210 310 250 V400', a: 0.29, b: 0.42 },
    { d: 'M200 372 C254 372 254 300 204 300', a: 0.42, b: 0.52, cls: 'loop' },
    { d: 'M90 400 C90 440 200 430 200 470', a: 0.52, b: 0.6 },
    { d: 'M200 400 V470', a: 0.52, b: 0.6 },
    { d: 'M310 400 C310 440 200 430 200 470', a: 0.52, b: 0.6 },
    { d: 'M200 470 C200 560 380 556 380 620 C380 652 368 664 350 664 H50', a: 0.6, b: 0.8 },
    { d: 'M50 664 C22 664 14 700 14 770', a: 0.86, b: 0.98 }
  ];
  var TLABELS_P = [
    ['A question', 214, 64, 0.06, 0.2], ['Decide', 236, 152, 0.2, 0.3], ['Applicant', 22, 236, 0.33, 0.44], ['Reviewer', 208, 262, 0.35, 0.44], ['Approver', 318, 236, 0.37, 0.44],
    ['Clarify', 244, 342, 0.47, 0.55], ['One agreed solution', 214, 506, 0.57, 0.66]
  ];
  function thread(host) {
    var stage = host.querySelector('.i-stage'), p = null, narrow = null;
    function build() {
      narrow = stage.clientWidth < 640;
      var TH = narrow ? THREAD_P : THREAD, TL = narrow ? TLABELS_P : TLABELS;
      Array.prototype.slice.call(stage.children).forEach(function (c) { if (!c.classList.contains('i-skip')) c.remove(); });
      var svg = '<svg class="i3-svg' + (narrow ? ' tall' : '') + '" viewBox="' + (narrow ? '0 0 400 780' : '0 0 1000 620') + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><filter id="i3g" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1200" height="1000"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
        TH.map(function (q) { return '<path class="i3-ghost" d="' + q.d + '" pathLength="1"/>'; }).join('') +
        TH.map(function (q) { return '<path class="i3-p' + (q.cls ? ' ' + q.cls : '') + '" d="' + q.d + '" pathLength="1" filter="url(#i3g)"/>'; }).join('') +
        '<circle class="i3-dot" r="6" cx="' + (narrow ? 200 : 60) + '" cy="' + (narrow ? 20 : 150) + '"/>' +
        TL.map(function (l) { return '<text class="i3-l" x="' + l[1] + '" y="' + l[2] + '">' + l[0] + '</text>'; }).join('') +
        (narrow ? '<text class="i3-name" x="200" y="642" text-anchor="middle" style="font-size:46px;letter-spacing:-2px">Abhishek Yadav</text><text class="i3-role" x="200" y="712" text-anchor="middle">Senior IT Business Analyst</text>'
                : '<text class="i3-name" x="500" y="505" text-anchor="middle">Abhishek Yadav</text><text class="i3-role" x="500" y="578" text-anchor="middle">Senior IT Business Analyst · turning complexity into clarity</text>') + '</svg>';
      stage.insertAdjacentHTML('beforeend', svg + '<div class="i3-caps">' + TCAPS.map(function (c) { return '<p class="i-cap"><span>' + c[0] + '</span>' + c[1] + '</p>'; }).join('') + '</div><span class="i-cue">Scroll ↓</span>');
      var paths = stage.querySelectorAll('.i3-p'), labels = stage.querySelectorAll('.i3-l'), caps = stage.querySelectorAll('.i3-caps .i-cap'), dot = stage.querySelector('.i3-dot'), name = stage.querySelector('.i3-name'), role = stage.querySelector('.i3-role'), cue = stage.querySelector('.i-cue');
      return function render(t) {
        var tip = null;
        TH.forEach(function (q, i) {
          var k = win(t, q.a, q.b); paths[i].style.strokeDashoffset = (1 - k).toFixed(4); paths[i].style.visibility = k > 0 ? 'visible' : 'hidden';
          if (k > 0 && k < 1) tip = [paths[i], k];
        });
        if (tip) { var L = tip[0].getTotalLength(), pt = tip[0].getPointAtLength(L * tip[1]); dot.setAttribute('cx', pt.x.toFixed(1)); dot.setAttribute('cy', pt.y.toFixed(1)); dot.style.opacity = 1; }
        else dot.style.opacity = t < 0.04 ? 1 : 0;
        TL.forEach(function (l, i) { labels[i].style.opacity = band(t, l[3], l[4] + 0.5, 0.05).toFixed(3); });
        caps.forEach(function (c, i) { c.style.opacity = band(t, TCAPS[i][2], TCAPS[i][3]).toFixed(3); });
        name.style.opacity = win(t, 0.72, 0.84).toFixed(3); role.style.opacity = win(t, 0.78, 0.88).toFixed(3);
        cue.style.opacity = win(t, 0.86, 0.95).toFixed(3);
      };
    }
    var render = build();
    p = new Pinned(host, function (t) { render(t); }); p.start();
    var onR = function () { if ((stage.clientWidth < 640) !== narrow) { render = build(); p.refresh(); } };
    addEventListener('resize', onR);
    return function () { p.stop(); removeEventListener('resize', onR); };
  }

  /* ---------------- 5 · Blueprint assembly ---------------- */
  function rp(x, y, w, h, r) { return 'M' + (x + r) + ' ' + y + ' H' + (x + w - r) + ' Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + ' V' + (y + h - r) + ' Q' + (x + w) + ' ' + (y + h) + ' ' + (x + w - r) + ' ' + (y + h) + ' H' + (x + r) + ' Q' + x + ' ' + (y + h) + ' ' + x + ' ' + (y + h - r) + ' V' + (y + r) + ' Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'Z'; }
  function dia(cx, cy, s) { return 'M' + cx + ' ' + (cy - s) + ' L' + (cx + s) + ' ' + cy + ' L' + cx + ' ' + (cy + s) + ' L' + (cx - s) + ' ' + cy + 'Z'; }
  function blueprint(host) {
    var stage = host.querySelector('.i-stage'), items = [], LANES = ['APPLICANT', 'REVIEWER', 'APPROVER', 'FINANCE'];
    LANES.forEach(function (l, i) { var y = 40 + i * 108; items.push({ d: rp(70, y, 860, 96, 6), a: 0.03 + i * 0.03, b: 0.12 + i * 0.03, cls: 'lane', t: [l, 84, y + 18] }); });
    var steps = [['Apply', 130, 0], ['Docs', 250, 0], ['Review', 330, 1], ['Inspect', 520, 1], ['Recommend', 640, 1], ['Pay · BG', 660, 3], ['eSign', 800, 2]];
    steps.forEach(function (s, i) { var y = 40 + s[2] * 108 + 34; items.push({ d: rp(s[1], y, 96, 40, 8), a: 0.18 + i * 0.03, b: 0.26 + i * 0.03, cls: 'step', t: [s[0], s[1] + 48, y + 25, 'mid'] }); });
    items.push({ d: dia(460, 202, 26), a: 0.42, b: 0.5, cls: 'gate', t: ['OK?', 460, 206, 'mid'] });
    items.push({ d: dia(560, 310, 26), a: 0.45, b: 0.53, cls: 'gate', t: ['Approve?', 560, 314, 'mid'] });
    items.push({ d: 'M' + 840 + ' ' + 74 + ' m-18 0 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0', a: 0.47, b: 0.53, cls: 'step', t: ['Issued', 840, 112, 'mid'] });
    var arrows = ['M226 94 H250', 'M298 114 V140 H340 V182', 'M426 202 H434', 'M486 202 H520', 'M616 202 H640', 'M688 222 V290 H586', 'M560 336 V418 H660', 'M756 418 H778 V310 H800', 'M848 290 V92'];
    arrows.forEach(function (d, i) { items.push({ d: d, a: 0.53 + i * 0.012, b: 0.6 + i * 0.012, cls: 'arrow' }); });
    items.push({ d: 'M460 176 V140 H178 V114', a: 0.66, b: 0.74, cls: 'ret', t: ['clarify · clock paused', 300, 132] });
    items.push({ d: 'M730 438 V472 H684 V438', a: 0.68, b: 0.76, cls: 'ret', t: ['re-upload', 640, 490] });
    items.push({ d: 'M346 84 L372 62 H400', a: 0.72, b: 0.78, cls: 'lead', t: ['RULE-01 · all mandatory documents', 404, 66, 'note'] });
    items.push({ d: rp(600, 500, 330, 84, 2) + ' M600 528 H930 M600 556 H930 M780 556 V584', a: 0.76, b: 0.86, cls: 'block' });
    var TB = [['DRAWING  Permission workflow', 612, 519], ['DRAWN BY  A. Yadav · Business Analyst', 612, 547], ['REV  1.0', 612, 575], ['STATUS  Approved', 792, 575]];
    var svg = '<svg class="i5-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><marker id="i5a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="i5-ah"/></marker></defs>' +
      items.map(function (it) { return '<path class="i5-' + it.cls + '" d="' + it.d + '" pathLength="1"' + (it.cls === 'arrow' || it.cls === 'ret' ? ' marker-end="url(#i5a)"' : '') + '/>'; }).join('') +
      items.map(function (it, i) { return it.t ? '<text class="i5-t ' + (it.t[3] || '') + '" data-i="' + i + '" x="' + it.t[1] + '" y="' + it.t[2] + '"' + (it.t[3] === 'mid' ? ' text-anchor="middle"' : '') + '>' + it.t[0] + '</text>' : ''; }).join('') +
      TB.map(function (r) { return '<text class="i5-tb" x="' + r[1] + '" y="' + r[2] + '">' + r[0] + '</text>'; }).join('') + '</svg>';
    stage.insertAdjacentHTML('beforeend', '<div class="i5-wrap">' + svg + '</div><div class="i5-hero"><span class="i-eb">Abhishek Yadav</span><h2>Senior IT Business Analyst.</h2><p>I design how systems should work, before anyone builds them.</p></div><p class="i-cap i5-cap">Drawing a permission workflow, one line at a time.</p><span class="i-cue">Scroll ↓</span>');
    var paths = stage.querySelectorAll('.i5-svg path[pathLength]'), texts = stage.querySelectorAll('.i5-t'), tbs = stage.querySelectorAll('.i5-tb'), wrap = stage.querySelector('.i5-wrap'), hero = stage.querySelector('.i5-hero'), cap = stage.querySelector('.i5-cap'), cue = stage.querySelector('.i-cue');
    function render(t) {
      items.forEach(function (it, i) { var k = win(t, it.a, it.b); paths[i].style.strokeDashoffset = (1 - k).toFixed(4); paths[i].style.visibility = k > 0 ? 'visible' : 'hidden'; });
      texts.forEach(function (tx) { var it = items[+tx.getAttribute('data-i')]; tx.style.opacity = win(t, it.b - 0.03, it.b + 0.02).toFixed(3); });
      tbs.forEach(function (tx, i) { tx.style.opacity = win(t, 0.8 + i * 0.015, 0.84 + i * 0.015).toFixed(3); });
      var s = win(t, 0.86, 0.96), narrow = stage.clientWidth < 760;
      wrap.style.transform = narrow ? 'translateY(' + (-s * 24) + '%) scale(' + (1 - 0.35 * s).toFixed(3) + ')' : 'translate(' + (s * 26).toFixed(2) + '%,' + (-s * 4).toFixed(2) + '%) scale(' + (1 - 0.42 * s).toFixed(3) + ')';
      hero.style.opacity = s.toFixed(3); hero.style.transform = 'translateY(' + ((1 - s) * 20).toFixed(1) + 'px)';
      cap.style.opacity = band(t, -0.1, 0.8).toFixed(3); cue.style.opacity = win(t, 0.9, 0.97).toFixed(3);
    }
    var p = new Pinned(host, render); p.start();
    return function () { p.stop(); };
  }

  window.PFIntros = { chaos: chaos, thread: thread, blueprint: blueprint };
})();
