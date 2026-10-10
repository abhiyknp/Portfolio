/* Scroll intro, "A request's journey". A pinned stage where one stakeholder request becomes discovery notes,
   then a requirements baseline, then a traced set (objective → requirement → function → story → test), then
   released along a night highway. Cards are HTML in a CSS 3D space with a small JS camera, so text stays crisp
   and theme-aware. Progress comes from the real scroll position inside the intro section. Reduced motion
   renders a static storyboard instead. All card content is illustrative. */
(function () {
  'use strict';

  var NOTES = [
    ['Symptom', 'Files bounce back two or more times'], ['Symptom', 'Reviewers ask for the same document again'], ['Symptom', 'Applicants unsure what is missing'],
    ['Symptom', 'Long waits blamed on the authority'], ['Symptom', 'Guarantees rejected late'], ['Symptom', 'Support calls spike near deadlines'],
    ['Cause?', 'Guidance unclear per application type'], ['Cause?', 'No validation at submission'], ['Cause?', 'Reviewers phrase requests differently'],
    ['Cause?', 'Free-text remarks only'], ['Cause?', 'Wrong page uploaded'], ['Cause?', 'No pause rule in reports'],
    ['Need', 'Ask once, precisely'], ['Need', 'Respond inside the portal'], ['Need', 'A fair turnaround measure'], ['Need', 'Evidence for every decision'],
    ['Need', 'See pending work by stage'], ['Need', 'Fewer mandatory fields (as asked)'],
    ['Constraint', 'Policy owned by the ministry'], ['Constraint', 'Payment platform is fixed'], ['Constraint', 'eSign for final approval'],
    ['Constraint', 'Mobile users, patchy network'], ['Constraint', 'Audit trail is mandatory'],
    ['Stakeholder', 'Applicant representative'], ['Stakeholder', 'Reviewing officer'], ['Stakeholder', 'Approving authority'], ['Stakeholder', 'Finance user'],
    ['Stakeholder', 'Programme team'], ['Stakeholder', 'QA lead'],
    ['Question', 'Who owns the reason list?'], ['Question', 'Does a partial reply resume the clock?'], ['Question', 'Is there a re-upload limit?'],
    ['Question', 'Which fields are used later?'], ['Question', 'What is the response window?'], ['Question', 'Is the field needed at submission?'],
    ['Assumption', 'Applicants have verified mobiles'], ['Assumption', 'Templates approved by week 2'],
    ['Data', 'Sample 200 clarification remarks'], ['Data', 'Time in stage from history'], ['Data', 'Count reasons by type'], ['Data', 'Compare regions'], ['Data', 'Field usage by stage']
  ];
  var BACKS = [
    ['OBJ-1', 'Fewer avoidable clarification cycles'], ['OBJ-2', 'Clarification time visible and fair'], ['OBJ-3', 'Defensible, auditable decisions'],
    ['BR-01', 'A reason recorded for every clarification'], ['BR-02', 'Applicant responds within the application'], ['BR-03', 'Applicant waiting time measured separately'],
    ['BR-04', 'Reminder before the window ends'], ['BR-05', 'Every clarification event in history'], ['BR-06', 'Admins maintain the reason list'],
    ['FR-03', 'Block submission until mandatory documents attached'], ['FR-05', 'Chainage from < to, validated'], ['FR-09', 'Raise clarification with at least one reason'],
    ['FR-10', 'Respond with note and documents'], ['FR-11', 'Pause and resume the authority clock'], ['FR-12', 'Reminder by template'],
    ['FR-13', 'Return or reject needs a reason'], ['FR-14', 'Re-upload an invalid guarantee'], ['FR-16', 'Notification failure never blocks status'],
    ['US-101', 'Reviewer raises a clarification'], ['US-102', 'Applicant responds in one step'], ['US-103', 'Clock pauses while the applicant works'],
    ['US-104', 'Queue filter: changed since last look'], ['US-105', 'Reminder before the deadline'], ['US-106', 'Admin edits reason codes'],
    ['US-110', 'Status history audit'], ['US-121', 'Finance marks guarantee invalid'], ['US-122', 'Applicant re-uploads guarantee'],
    ['US-130', 'Guarantee valid on the required date'], ['US-140', 'Payment pending state'], ['US-141', 'Daily reconciliation'],
    ['TC-01', 'Raise with one reason'], ['TC-02', 'No reason: blocked'], ['TC-03', 'Remarks at the limit'], ['TC-04', 'Non-assigned reviewer refused'],
    ['TC-06', 'Response returns file to queue'], ['TC-11', 'Clock excludes paused days'], ['TC-41', 'Validity = required date: accept'],
    ['TC-42', 'One day before: reject'], ['TC-50', 'Payment timeout: pending'], ['TC-51', 'Mismatch on reconciliation list'],
    ['TC-60', 'SMS down, status still changes'], ['TC-61', 'Regression: approval flow unchanged']
  ];
  var TYPES = [['OBJ', 3], ['BR', 6], ['FR', 9], ['US', 12], ['TC', 12]];
  var N = BACKS.length;
  var typeOf = []; TYPES.forEach(function (t, ti) { for (var i = 0; i < t[1]; i++) typeOf.push(ti); });
  var STEPS = [
    ['01', 'Discover', 'Separate symptoms, causes, needs and constraints before proposing anything. The request as asked is one input, not the answer.'],
    ['02', 'Specify', 'Turn what was agreed into a numbered, testable requirements baseline that the sponsor can sign off.'],
    ['03', 'Trace', 'Link every objective to its requirements, stories and tests. Change one rule and you can see everything it touches.'],
    ['04', 'Release', 'Tested, signed off and shipped, with the right people ready and the outcome measured afterwards.']
  ];
  /* Keyframes: progress t → stage index. Holds between transitions. */
  var KEYS = [[0, 0], [0.07, 0], [0.16, 1], [0.27, 1], [0.39, 2], [0.47, 2], [0.57, 3], [0.66, 3], [0.76, 4], [1, 4]];
  var CAPS = [[0.13, 0.31], [0.33, 0.5], [0.52, 0.69], [0.71, 0.9]];

  var host, stage, world, cards = [], svg, lines = [], road, stones = [], sheet, night, bubble, caps = [], finale, raf = 0, cur = 0, target = 0, last = 0, layout = null, seed = 11, live = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function win(t, a, b, f) { f = f || 0.035; return clamp(Math.min((t - a) / f, (b - t) / f), 0, 1); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function markup() {
    var c = '';
    for (var i = 0; i < N; i++) {
      var n = NOTES[i], b = BACKS[i];
      c += '<div class="ic-card ic-t' + typeOf[i] + '"><div class="ic-face ic-front"><span class="ic-tag">' + n[0] + '</span><span class="ic-txt">' + esc(n[1]) + '</span></div>' +
        '<div class="ic-face ic-back"><span class="ic-id">' + b[0] + '</span><span class="ic-txt">' + esc(b[1]) + '</span>' + (typeOf[i] === 4 ? '<span class="ic-tick" aria-hidden="true"></span>' : '') + '</div></div>';
    }
    var st = ''; for (var k = 0; k < 12; k++) st += '<div class="ic-stone"><span></span></div>';
    return '<div class="ic-stage" role="img" aria-label="Animated introduction: a stakeholder request becomes discovery notes, a requirements baseline, a traced set of stories and tests, and a release.">' +
      '<div class="ic-night"></div><svg class="ic-links" aria-hidden="true"></svg><div class="ic-world"><div class="ic-road"></div>' + st + '<div class="ic-sheet"><span>Requirements baseline · v1.0</span><span>Approved for build</span></div>' + c + '</div>' +
            '<div class="ic-bubble"><p>"Can we make fewer fields mandatory?"</p><span>Applicant representative · Monday, 10:12</span></div>' +
      STEPS.map(function (s) { return '<div class="ic-cap"><p class="kicker"><span class="km">' + s[0] + '</span> A request\'s journey</p><h2>' + s[1] + '</h2><p>' + s[2] + '</p></div>'; }).join('') +
      '<div class="ic-finale"><p class="kicker"><span class="km">km 12+000</span> Released</p><h2>Abhishek Yadav</h2><p>Senior IT Business Analyst. Seven years turning requests like that one into traceable, tested, released software.</p><span class="ic-down">Scroll to the overview ↓</span></div>' +
      '<div class="ic-hint">Scroll to follow one request ↓</div>' +
      '<button class="ic-skip" type="button" data-act="skip-intro">Skip intro</button>' +
      '<div class="ic-rail" aria-hidden="true">' + STEPS.map(function (s) { return '<span title="' + s[1] + '"></span>'; }).join('') + '</div>' +
      '<p class="ic-note">Illustrative example. IDs and content are invented to show the method.</p>' +
    '</div>';
  }
  function storyboard() {
    return '<div class="ic-board wrap"><p class="kicker">A request\'s journey · illustrative</p><div class="ic-board-row">' +
      '<div class="panel"><strong>The ask</strong><p class="small">"Can we make fewer fields mandatory?"</p></div>' +
      STEPS.map(function (s) { return '<div class="panel"><strong>' + s[0] + ' ' + s[1] + '</strong><p class="small">' + s[2] + '</p></div>'; }).join('') + '</div></div>';
  }

  function computeLayout() {
    var w = stage.clientWidth, h = stage.clientHeight, phone = w < 640;
    var W = phone ? 128 : 172, H = phone ? 84 : 106, L = { w: w, h: h, W: W, H: H, P: phone ? 700 : 1000, S: [[], [], [], [], []] };
    seed = 11;
    for (var i = 0; i < N; i++) {
      L.S[0].push({ x: (rnd() - 0.5) * 40, y: (rnd() - 0.5) * 30, z: -200, rx: 0, ry: 0, rz: 0, s: 0.2, o: 0 });
      L.S[1].push({ x: (rnd() * 2 - 1) * w * 0.44, y: (rnd() * 2 - 1) * h * 0.36, z: -rnd() * 700 + 120, rx: (rnd() - 0.5) * 50, ry: (rnd() - 0.5) * 70, rz: (rnd() - 0.5) * 24, s: 1, o: 1 });
    }
    var cols = w > 1000 ? 7 : w > 640 ? 6 : 4, rows = Math.ceil(N / cols), cw = W + 14, ch = H + 12;
    var gs = Math.min(1, (w * 0.88) / (cols * cw), (h * 0.62) / (rows * ch));
    L.sheet = { w: cols * cw * gs + 40, h: rows * ch * gs + 70, gs: gs };
    for (i = 0; i < N; i++) {
      var c = i % cols, r = Math.floor(i / cols);
      L.S[2].push({ x: (c - (cols - 1) / 2) * cw * gs, y: (r - (rows - 1) / 2) * ch * gs + 14 - h * 0.05, z: 0, rx: 0, ry: 180, rz: 0, s: gs, o: 1 });
    }
    var colGap = Math.min(w * 0.17, 220), ts = clamp(colGap / W * 0.82, 0.38, 0.72), start = 0;
    L.cols = [];
    TYPES.forEach(function (t, ti) {
      var n = t[1], step = Math.min((h * 0.58) / n, H * ts + 10), idx = [];
      for (var k = 0; k < n; k++) {
        L.S[3][start + k] = { x: (ti - 2) * colGap + (k % 2 ? 1 : -1) * (n > 6 ? W * ts * 0.18 : 0), y: (k - (n - 1) / 2) * step - h * 0.01, z: (k % 2) * -40, rx: 0, ry: 180, rz: 0, s: ts, o: 1 };
        idx.push(start + k);
      }
      L.cols.push(idx); start += n;
    });
    L.links = [];
    for (var ci = 1; ci < L.cols.length; ci++) L.cols[ci].forEach(function (k, j) { L.links.push([L.cols[ci - 1][Math.floor(j * L.cols[ci - 1].length / L.cols[ci].length)], k]); });
    L.ground = h * (phone ? 0.2 : 0.24); L.half = Math.min(w * (phone ? 0.16 : 0.15), 210); L.gap = phone ? 220 : 280;
    for (i = 0; i < N; i++) {
      var side = i % 2 ? 1 : -1, rs = phone ? 0.78 : 1;
      L.S[4].push({ x: side * (L.half + W * rs * 0.62 + 20), y: L.ground - H * rs * 0.62, z: -220 - Math.floor(i / 2) * L.gap, rx: 0, ry: 180 - side * 24, rz: 0, s: rs, o: 1, road: true });
    }
    L.travel = Math.ceil(N / 2) * L.gap - 100;
    return L;
  }

  function stageAt(t) {
    for (var i = 1; i < KEYS.length; i++) if (t <= KEYS[i][0]) { var a = KEYS[i - 1], b = KEYS[i]; return [a[1], b[1], b[0] === a[0] ? 1 : (t - a[0]) / (b[0] - a[0])]; }
    return [4, 4, 1];
  }
  function project(x, y, z) { var f = layout.P / (layout.P - z); return [layout.w / 2 + x * f, layout.h * 0.47 + y * f, f]; }

  function render(t) {
    var L = layout, st = stageAt(t), A = L.S[st[0]], B = L.S[st[1]], k = st[2];
    var travel = ease(clamp((t - 0.76) / 0.15, 0, 1)) * L.travel;
    var fin = clamp((t - 0.88) / 0.06, 0, 1);
    var spin = st[0] === 1 && st[1] === 1 ? (t - 0.16) * 2.2 : st[0] === 0 && st[1] === 1 ? 0 : st[1] === 2 && st[0] === 1 ? 0.24 * 2.2 * (1 - k) : 0;
    var sinS = Math.sin(spin * 0.5), cosS = Math.cos(spin * 0.5);
    var pos = [];
    for (var i = 0; i < N; i++) {
      var d = (i / N) * 0.35, kk = ease(clamp((k - d) / 0.65, 0, 1)), a = A[i], b = B[i];
      var x = a.x + (b.x - a.x) * kk, y = a.y + (b.y - a.y) * kk, z = a.z + (b.z - a.z) * kk;
      if (st[0] === 1 || st[1] === 1) { var zc = z + 200, xr = x * cosS - zc * sinS * 0.6; z = x * sinS * 0.6 + zc * cosS - 200; x = xr; }
      var ry = a.ry + (b.ry - a.ry) * kk, rx = a.rx + (b.rx - a.rx) * kk, rz = a.rz + (b.rz - a.rz) * kk, s = a.s + (b.s - a.s) * kk, o = a.o + (b.o - a.o) * kk;
      if (b.road || a.road) { var zt = z + travel * (b.road ? 1 : 0); if (zt > 380) o *= clamp(1 - (zt - 380) / 220, 0, 1); if (zt < -2600) o *= clamp(1 - (-2600 - zt) / 600, 0, 1); z = zt; }
      o *= 1 - fin;
      var el = cards[i];
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateX(' + rx.toFixed(1) + 'deg) rotateY(' + ry.toFixed(1) + 'deg) rotateZ(' + rz.toFixed(1) + 'deg) scale(' + s.toFixed(3) + ')';
      el.style.setProperty('--o', o.toFixed(3)); /* on the faces: opacity on the card itself would flatten its 3D flip */
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      if (typeOf[i] === 4) el.style.setProperty('--tick', clamp((t - 0.73 - (i - 30) * 0.004) / 0.03, 0, 1).toFixed(2));
      pos.push([x, y, z, o]);
    }
    /* Trace links draw in progressively and fade before the road. */
    var lo = Math.min(clamp((t - 0.53) / 0.06, 0, 1), 1 - clamp((t - 0.67) / 0.04, 0, 1)), shown = Math.round(clamp((t - 0.53) / 0.1, 0, 1) * L.links.length), dstr = '';
    if (lo > 0) for (var j = 0; j < shown; j++) {
      var p = project(pos[L.links[j][0]][0], pos[L.links[j][0]][1], pos[L.links[j][0]][2]), q = project(pos[L.links[j][1]][0], pos[L.links[j][1]][1], pos[L.links[j][1]][2]);
      var mx = (p[0] + q[0]) / 2;
      dstr += 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + 'C' + mx.toFixed(1) + ' ' + p[1].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + q[1].toFixed(1) + ' ' + q[0].toFixed(1) + ' ' + q[1].toFixed(1);
    }
    lines.setAttribute('d', dstr); svg.style.opacity = lo.toFixed(3);
    /* Sheet behind the baseline. */
    var so = win(t, 0.36, 0.52, 0.04);
    sheet.style.opacity = so.toFixed(3); sheet.style.visibility = so < 0.01 ? 'hidden' : 'visible';
    /* Night highway. */
    var ro = clamp((t - 0.66) / 0.08, 0, 1) * (1 - fin * 0.5);
    night.style.opacity = (clamp((t - 0.66) / 0.08, 0, 1) * 0.94).toFixed(3);
    road.style.opacity = ro.toFixed(3); road.style.visibility = ro < 0.01 ? 'hidden' : 'visible';
    road.style.backgroundPositionY = (-(travel % 160)).toFixed(1) + 'px';
    stones.forEach(function (s, n) {
      var side = n % 2 ? 1 : -1, span = 12 * 330, z = -180 - n * 330 + (travel % span);
      if (z > 300) z -= span;
      var o = ro * clamp(1 - (z - 160) / 140, 0, 1) * clamp((z + 3600) / 500, 0, 1);
      s.style.transform = 'translate3d(' + (side * (L.half + 8)).toFixed(1) + 'px,' + (L.ground - 34).toFixed(1) + 'px,' + z.toFixed(1) + 'px)';
      s.style.opacity = o.toFixed(3); s.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    });
    /* Overlays. */
    var bo = 1 - clamp((t - 0.06) / 0.05, 0, 1);
    bubble.style.opacity = bo.toFixed(3); bubble.style.transform = 'translate(-50%,-50%) scale(' + (1 + (1 - bo) * 0.35).toFixed(3) + ')'; bubble.style.visibility = bo < 0.01 ? 'hidden' : 'visible';
    caps.forEach(function (c, n) { var o = win(t, CAPS[n][0], CAPS[n][1]); c.style.opacity = o.toFixed(3); c.style.visibility = o < 0.01 ? 'hidden' : 'visible'; c.style.transform = 'translateY(' + ((1 - o) * 14).toFixed(1) + 'px)'; });
    finale.style.opacity = fin.toFixed(3); finale.style.visibility = fin < 0.01 ? 'hidden' : 'visible'; finale.style.transform = 'translate(-50%,-50%) translateY(' + ((1 - fin) * 18).toFixed(1) + 'px)';
    host.querySelector('.ic-hint').style.opacity = (1 - clamp(t / 0.04, 0, 1)).toFixed(3);
    var rail = host.querySelectorAll('.ic-rail span');
    rail.forEach(function (r, n) { r.classList.toggle('on', t >= CAPS[n][0]); });
    stage.classList.toggle('is-night', t > 0.7);
  }

  function progress() {
    var r = host.getBoundingClientRect(), span = host.offsetHeight - innerHeight;
    return clamp(-r.top / Math.max(1, span), 0, 1);
  }
  function frame(now) {
    raf = 0;
    if (!live) return;
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    cur += (target - cur) * Math.min(1, dt * 7);
    if (Math.abs(target - cur) < 0.0004) cur = target;
    render(cur);
    if (cur !== target) raf = requestAnimationFrame(frame);
  }
  function onScroll() {
    if (!live) return;
    target = progress();
    var r = host.getBoundingClientRect();
    var visible = r.bottom > 0 && r.top < innerHeight;
    if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function onResize() { if (!live) return; layout = computeLayout(); svg.setAttribute('viewBox', '0 0 ' + layout.w + ' ' + layout.h); world.style.perspective = layout.P + 'px'; applySheet(); render(cur); }
  function applySheet() {
    road.style.width = (layout.half * 2) + 'px';
    road.style.transform = 'translate3d(' + (-layout.half) + 'px,' + layout.ground + 'px,900px) rotateX(-90deg)';
    sheet.style.width = layout.sheet.w + 'px'; sheet.style.height = layout.sheet.h + 'px'; sheet.style.transform = 'translate3d(-50%,-50%,-60px) translateY(' + (-layout.h * 0.05 + 14) + 'px)'; }

  window.PFIntro = {
    mount: function (el) {
      this.unmount();
      host = el;
      if (reduce.matches) { host.classList.add('is-static'); host.innerHTML = storyboard(); return; }
      host.classList.remove('is-static');
      host.innerHTML = markup();
      stage = host.querySelector('.ic-stage'); world = host.querySelector('.ic-world'); svg = host.querySelector('.ic-links');
      svg.innerHTML = '<path class="ic-link" d=""/>'; lines = svg.firstChild;
      cards = Array.prototype.slice.call(host.querySelectorAll('.ic-card'));
      stones = Array.prototype.slice.call(host.querySelectorAll('.ic-stone'));
      road = host.querySelector('.ic-road'); sheet = host.querySelector('.ic-sheet'); night = host.querySelector('.ic-night'); bubble = host.querySelector('.ic-bubble');
      caps = Array.prototype.slice.call(host.querySelectorAll('.ic-cap')); finale = host.querySelector('.ic-finale');
      live = true;
      onResize();
      cur = target = progress(); render(cur);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
    },
    unmount: function () {
      live = false; if (raf) cancelAnimationFrame(raf); raf = 0;
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize);
    },
    /* For automated checks. */
    state: function () { return { live: live, t: cur, target: target }; }
  };
  reduce.addEventListener('change', function () { if (host && document.body.contains(host)) window.PFIntro.mount(host); });
})();
