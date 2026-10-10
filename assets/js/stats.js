/* Privacy-friendly visit counts with GoatCounter (no cookies, no personal data, no consent banner needed).
   Off until GOATCOUNTER_CODE is set: create a free account at https://www.goatcounter.com, then put the site code
   here (for https://abhishek.goatcounter.com the code is "abhishek"). GoatCounter ignores localhost visits. */
(function () {
  'use strict';
  var GOATCOUNTER_CODE = '';
  if (!GOATCOUNTER_CODE) return;

  var queue = [];
  function send(o) { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count(o); else queue.push(o); }

  /* The site routes with #hash, so each view is counted as its own page. */
  document.addEventListener('pf:route', function () {
    var h = location.hash.slice(1) || 'home';
    if (h === 'summary' || h === 'contact') h = 'home';
    send({ path: '/' + h.split('.')[0] + (h.indexOf('.') > -1 ? '/' + h.split('.').slice(1).join('.') : ''), title: document.title });
  });
  /* Events worth knowing about: résumé downloads, contact clicks and the interactive pieces. */
  document.addEventListener('pf:track', function (e) { send({ path: e.detail, title: e.detail, event: true }); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a, [data-act="copy"]'); if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.hasAttribute('download')) send({ path: 'resume-download', title: 'Résumé downloaded', event: true });
    else if (href.indexOf('mailto:') === 0) send({ path: 'email-click', title: 'Email link clicked', event: true });
    else if (href.indexOf('linkedin.com') > -1) send({ path: 'linkedin-click', title: 'LinkedIn link clicked', event: true });
    else if (a.getAttribute('data-act') === 'copy') send({ path: 'email-copy', title: 'Email copied', event: true });
  });

  var s = document.createElement('script');
  s.async = true; s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + GOATCOUNTER_CODE + '.goatcounter.com/count');
  s.setAttribute('data-goatcounter-settings', '{"no_onload": true}');
  s.onload = function () { queue.splice(0).forEach(send); };
  document.head.appendChild(s);

  var foot = document.querySelector('.site-footer .foot');
  if (foot) foot.insertAdjacentHTML('beforeend', '<p class="small muted">Visits are counted with GoatCounter: no cookies and no personal data.</p>');
})();
