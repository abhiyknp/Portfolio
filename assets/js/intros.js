/* The overview intro, "Chaos to clarity": a pinned stage driven by the scroll position inside its section.
   With reduced motion it renders its final frame without pinning. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      words.push({ w: w, head: head, hi: head ? i - NOISE.length : -1, x: 0.06 + rnd() * 0.84, y: 0.1 + rnd() * 0.8, z: 0.55 + rnd() * 0.75, d: rnd(),
        /* idle drift: each word loops on its own speed and phase */
        ws: 0.35 + Math.random() * 0.5, p1: Math.random() * 6.3, p2: Math.random() * 6.3 });
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
      var settle = win(t, 0.16, 0.56), drift = t * 60, now = reduce ? 0 : performance.now() / 1000;
      els.forEach(function (el, i) {
        var o = words[i], sx = o.x * W + (o.z - 1) * drift, sy = o.y * H, x, y, s, op;
        /* Idle motion on top of the scroll position, so the page never looks frozen. Noise words stay a little restless;
           headline words calm down and stop as they settle into the sentence. */
        var amp = o.head ? 10 * (1 - win(t, 0.2 + o.hi * 0.05, 0.52 + o.hi * 0.03)) : 7 + o.z * 7;
        sx += Math.sin(now * o.ws + o.p1) * amp + (o.head ? 0 : Math.sin(now * 2.1 + o.p2) * 1.2);
        sy += Math.cos(now * o.ws * 0.8 + o.p2) * amp * 0.7;
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
    /* Keep redrawing while the intro is on screen, for the idle drift. Stops off screen and in hidden tabs. */
    var idle = 0, alive = true;
    function tick() { idle = 0; if (!alive) return; var r = host.getBoundingClientRect(); if (!document.hidden && r.bottom > 0 && r.top < innerHeight) p.refresh(); idle = requestAnimationFrame(tick); }
    if (!reduce) idle = requestAnimationFrame(tick);
    return function () { alive = false; if (idle) cancelAnimationFrame(idle); p.stop(); removeEventListener('resize', onR); };
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
  window.PFIntros = { chaos: chaos };
})();
