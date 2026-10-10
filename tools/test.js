// End-to-end check of every route and interaction at desktop and phone width, plus reduced-motion and no-WebGL runs.
// Needs a running server (tools/serve.sh) and Playwright. Usage:
//   PF_URL=http://localhost:8780/ THREE_LOCAL=/path/to/three.module.js SHOTS=/tmp/shots node tools/test.js
// THREE_LOCAL serves three.js from disk for machines that cannot reach the CDN. SHOTS saves screenshots.
const fs = require('fs');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const URL = process.env.PF_URL || 'http://localhost:8780/';
const errs = [], log = (...a) => console.log(...a);
const shot = async (pg, name) => { if (process.env.SHOTS) await pg.screenshot({ path: `${process.env.SHOTS}/${name}.png`, fullPage: false }); };

async function page(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', colorScheme: opts.dark ? 'dark' : 'light' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  if (process.env.THREE_LOCAL && !opts.blockThree) await ctx.route(/cdn\.jsdelivr\.net\/npm\/three@0\.160\.0\/build\/three\.module\.js/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(process.env.THREE_LOCAL) }));
  if (opts.blockThree) await ctx.route(/cdn\.jsdelivr\.net/, (r) => r.abort());
  const pg = await ctx.newPage();
  const tag = opts.tag || 'desktop';
  pg.on('pageerror', (e) => errs.push(`${tag} pageerror: ${e.message}`));
  pg.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|fonts\.g|net::/.test(m.text())) errs.push(`${tag} console: ${m.text()}`); });
  return pg;
}
const overflow = async (pg, tag, where) => { const o = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (o > 0) errs.push(`${tag} horizontal overflow ${o}px on ${where}`); };
const go = async (pg, hash) => { await pg.evaluate((h) => { location.hash = h; }, hash); await pg.waitForTimeout(60); };

(async () => {
  const b = await chromium.launch();
  for (const [tag, vp] of [['desktop', { width: 1280, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const pg = await page(b, { viewport: vp, tag });
    await pg.goto(URL + '#home'); await pg.waitForTimeout(800);
    log(tag, 'scene:', await pg.evaluate(() => document.documentElement.getAttribute('data-scene') || 'fallback'));
    await shot(pg, tag + '-home');
    const ib = await pg.evaluate(() => { const el = document.getElementById('intro'); return { top: el.offsetTop, h: el.offsetHeight, ih: innerHeight, cards: el.querySelectorAll('.i3-p').length }; });
    await pg.evaluate(([y]) => window.scrollTo(0, y), [ib.top + 0.6 * (ib.h - ib.ih)]); await pg.waitForTimeout(900);
    const drawn = await pg.evaluate(() => [...document.querySelectorAll('#intro .i3-p')].filter((p) => p.style.visibility === 'visible').length);
    log(tag, 'thread intro:', ib.cards, 'paths |', drawn, 'drawn at 60% scroll | chip hidden:', await pg.evaluate(() => document.getElementById('chainage').classList.contains('is-hidden')));
    if (ib.cards !== 11 || drawn < 6 || drawn > 10) errs.push(`${tag} intro did not follow scroll`);
    await shot(pg, tag + '-intro-trace');
    await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(100); await pg.click('[data-act="skip-intro"]'); await pg.waitForTimeout(300);
    log(tag, 'skip intro → hero top', await pg.evaluate(() => Math.round(document.getElementById('hero').getBoundingClientRect().top)));
    await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(300);
    const f0 = await pg.evaluate(() => window.__pfScene && window.__pfScene.target);
    const km0 = await pg.textContent('#ch-km');
    await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await pg.waitForTimeout(900);
    const f1 = await pg.evaluate(() => window.__pfScene && window.__pfScene.target);
    const cur1 = await pg.evaluate(() => window.__pfScene && window.__pfScene.formation);
    log(tag, 'scroll-linked formation target', f0, '→', f1, '| current', cur1 && cur1.toFixed(2), '| chainage', km0, '→', await pg.textContent('#ch-km'), await pg.textContent('#ch-phase'));
    if (f1 !== undefined && !(f1 > f0)) errs.push(`${tag} scene did not respond to scroll`);
    await overflow(pg, tag, 'home');
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.click('[data-act="chain"][data-i="4"]'); log(tag, 'chain:', (await pg.textContent('#chain-out')).slice(0, 60));
    if (tag === 'phone') { await pg.click('[data-act="menu"]'); log(tag, 'menu open:', await pg.isVisible('#site-nav a[data-nav="studio"]')); await pg.click('#site-nav a[data-nav="studio"]'); await pg.waitForTimeout(80); log(tag, 'after menu nav:', await pg.textContent('h1')); }

    await go(pg, 'skills'); await overflow(pg, tag, 'skills'); await shot(pg, tag + '-skills');
    await pg.fill('#lib-q', 'JQL'); log(tag, 'search JQL:', await pg.textContent('#lib-count'));
    await pg.fill('#lib-q', ''); await pg.click('[data-f="area"][data-v="E"]'); log(tag, 'area E:', await pg.textContent('#lib-count'));
    await pg.click('[data-f="ev"][data-v="recommended"]'); log(tag, 'E + recommended:', await pg.textContent('#lib-count'));
    await pg.click('[data-f="area"][data-v="all"]'); await pg.click('[data-f="ev"][data-v="all"]');
    await pg.fill('#lib-q', 'zzzz'); log(tag, 'empty state:', await pg.isVisible('.empty')); await pg.click('[data-act="lib-reset"]');

    const ids = await pg.evaluate(() => ({ s: PF.skills.map((x) => x.id), c: PF.cases.map((x) => x.id), a: PF.artifacts.map((x) => x.id), sc: PF.scenarios.map((x) => x.id) }));
    for (const id of ids.s) { await go(pg, 'skill.' + id); const n = await pg.$$eval('.sec', (d) => d.length); if (n !== 15) errs.push(`${tag} skill ${id} has ${n} sections`); await overflow(pg, tag, 'skill.' + id); }
    for (const id of ids.c) { await go(pg, 'case.' + id); const n = await pg.$$eval('.sec', (d) => d.length); if (n !== 20) errs.push(`${tag} case ${id} has ${n} sections`); for (const t of await pg.$$('#chapters [role="tab"]')) { await t.click(); await overflow(pg, tag, 'case.' + id + ' chapter'); } await overflow(pg, tag, 'case.' + id); }
    for (const id of ids.a) { await go(pg, 'studio.' + id); const tabs = await pg.$$('[role="tab"]'); for (const t of tabs) { await t.click(); } await overflow(pg, tag, 'studio.' + id); }
    for (const id of ids.sc) { await go(pg, 'scenario.' + id); const opts = await pg.$$('.opt'); for (const o of opts) await o.click(); await overflow(pg, tag, 'scenario.' + id); }
    log(tag, 'rendered', ids.s.length, 'skills,', ids.c.length, 'cases,', ids.a.length, 'artifacts,', ids.sc.length, 'scenarios');

    await go(pg, 'skill.brd'); await pg.click('.skill-tabs [role="tab"] >> nth=3'); log(tag, 'skill interview tab:', (await pg.textContent('.skill-tabs [role="tabpanel"]:not([hidden]) h3')).trim());
    await pg.click('.skill-tabs [role="tab"] >> nth=2'); await pg.click('[data-act="artifact-preview"]'); log(tag, 'modal visible:', await pg.isVisible('#modal')); await shot(pg, tag + '-modal');
    await pg.keyboard.press('Escape'); log(tag, 'modal closed:', await pg.isHidden('#modal'));

    await go(pg, 'case.rajmarg'); await pg.click('[data-act="next-chapter"] >> nth=0'); log(tag, 'next chapter →', (await pg.textContent('#chapters [aria-selected="true"] span')).trim()); await pg.click('#chapters [role="tab"] >> nth=2'); await pg.click('[data-node="r9"]'); log(tag, 'flow detail:', (await pg.textContent('.flow-detail')).slice(0, 70)); await shot(pg, tag + '-case');
    await go(pg, 'studio.decision'); await pg.selectOption('select[data-k="c"]', 'Not eligible'); log(tag, 'decision:', (await pg.textContent('.outcome strong')));
    await go(pg, 'studio.kpi'); const before = await pg.textContent('.kpi-note'); await pg.check('.switch input >> nth=0'); log(tag, 'kpi toggle changes note:', before !== await pg.textContent('.kpi-note')); await shot(pg, tag + '-kpi');
    await go(pg, 'scenario.missing-info'); await pg.click('.opt >> nth=1'); await pg.click('#opt-out [role="tab"] >> nth=3'); log(tag, 'scenario tab:', (await pg.textContent('#opt-out [role="tabpanel"]:not([hidden])')).slice(0, 60)); await shot(pg, tag + '-scenario');
    await go(pg, 'evidence'); await pg.click('[data-f="evm"][data-v="source"]'); log(tag, 'evidence source:', await pg.textContent('#ev-count')); await pg.selectOption('#ev-area', 'G'); log(tag, 'evidence source+G:', await pg.textContent('#ev-count')); await overflow(pg, tag, 'evidence');
    await go(pg, 'home'); await pg.keyboard.press('/'); await pg.fill('#pal-q', 'bharatkosh'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(80); log(tag, 'palette → ', await pg.textContent('h1'));
    await go(pg, 'nope'); log(tag, '404:', await pg.textContent('h1'));
    await pg.click('[data-act="theme"]'); log(tag, 'theme:', await pg.evaluate(() => document.documentElement.getAttribute('data-theme')));
    await go(pg, 'home'); await shot(pg, tag + '-home-dark');
    await pg.context().close();
  }
  { const pg = await page(b, { reduced: true, tag: 'reduced' }); await pg.goto(URL + '#home'); await pg.waitForTimeout(500); await pg.evaluate(() => window.scrollTo(0, 99999)); await pg.waitForTimeout(400);
    log('reduced motion: scene', await pg.evaluate(() => document.documentElement.getAttribute('data-scene')), 'formation = target:', await pg.evaluate(() => window.__pfScene.formation === window.__pfScene.target)); log('reduced motion: static intro', await pg.$$eval('#intro.i-static', (e) => e.length), '| thread fully drawn', await pg.evaluate(() => [...document.querySelectorAll('#intro .i3-p')].every((p) => p.style.strokeDashoffset === '0.0000'))); await overflow(pg, 'reduced', 'home'); await pg.context().close(); }
  { const pg = await page(b, { blockThree: true, tag: 'no-cdn' }); await pg.goto(URL + '#home'); await pg.waitForTimeout(600);
    log('three.js blocked: scene attr', await pg.evaluate(() => document.documentElement.getAttribute('data-scene')), '| fallback visible:', await pg.isVisible('#scene-fallback svg')); await shot(pg, 'no-cdn-home'); await pg.context().close(); }
  { const b2 = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2'] }); const ctx = await b2.newContext(); await ctx.route(/fonts\./, (r) => r.abort());
    if (process.env.THREE_LOCAL) await ctx.route(/three\.module\.js/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(process.env.THREE_LOCAL) }));
    const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push('no-webgl pageerror: ' + e.message)); await pg.goto(URL + '#home'); await pg.waitForTimeout(600);
    log('WebGL disabled: scene attr', await pg.evaluate(() => document.documentElement.getAttribute('data-scene')), '| fallback visible:', await pg.isVisible('#scene-fallback svg')); await b2.close(); }
  log('ERRORS:', errs.length ? errs : 'none');
  await b.close();
  process.exit(errs.length ? 1 : 0);
})();
