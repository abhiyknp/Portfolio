// End-to-end check of every route and interaction at desktop and phone width, plus a reduced-motion run.
// Needs a running server (tools/serve.sh) and Playwright. Usage:
//   PF_URL=http://localhost:8780/ SHOTS=/tmp/shots node tools/test.js
// SHOTS saves screenshots.
const fs = require('fs');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const URL = process.env.PF_URL || 'http://localhost:8780/';
const errs = [], log = (...a) => console.log(...a);
const shot = async (pg, name) => { if (process.env.SHOTS) await pg.screenshot({ path: `${process.env.SHOTS}/${name}.png`, fullPage: false }); };

async function page(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', colorScheme: opts.dark ? 'dark' : 'light' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
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
    log(tag, 'background words layer:', await pg.evaluate(() => !!document.querySelector('canvas.words-bg') && window.__pfWords.shown));
    await shot(pg, tag + '-home');
    const ib = await pg.evaluate(() => { const el = document.querySelector('#intro .i-chaos'); return { top: el.getBoundingClientRect().top + scrollY, h: el.offsetHeight, ih: innerHeight, threads: document.querySelectorAll('#intro .i-thread').length, chaos: el.querySelectorAll('.i1-w').length }; });
    await pg.evaluate(([y]) => window.scrollTo(0, y), [ib.top + 0.6 * (ib.h - ib.ih)]); await pg.waitForTimeout(900);
    const faded = await pg.evaluate(() => [...document.querySelectorAll('#intro .i1-w:not(.h)')].filter((w) => +w.style.opacity < 0.05).length);
    log(tag, 'chaos intro words:', ib.chaos, '| thread intro removed:', ib.threads === 0, '|', faded, 'of 32 noise phrases faded at 60% scroll | chip hidden:', await pg.evaluate(() => document.getElementById('chainage').classList.contains('is-hidden')));
    if (ib.chaos !== 36 || ib.threads !== 0 || faded < 20) errs.push(`${tag} intro did not follow scroll`);
    await shot(pg, tag + '-intro-trace');
    await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(100); await pg.click('[data-act="skip-intro"]'); await pg.waitForTimeout(300);
    log(tag, 'skip intro → hero top', await pg.evaluate(() => Math.round(document.getElementById('hero').getBoundingClientRect().top)));
    await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(300);
    await pg.evaluate(() => window.scrollTo(0, window.PFIntroBase() + 10)); await pg.waitForTimeout(1500);
    const w0 = await pg.evaluate(() => [window.__pfWords.answered, window.__pfWords.total, window.__pfWords.blend]);
    const km0 = await pg.textContent('#ch-km');
    await pg.evaluate(() => { const c = document.getElementById('contact'); window.scrollTo(0, c.getBoundingClientRect().top + scrollY - innerHeight * 0.3); }); await pg.waitForTimeout(3000);
    const w1 = await pg.evaluate(() => [window.__pfWords.answered, window.__pfWords.total, window.__pfWords.blend]);
    log(tag, 'background words: answered', w0[0] + '/' + w0[1], '→', w1[0] + '/' + w1[1], '| constellation blend', w0[2].toFixed(2), '→', w1[2].toFixed(2), '| chainage', km0, '→', await pg.textContent('#ch-km'));
    if (!(w1[0] === w1[1] && w1[2] > 0.9 && w0[2] < 0.1 && w0[0] < w1[0])) errs.push(`${tag} background words did not follow the page`);
    await overflow(pg, tag, 'home');
    await pg.evaluate(() => window.scrollTo(0, 0));
    log(tag, 'overview blocks:', await pg.$$eval('#home-main section', (e) => e.length), '| in-short points:', await pg.$$eval('.h-short li', (e) => e.length), '| go-deeper links:', await pg.$$eval('.h-deeper-links a', (e) => e.length));
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

    await go(pg, 'skills'); await pg.evaluate(() => scrollTo(0, 900)); await pg.waitForTimeout(100); await go(pg, 'skill.ac'); await pg.click('.back-btn'); await pg.waitForTimeout(250);
    const back = await pg.evaluate(() => [document.querySelector('h1').textContent, Math.round(scrollY)]); log(tag, 'back →', back[0], '| scroll restored to', back[1]); if (back[0] !== 'Skills Library' || Math.abs(back[1] - 900) > 5) errs.push(`${tag} back button did not restore page`);
    await go(pg, 'studio'); log(tag, 'studio stages:', await pg.$$eval('.stage-block', (e) => e.length), '| cards:', await pg.$$eval('.stage-block .card', (e) => e.length));
    await go(pg, 'skill.brd'); await pg.click('.skill-tabs [role="tab"] >> nth=3'); log(tag, 'skill interview tab:', (await pg.textContent('.skill-tabs [role="tabpanel"]:not([hidden]) h3')).trim());
    await pg.click('.skill-tabs [role="tab"] >> nth=2'); await pg.click('[data-act="artifact-preview"]'); log(tag, 'modal visible:', await pg.isVisible('#modal')); await shot(pg, tag + '-modal');
    await pg.keyboard.press('Escape'); log(tag, 'modal closed:', await pg.isHidden('#modal'));

    await go(pg, 'case.rajmarg'); await pg.click('[data-act="next-chapter"] >> nth=0'); log(tag, 'next chapter →', (await pg.textContent('#chapters [aria-selected="true"] span')).trim()); await pg.click('#chapters [role="tab"] >> nth=2'); await pg.click('[data-node="r9"]'); log(tag, 'flow detail:', (await pg.textContent('.flow-detail')).slice(0, 70)); await shot(pg, tag + '-case');
    await go(pg, 'studio.decision'); await pg.selectOption('select[data-k="c"]', 'Not eligible'); log(tag, 'decision:', (await pg.textContent('.outcome strong')));
    await go(pg, 'studio.kpi'); const before = await pg.textContent('.kpi-note'); await pg.check('.switch input >> nth=0'); log(tag, 'kpi toggle changes note:', before !== await pg.textContent('.kpi-note')); await shot(pg, tag + '-kpi');
    await go(pg, 'scenario.missing-info'); await pg.click('.opt >> nth=1'); await pg.click('#opt-out [role="tab"] >> nth=3'); log(tag, 'scenario tab:', (await pg.textContent('#opt-out [role="tabpanel"]:not([hidden])')).slice(0, 60)); await shot(pg, tag + '-scenario');
    await go(pg, 'evidence'); await pg.click('[data-f="evm"][data-v="source"]'); log(tag, 'evidence source:', await pg.textContent('#ev-count')); await pg.selectOption('#ev-area', 'G'); log(tag, 'evidence source+G:', await pg.textContent('#ev-count')); await overflow(pg, tag, 'evidence');
    await go(pg, 'home'); await pg.keyboard.press('/'); await pg.fill('#pal-q', 'bharatkosh'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(80); log(tag, 'palette → ', await pg.textContent('h1'));
    await go(pg, 'home'); await pg.click('[data-act="cmp-pick"][data-i="3"]'); await pg.click('[data-act="cmp-set"][data-v="0"]');
    const pos = await pg.$eval('.cmp', (e) => e.style.getPropertyValue('--pos')); log(tag, 'before/after: 4 examples', (await pg.$$('[data-act="cmp-pick"]')).length === 4, '| show after →', pos); if (pos !== '0%') errs.push(`${tag} slider did not move`);
    await pg.focus('.cmp-range'); await pg.keyboard.press('ArrowRight'); log(tag, 'slider keyboard →', await pg.$eval('.cmp-range', (e) => e.value)); await overflow(pg, tag, 'home slider');
    await go(pg, 'puzzle'); for (let r = 0; r < 8 && !(await pg.$('.pz-done')); r++) { while (await pg.$('.pz-tray .pz-card')) { const k = (await pg.$$eval('.pz-slot', (e) => e.map((x) => x.classList.contains('empty')))).indexOf(true); await pg.click(`[data-act="pz-place"][data-i="${k}"]`); } await pg.click('[data-act="pz-check"]'); }
    const solved = await pg.$('.pz-done'); log(tag, 'puzzle:', solved ? (await pg.textContent('.pz-done h2')) : 'not solved', '| flow steps', await pg.$$eval('.pz-flow li', (e) => e.length)); if (!solved) errs.push(`${tag} puzzle not solvable`); await overflow(pg, tag, 'puzzle');
    await pg.click('[data-act="pz-again"]'); await pg.click('.pz-tray .pz-card'); log(tag, 'puzzle restart, one placed:', await pg.$$eval('.pz-slot:not(.empty)', (e) => e.length));
    await go(pg, 'stats'); log(tag, 'owner desk denied:', await pg.isVisible('.dm-stamp'), '| footer link:', (await pg.textContent('#owner-link')).trim(), '| not in nav:', !(await pg.$('#site-nav a[href="#stats"]'))); await pg.click('[data-act="own-iam"]'); log(tag, 'owner key box opens:', await pg.isVisible('#owner-key')); await overflow(pg, tag, 'stats');
    for (const k of ['privacy', 'terms', 'accessibility']) { await go(pg, k); const n = await pg.$$eval('.legal-sec', (e) => e.length); if (!n) errs.push(`${tag} ${k} page empty`); await overflow(pg, tag, k); }
    log(tag, 'site pages: privacy, terms, accessibility | footer links:', await pg.$$eval('.site-footer a', (e) => e.length));
    await go(pg, 'nope'); log(tag, '404:', await pg.textContent('h1'));
    await pg.click('[data-act="theme"]'); log(tag, 'theme:', await pg.evaluate(() => document.documentElement.getAttribute('data-theme')));
    await go(pg, 'home'); await shot(pg, tag + '-home-dark');
    await pg.context().close();
  }
  { const pg = await page(b, { reduced: true, tag: 'reduced' }); await pg.goto(URL + '#home'); await pg.waitForTimeout(500); await pg.evaluate(() => window.scrollTo(0, 99999)); await pg.waitForTimeout(400);
    log('reduced motion: background words settle at once:', await pg.evaluate(() => window.__pfWords.vis === 1 || window.__pfWords.vis === 0)); log('reduced motion: static intro', await pg.$$eval('#intro.i-static', (e) => e.length), '| headline visible', await pg.evaluate(() => [...document.querySelectorAll('#intro .i1-w.h')].every((w) => +w.style.opacity > 0.9))); await overflow(pg, 'reduced', 'home'); await pg.context().close(); }
  { const pg = await page(b, { tag: 'inner' }); await pg.goto(URL + '#skills'); await pg.waitForTimeout(1500);
    log('inner page background:', await pg.evaluate(() => window.__pfWords.shown), '| visible', (await pg.evaluate(() => window.__pfWords.vis)).toFixed(2)); await pg.context().close(); }
  log('ERRORS:', errs.length ? errs : 'none');
  await b.close();
  process.exit(errs.length ? 1 : 0);
})();
