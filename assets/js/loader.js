/* "Chaos to clarity" loader, shared by the first-visit screen and the stats page.
   Small words stream in from the left and spin around a gold line (over, behind, under, in front), gathering just
   behind its tip. They merge into the tip one at a time and push it on. The line fills smoothly: it creeps forward
   while a step is in progress and catches up when the step completes. When every step is done, the line flashes and
   the caption appears. The line is the progress bar.

   PFLoader.markup(words, caption, label) → HTML for the box
   PFLoader.start(box, { total, onClear }) → { set(step), done }   (onClear runs once the line is full) */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function markup(words, caption, label, total) {
    return '<div class="oc-words" aria-hidden="true">' + words.map(function (w) { return '<span class="oc-w">' + esc(w) + '</span>'; }).join('') + '</div>' +
      '<div class="oc-thread" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="' + (total || 1) + '" aria-valuenow="0">' +
        '<span class="oc-track"></span><span class="oc-fill"></span></div>' +
      '<p class="oc-cap" aria-hidden="true">' + esc(caption) + '</p>';
  }

  function start(box, opts) {
    var thread = box.querySelector('.oc-thread'), fill = box.querySelector('.oc-fill');
    var rnd = function (a, b) { return a + Math.random() * (b - a); }, t0 = performance.now();
    var words = Array.prototype.map.call(box.querySelectorAll('.oc-w'), function (el, i) {
      /* r and off are fractions of the box height, so the swirl keeps its shape at any size. */
      return { el: el, phi: rnd(0, Math.PI * 2), w: rnd(3, 4.2), r: rnd(0.12, 0.32), off: rnd(0.1, 1.7), sway: rnd(0, 6.3), born: t0 + i * 120, speed: rnd(2.2, 3.2), mode: 'in', x: -40 };
    });
    var me = { p: 0, last: t0, stepAt: t0 + 900, step: 0, total: opts.total || 1, eaten: 0, done: false };
    me.set = function (i) {
      if (i === me.step) return;
      me.step = i; me.stepAt = Math.max(me.stepAt, performance.now());
      thread.setAttribute('aria-valuenow', String(i));
    };
    function setWord(o, x, y, sc, op, front) {
      o.el.style.zIndex = front ? 3 : 1;
      o.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-50%) scale(' + sc.toFixed(2) + ')';
      o.el.style.opacity = op.toFixed(2);
    }
    function grab(o, t) { o.mode = 'a'; o.t0 = t; o.x0 = o.x; o.el.classList.add('oc-gold'); }
    (function frame(t) {
      if (!box.isConnected) return;
      var dt = Math.min(0.05, (t - me.last) / 1000); me.last = t;
      var H = box.clientHeight, L = thread.offsetLeft, Wd = thread.offsetWidth, cy = thread.offsetTop + thread.offsetHeight / 2;
      var all = me.step >= me.total;
      var target = all ? 1 : (me.step + 0.9 * (1 - Math.exp(-Math.max(0, t - me.stepAt) / 1400))) / me.total;
      me.p = reduce.matches ? (all ? 1 : me.step / me.total) : me.p + (target - me.p) * Math.min(1, dt * (all ? 4 : 2.5));
      var tip = L + Wd * me.p;
      fill.style.width = (me.p * 100).toFixed(2) + '%';
      fill.style.setProperty('--tipo', Math.min(1, me.p * 30).toFixed(2));
      /* One word merges each time the line covers another share of its length: the one nearest the tip. */
      while (me.eaten < words.length && me.p >= (me.eaten + 1) / (words.length + 1)) {
        var c = null; words.forEach(function (o) { if ((o.mode === 'o' || o.mode === 'in') && t >= o.born && (!c || Math.abs(o.x - tip) < Math.abs(c.x - tip))) c = o; });
        if (!c) break; grab(c, t); me.eaten++;
      }
      if (all && me.p > 0.995) words.forEach(function (o) { if (o.mode === 'o' || o.mode === 'in') { o.born = Math.min(o.born, t); grab(o, t); } });
      words.forEach(function (o) {
        if (o.mode === 'gone' || t < o.born) return;
        /* Behind the tip once it has room; before that, swarming over the start of the line. */
        var R = o.r * H, home = Math.max(tip - o.off * H, L * 0.5 + o.off * H * 0.6);
        if (reduce.matches) { if (o.mode === 'a') { o.mode = 'gone'; o.el.style.opacity = '0'; return; } setWord(o, home, cy - R * Math.cos(o.phi), 1, 0.45, false); return; }
        o.phi += o.w * dt * (o.mode === 'a' ? 2 : 1);
        if (o.mode === 'in') { o.x += o.speed * H * dt; if (o.x >= home) { o.x = home; o.mode = 'o'; } R *= Math.min(1, (o.x + 40) / (H * 0.8)); }
        else if (o.mode === 'o') { o.sway += dt * 0.8; o.x = Math.max(L * 0.5, home + Math.sin(o.sway) * H * 0.07); }
        else {
          var k = Math.max(0, Math.min(1, (t - o.t0) / 600));
          if (k >= 1) { o.mode = 'gone'; o.el.style.opacity = '0'; fill.classList.remove('hit'); void fill.offsetWidth; fill.classList.add('hit'); return; }
          R *= Math.pow(1 - k, 1.4); o.x = o.x0 + (tip - o.x0) * k * k;
        }
        /* phi: 0 above, 90 behind, 180 below, 270 in front */
        var z = Math.sin(o.phi), front = z < 0, op = front ? 1 : 0.28 + 0.4 * (1 - z);
        if (o.mode === 'in') op *= Math.min(1, (o.x + 40) / (H * 0.6));
        if (o.mode === 'a') op = Math.max(0.3, op) * (1 - Math.pow(Math.max(0, Math.min(1, (t - o.t0) / 600)), 3));
        setWord(o, o.x, cy - R * Math.cos(o.phi), 1 - 0.22 * z, op, front);
      });
      if (all && me.p > 0.995 && !me.done && words.every(function (o) { return o.mode === 'gone'; })) {
        me.done = true; box.classList.add('oc-clear');
        if (opts.onClear) opts.onClear();
      }
      requestAnimationFrame(frame);
    })(t0);
    return me;
  }

  window.PFLoader = { markup: markup, start: start, reduce: reduce };
})();
