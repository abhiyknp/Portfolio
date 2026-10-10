/* Scroll-linked Three.js scene: a requirements traceability graph.
   Five node layers (objectives → requirements → stories → tests → releases) move through four formations
   as the reader scrolls: Discover (scattered cloud) → Specify (clusters) → Trace (linked layers) → Release (a route).
   Progress comes from real document scroll. Reduced motion renders one static frame. If WebGL or the module
   fails to load, the static SVG fallback stays visible (html lacks data-scene="webgl"). */
import * as THREE from 'three';

const canvas = document.getElementById('scene-canvas');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (e) { return false; }
}

if (canvas && webglOK()) {
  try { start(); } catch (e) { console.warn('Scene disabled:', e.message); }
}

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 15);
  const group = new THREE.Group();
  scene.add(group);

  /* Seeded random for a stable layout across loads. */
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  const LAYERS = [5, 10, 16, 20, 7];
  const nodes = [];
  LAYERS.forEach((n, layer) => { for (let i = 0; i < n; i++) nodes.push({ layer, i, n }); });
  const N = nodes.length;
  const links = [];
  nodes.forEach((nd, k) => {
    if (nd.layer === 0) return;
    const parents = nodes.map((p, j) => [p, j]).filter(([p]) => p.layer === nd.layer - 1);
    const pick = parents[Math.min(parents.length - 1, Math.floor((nd.i / nd.n) * parents.length))];
    links.push([pick[1], k]);
    if (rnd() > 0.72) links.push([parents[Math.floor(rnd() * parents.length)][1], k]);
  });

  /* Formations: arrays of Vector3 per node. */
  const F = [[], [], [], []];
  nodes.forEach((nd) => {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, r = 3.5 + rnd() * 3.5, s = Math.sqrt(1 - u * u);
    F[0].push(new THREE.Vector3(r * s * Math.cos(th) * 1.3, r * u * 0.75, r * s * Math.sin(th)));
    const a = (nd.layer / LAYERS.length) * Math.PI * 2 + 0.6, cr = 4.2, jr = 0.4 + rnd() * 1.0, ja = rnd() * Math.PI * 2;
    F[1].push(new THREE.Vector3(Math.cos(a) * cr * 1.25 + Math.cos(ja) * jr, Math.sin(a) * cr * 0.8 + Math.sin(ja) * jr, (rnd() - 0.5) * 1.6));
    const y = nd.n === 1 ? 0 : (nd.i / (nd.n - 1) - 0.5) * Math.min(8.5, 1.4 + nd.n * 0.42);
    F[2].push(new THREE.Vector3(-7 + nd.layer * 3.5, y, Math.sin(nd.i * 1.7) * 0.5));
  });
  const order = nodes.map((_, k) => k).sort((a, b) => nodes[a].layer - nodes[b].layer || nodes[a].i - nodes[b].i);
  order.forEach((k, idx) => {
    const t = idx / (N - 1), x = -9 + t * 18;
    F[3][k] = new THREE.Vector3(x, -1.2 + Math.sin(t * Math.PI * 1.4) * 1.1, Math.cos(t * Math.PI) * 1.5 + (idx % 2 ? 0.35 : -0.35));
  });

  /* Nodes: one instanced mesh; release-route milestones are larger. */
  const geo = new THREE.IcosahedronGeometry(0.13, 1);
  const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.95 });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  group.add(mesh);
  const lineGeo = new THREE.BufferGeometry();
  const linePos = new Float32Array(links.length * 6);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lineMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.3 });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  function readColours() {
    const cs = getComputedStyle(document.documentElement);
    const col = (v) => new THREE.Color(cs.getPropertyValue(v).trim() || '#888888');
    const layerCols = [col('--viz-2'), col('--viz-1'), col('--viz-3'), col('--viz-4'), col('--viz-1')];
    nodes.forEach((nd, k) => mesh.setColorAt(k, layerCols[nd.layer]));
    mesh.instanceColor.needsUpdate = true;
    lineMat.color = col('--ink-3');
    needs = true;
  }

  const tmp = new THREE.Vector3(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  const smooth = (t) => t * t * (3 - 2 * t);
  let target = 0, cur = 0, needs = true, running = false, time = 0, last = performance.now();
  let pageMode = 'home';

  function progress() {
    /* On the overview, the pinned intro comes first; the graph's journey starts where the intro ends. */
    const base = pageMode === 'home' && window.PFIntroBase ? window.PFIntroBase() : 0;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight - base);
    return Math.min(1, Math.max(0, (scrollY - base) / max));
  }
  function updateTarget() {
    const p = progress();
    if (reduce.matches) { target = pageMode === 'home' ? Math.round(p * 3) : 2; }
    else target = pageMode === 'home' ? p * 3 : 2 + Math.sin(p * Math.PI) * 0.35;
    needs = true; kick();
  }

  function layout(f) {
    const i = Math.min(2, Math.floor(f)), t = smooth(Math.min(1, Math.max(0, f - i)));
    const linkOp = [0.1, 0.22, 0.55, 0.32];
    lineMat.opacity = linkOp[i] + (linkOp[i + 1] - linkOp[i]) * t;
    for (let k = 0; k < N; k++) {
      tmp.copy(F[i][k]).lerp(F[i + 1][k], t);
      const big = f > 2.5 && order.indexOf(k) % 8 === 0 ? 1 + (f - 2.5) * 1.2 : 1;
      sc.setScalar(big * (nodes[k].layer === 0 ? 1.35 : 1));
      m4.compose(tmp, q, sc); mesh.setMatrixAt(k, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
    const m = new THREE.Matrix4();
    links.forEach(([a, b], j) => {
      mesh.getMatrixAt(a, m); tmp.setFromMatrixPosition(m); linePos.set([tmp.x, tmp.y, tmp.z], j * 6);
      mesh.getMatrixAt(b, m); tmp.setFromMatrixPosition(m); linePos.set([tmp.x, tmp.y, tmp.z], j * 6 + 3);
    });
    lineGeo.attributes.position.needsUpdate = true;
  }

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    /* Keep the graph to the right of the hero text on wide screens; centre and pull back on narrow ones. */
    const wide = w / h > 1.2;
    camera.position.set(wide ? -6 : 0, wide ? 0 : -1, wide ? 16 : 22);
    camera.lookAt(wide ? -6 : 0, wide ? 0 : -1, 0);
    camera.updateProjectionMatrix();
    needs = true; kick();
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (document.hidden) { running = false; return; }
    const diff = target - cur;
    cur = reduce.matches ? target : cur + diff * Math.min(1, dt * 4);
    if (!reduce.matches) time += dt;
    group.rotation.y = reduce.matches ? -0.25 : -0.25 + Math.sin(time * 0.12) * 0.12 + (cur - 1.5) * 0.08;
    group.rotation.x = reduce.matches ? 0.05 : Math.sin(time * 0.09) * 0.05;
    layout(cur);
    renderer.render(scene, camera);
    needs = false;
    if (reduce.matches && Math.abs(target - cur) < 1e-3) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function kick() { if (!running && !document.hidden) { running = true; last = performance.now(); requestAnimationFrame(frame); } }

  readColours();
  resize();
  updateTarget();
  document.documentElement.setAttribute('data-scene', 'webgl');

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', updateTarget, { passive: true });
  document.addEventListener('visibilitychange', kick);
  document.addEventListener('pf:route', (e) => { pageMode = e.detail.view === 'home' ? 'home' : 'page'; updateTarget(); });
  pageMode = document.body.getAttribute('data-route') === 'home' ? 'home' : 'page';
  updateTarget();
  new MutationObserver(() => { readColours(); kick(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColours(); kick(); });
  reduce.addEventListener('change', () => { updateTarget(); kick(); });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); document.documentElement.removeAttribute('data-scene'); });

  /* Exposed for automated checks only. */
  window.__pfScene = { get formation() { return cur; }, get target() { return target; } };
}
