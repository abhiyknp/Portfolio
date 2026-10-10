# Abhishek Yadav, Business Analyst portfolio

An interactive portfolio and BA knowledge base. It is a static site with no build step: plain HTML, CSS and JavaScript, with Three.js loaded from a CDN.

## What is in it

| Area | What it contains |
|---|---|
| Overview (`#home`) | Executive view, readable in 60 to 90 seconds: positioning, a résumé-based summary, strongest capabilities, a traceability chain, case-study cards, career timeline, evidence legend and contact |
| Skills Library (`#skills`) | 42 skills in 9 areas (A to I). Search and filter by area and evidence status. Each skill has a 15-part view, from definition and method through to an interview question, a model answer and how to explain it without overstating |
| Case studies (`#cases`) | Rajmarg Pravesh, NHAI DataLake 3.0, Healthcare Management System, ATS and VMS. Each has 20 sections, with interactive swimlane workflows for three of them |
| Artifact Studio (`#studio`) | 17 sample deliverables (BRD, FRD, SRS, RTM, story and acceptance criteria, BPMN, decision table, JIRA, Confluence, API contract, SQL and ERD, KPI dashboard, UAT, defect, minutes, release checklist, change impact), with tabbed views |
| Decision scenarios (`#scenarios`) | 7 interactive situations. Choose an option to see the reasoning, rule, UX, workflow and TAT effect, acceptance criteria, tests and JIRA story |
| Evidence map (`#evidence`) | Skill-to-project, skill-to-artifact and skill-to-case mapping, with an interview question and evidence status for each skill |

Press `/` (or Ctrl/Cmd+K) anywhere to search everything.

## Evidence labels

Every claim carries one of these labels:

- **Source-supported experience**: stated in the résumé.
- **Source-supported (owner brief)**: from the owner's own project description, beyond what the résumé lists.
- **Illustrative example**: written for this portfolio. Not a project document, incident or result.
- **Recommended approach**: practice capability, not a documented project claim.

No confidential client material is reproduced. IDs, ticket keys, endpoints, schemas and numbers are invented sample data.

## Files

```
index.html                 page shell
assets/css/main.css        design tokens (light and dark) and all styles
assets/js/app.js           router, views, search, filters, tabs, modal, palette, progress
assets/js/widgets.js       swimlane flows, decision table, KPI dashboard, ERD
assets/js/scene.js         scroll-linked Three.js traceability graph (ES module)
assets/js/data/*.js        all content: skills-a/b/c, cases, flows, artifacts, scenarios
tools/serve.sh             local server
tools/test.js              end-to-end Playwright check
```

To edit content, change the files in `assets/js/data/`. The views pick up new entries automatically.

## Run locally

```sh
./tools/serve.sh            # http://localhost:8780/
PF_URL=http://localhost:8780/ node tools/test.js
```

`tools/test.js` checks every route and interaction at desktop and phone width, checks for horizontal overflow, and runs the reduced-motion, CDN-blocked and WebGL-disabled cases. Set `THREE_LOCAL=/path/to/three.module.js` if the machine cannot reach the CDN, and `SHOTS=dir` to save screenshots.

## 3D scene and fallbacks

The background graph shows traceability layers (objectives, requirements, stories, tests, releases). It moves from a scattered cloud to clusters, then to linked layers, then to a release route, as the reader scrolls the overview. Reading progress also appears as highway chainage in the corner chip.

- **Reduced motion**: the scene renders a single static frame for each formation.
- **No WebGL, or a blocked CDN**: a static SVG version is shown instead.

## Publishing

`.github/workflows/pages.yml` deploys on every push to `main`. One-time setup: Settings → Pages → Source: "GitHub Actions".
