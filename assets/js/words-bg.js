/* Background: words instead of shapes.
   Overview: faint stakeholder questions roam slowly at different depths. As the reader scrolls, each question turns
   into its answer in gold. At the contact section the answers glide, one by one, into a slowly turning constellation
   joined by faint lines, with a gold spark hopping between them.
   Other pages: a faint constellation of Business Analyst terms turns slowly on the right.
   Every change eases over time rather than following the scroll directly, so nothing snaps. Reduced motion keeps
   everything still. The layer is drawn on one canvas behind the page and pauses in hidden tabs. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var PAIRS = [
    ['who approves this?', 'approval matrix'], ['is this in scope?', 'scope agreed'], ['users are confused', 'user journey'],
    ['need it by Friday', 'release plan'], ['it worked in UAT?', 'UAT signed off'], ['can we add a report?', 'KPI dashboard'],
    ['what does "pending" mean?', 'status model'], ['the data doesn\'t match', 'data mapping'], ['just a small change', 'change request'],
    ['which version?', 'version control'], ['who owns this?', 'RACI'], ['why was it rejected?', 'business rule'],
    ['make it faster', 'NFR: under 3 s'], ['urgent!!', 'prioritised backlog'], ['mobile too?', 'responsive design'],
    ['audit wants proof', 'traceability matrix'], ['one more approval step', 'workflow'], ['same as last time?', 'gap analysis'],
    ['can\'t find the document', 'Confluence page'], ['is it tested?', 'test cases'], ['what did we agree?', 'decision log'],
    ['the vendor said no', 'API contract'], ['duplicate entries', 'validation rule'], ['legacy records?', 'migration plan']
  ];
  var TERMS = ['requirement', 'user story', 'acceptance criteria', 'test case', 'UAT', 'release', 'BRD', 'FRD', 'RTM', 'stakeholder',
    'workflow', 'business rule', 'backlog', 'sprint', 'defect', 'sign-off', 'wireframe', 'API', 'data model', 'KPI', 'process map',
    'scope', 'risk', 'change request', 'decision log', 'SOP', 'gap analysis', 'NFR'];
  /* Related terms, linked in the constellation (indices into TERMS). */
  var TLINKS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [6, 7], [7, 8], [8, 3], [9, 6], [10, 11], [11, 0], [12, 13], [13, 1], [14, 4],
    [15, 5], [16, 1], [17, 18], [18, 7], [19, 21], [20, 10], [21, 0], [22, 23], [23, 0], [24, 9], [25, 10], [26, 0], [27, 0], [5, 15]];

  var cv = document.createElement('canvas'); cv.className = 'words-bg'; cv.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(cv, document.body.firstChild);
  var ctx = cv.getContext('2d'), W = 0, H = 0, narrow = false, col = {};
  function readCol() {
    var cs = getComputedStyle(document.documentElement);
    col = { ink: cs.getPropertyValue('--ink-2').trim(), gold: cs.getPropertyValue('--signal').trim(), line: cs.getPropertyValue('--ink-3').trim(), mono: cs.getPropertyValue('--f-mono').trim() || 'monospace' };
  }
  function size() {
    var dpr = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; narrow = W < 700;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  readCol(); size();
  addEventListener('resize', size);
  new MutationObserver(readCol).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readCol);

  var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function makeWords(count) {
    var out = [];
    for (var i = 0; i < count; i++) {
      var z = 0.35 + rnd() * 0.65;
      out.push({ i: i, x: rnd() * W, y: rnd() * H, z: z, vx: (4 + rnd() * 8) * (rnd() < 0.5 ? -1 : 1), ph: rnd() * 6.3, m: 0,
        th: 0.08 + (i / count) * 0.8 + rnd() * 0.06, d: rnd() * 0.35, p3: [rnd() * 2 - 1, (rnd() * 2 - 1) * 0.8, rnd() * 2 - 1] });
    }
    return out;
  }
  var words = makeWords(narrow ? 14 : PAIRS.length), terms = makeWords(narrow ? 16 : TERMS.length);
  /* Links between answers in the final constellation: a ring plus a few cross links. */
  var ALINKS = []; for (var a = 0; a < words.length; a++) { ALINKS.push([a, (a + 1) % words.length]); if (a % 3 === 0) ALINKS.push([a, (a + 7) % words.length]); }
  var ALABELS = words.map(function (o) { return PAIRS[o.i][1]; });
  /* Phones show fewer terms: keep only links between terms that are shown, and link any term left on its own. */
  TLINKS = TLINKS.filter(function (l) { return l[0] < terms.length && l[1] < terms.length; });
  for (var q = 1; q < terms.length; q++) if (!TLINKS.some(function (l) { return l[0] === q || l[1] === q; })) TLINKS.push([q, 0]);

  function smooth(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function ease(cur, target, rate, dt) { return reduce.matches ? target : cur + (target - cur) * Math.min(1, dt * rate); }
  function isHome() { return document.body.getAttribute('data-route') === 'home'; }
  function introBase() { return isHome() && window.PFIntroBase ? window.PFIntroBase() : 0; }
  /* Page progress on the overview: from the end of the intro to the contact section. */
  function progress() {
    var base = introBase(), ct = document.getElementById('contact');
    var end = ct ? ct.getBoundingClientRect().top + scrollY - innerHeight * 0.3 : document.documentElement.scrollHeight - innerHeight;
    return Math.min(1, Math.max(0, (scrollY - base) / Math.max(1, end - base)));
  }
  /* How far the contact section has come into view (0 to 1). */
  function nearContact() {
    var ct = document.getElementById('contact'); if (!ct) return 0;
    var r = ct.getBoundingClientRect(); return smooth(0, 1, (innerHeight * 1.15 - r.top) / (innerHeight * 0.9));
  }
  /* Constellation projection: points on a slowly turning sphere, drawn with simple perspective. */
  function project(list, cx, cy, R, t, Ry) {
    Ry = Ry || R;
    var ang = t * 0.06 + 1.4, c = Math.cos(ang), s = Math.sin(ang);
    return list.map(function (o) {
      var x = o.p3[0], y = o.p3[1], z = o.p3[2], xr = x * c + z * s, zr = -x * s + z * c, k = 2.6 / (2.6 + zr);
      return { x: cx + xr * R * k, y: cy + (y + Math.sin(t * 0.5 + o.ph) * 0.03) * Ry * k, k: k };
    });
  }
  function constAlpha(k) { return 0.12 + 0.3 * Math.max(0, k - 0.7) / 0.6; }

  /* Spark state per network, so the overview and inner pages never share indices. */
  function Hop() { this.a = 0; this.b = 1; this.t0 = -9; }
  Hop.prototype.step = function (links, t) {
    if (t - this.t0 < 1.4) return;
    var me = this, nx = links.filter(function (l) { return l[0] === me.b || l[1] === me.b; });
    var l = nx[Math.floor(Math.random() * nx.length)] || links[0];
    this.a = this.b; this.b = l[0] === this.b ? l[1] : l[0]; this.t0 = t;
  };
  var hopHome = new Hop(), hopPage = new Hop();

  function drawLinks(pts, links, alpha) {
    if (alpha < 0.005) return;
    ctx.lineWidth = 1; ctx.strokeStyle = col.line;
    links.forEach(function (l) { var p = pts[l[0]], q = pts[l[1]]; ctx.globalAlpha = 0.12 * alpha * Math.min(p.k, q.k); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); });
  }
  function drawSpark(pts, hop, links, alpha, t) {
    if (alpha < 0.005 || reduce.matches) return 0;
    hop.step(links, t);
    var u = Math.min(1, (t - hop.t0) / 1.1), A = pts[hop.a], B = pts[hop.b], e = u * u * (3 - 2 * u);
    ctx.globalAlpha = 0.9 * alpha; ctx.fillStyle = col.gold; ctx.shadowColor = col.gold; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(A.x + (B.x - A.x) * e, A.y + (B.y - A.y) * e, 3, 0, 6.3); ctx.fill(); ctx.shadowBlur = 0;
    return u;
  }
  function text(str, x, y, fs, alpha, gold, glow) {
    if (alpha < 0.004) return;
    ctx.font = '500 ' + fs.toFixed(1) + 'px ' + col.mono; ctx.globalAlpha = Math.min(1, alpha);
    ctx.fillStyle = gold ? col.gold : col.ink;
    if (glow > 0.02) { ctx.shadowColor = col.gold; ctx.shadowBlur = glow * 14; }
    ctx.fillText(str, x, y); ctx.shadowBlur = 0;
  }

  var blend = 0, vis = 0, shown = null, last = performance.now(), t = 0;

  /* Overview: roaming questions → gold answers → constellation. */
  function drawStory(dt, alpha) {
    var p = progress();
    blend = ease(blend, nearContact(), 1.8, dt);
    /* The constellation settles as a wide, slowly turning band in the open space above the contact heading. */
    var cx = narrow ? W * 0.5 : W * 0.57, cy = H * (narrow ? 0.17 : 0.2), R = narrow ? W * 0.3 : W * 0.23, Ry = H * (narrow ? 0.1 : 0.12);
    var cpts = project(words, cx, cy, R, t, Ry), pos = [];
    ctx.textAlign = 'center';
    words.forEach(function (o, i) {
      /* Each word starts its move at its own moment, so they arrive one after another. */
      var e = reduce.matches ? (blend > 0.5 ? 1 : 0) : smooth(o.d, o.d + 0.65, blend);
      if (!reduce.matches) { o.x += o.vx * o.z * (1 - e) * dt; o.ph += dt * 0.4; }
      if (o.x < -260) o.x = W + 40; if (o.x > W + 260) o.x = -40;
      o.m = ease(o.m, smooth(o.th - 0.04, o.th + 0.04, p), 2.5, dt);
      var ry = ((o.y - scrollY * 0.08 * o.z) % (H + 80) + H + 80) % (H + 80) - 40 + Math.sin(o.ph) * 10;
      var c = cpts[i], x = o.x + (c.x - o.x) * e, y = ry + (c.y - ry) * e, k = 1 + (c.k - 1) * e;
      pos.push({ x: x, y: y, k: k, e: e, o: o, c: c });
    });
    var netA = smooth(0.55, 1, blend) * alpha;
    drawLinks(pos, ALINKS, netA);
    var u = drawSpark(pos, hopHome, ALINKS, smooth(0.75, 1, blend) * alpha, t);
    pos.forEach(function (q, i) {
      var o = q.o, base = 0.1 + o.z * 0.2, roamFs = 11 + o.z * 10, fs = roamFs + (10 + 6 * q.c.k - roamFs) * q.e;
      var glow = 1 - Math.abs(o.m - 0.5) * 2, lit = netA > 0.3 && ((i === hopHome.b && u > 0.9) || i === hopHome.a) ? 1.6 : 1;
      var answerA = (base * 1.35 + (constAlpha(q.c.k) * 1.6 - base * 1.35) * q.e) * lit;
      text(PAIRS[o.i][0], q.x, q.y, fs, base * (1 - o.m) * (1 - q.e) * alpha, false, 0);
      text(ALABELS[i], q.x, q.y, fs, (answerA * o.m + glow * 0.3) * alpha, true, glow);
    });
    ctx.textAlign = 'left';
  }
  /* Other pages: a quiet constellation of terms. */
  function drawTerms(alpha) {
    var cx = narrow ? W * 0.5 : W * 0.8, R = narrow ? W * 0.4 : Math.min(W, H) * 0.33, pts = project(terms, cx, H * 0.5, R, t);
    drawLinks(pts, TLINKS, alpha);
    var u = drawSpark(pts, hopPage, TLINKS, alpha, t);
    ctx.textAlign = 'center';
    pts.forEach(function (q, i) {
      var lit = (i === hopPage.b && u > 0.9) || i === hopPage.a;
      text(TERMS[i], q.x, q.y, 10 + 6 * q.k, constAlpha(q.k) * alpha * (lit ? 2.6 : 1), lit, 0);
    });
    ctx.textAlign = 'left';
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (document.hidden) { requestAnimationFrame(frame); return; }
    if (!reduce.matches) t += dt;
    var want = isHome() ? 'home' : 'page';
    /* Switching pages: fade out, swap, fade back in. */
    if (shown !== want) { vis = ease(vis, 0, 6, dt); if (vis < 0.02 || shown === null) { shown = want; vis = 0; } }
    else vis = ease(vis, 1, 2.5, dt);
    ctx.clearRect(0, 0, W, H);
    if (shown === 'home') {
      /* Fade in over the last stretch of the intro, which has its own words. */
      var base = introBase(), introFade = smooth(base - innerHeight * 0.45, base, scrollY);
      var a = vis * introFade * (narrow ? 0.8 : 1);
      if (a > 0.004) drawStory(dt, a);
    } else if (vis > 0.004) drawTerms(vis * (narrow ? 0.4 : 0.5));
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* Exposed for automated checks only. */
  window.__pfWords = {
    get shown() { return shown; }, get vis() { return vis; }, get blend() { return blend; },
    get answered() { return words.filter(function (o) { return o.m > 0.9; }).length; }, get total() { return words.length; }
  };
})();
