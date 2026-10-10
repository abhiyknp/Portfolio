# Abhishek Yadav, Business Analyst portfolio

An interactive portfolio and BA knowledge base. It is a static site with no build step: plain HTML, CSS and JavaScript, with Three.js loaded from a CDN.

## What is in it

| Area | What it contains |
|---|---|
| Scroll intro (top of `#home`) | "Chaos to clarity": stakeholder phrases fade as four words form "Turning complexity into clarity.", then the overview begins. It has a Skip intro button; with reduced motion, the final frame shows without pinning |
| Overview (`#home`) | Direction A narrative, readable in 60 to 90 seconds: hero, résumé-based summary, how I work with a traceability chain, an acceptance-criteria example, case-study cards, skills with evidence, experience, evidence legend and contact. A scroll-drawn gold thread links the sections |
| Skills Library (`#skills`) | 42 skills in 9 areas (A to I). Search and filter by area and evidence status. Each skill has 15 parts in 4 tabs: Understand, How I do it, Proof and practice, Interview |
| Case studies (`#cases`) | Rajmarg Pravesh, NHAI DataLake 3.0, Healthcare Management System, ATS and VMS. Each has 20 sections told in 5 chapters (the problem, discovery, the solution, quality and delivery, results and lessons), with interactive swimlane workflows for three of them |
| Artifact Studio (`#studio`) | 17 sample deliverables arranged by project stage (discover and align, specify, plan and build, test and trace, release and measure), each with a plain-language explanation, who uses it and when, plus (BRD, FRD, SRS, RTM, story and acceptance criteria, BPMN, decision table, JIRA, Confluence, API contract, SQL and ERD, KPI dashboard, UAT, defect, minutes, release checklist, change impact), with tabbed views |
| Decision scenarios (`#scenarios`) | 7 interactive situations. Choose an option to see the reasoning, rule, UX, workflow and TAT effect, acceptance criteria, tests and JIRA story |
| Evidence map (`#evidence`) | Skill-to-project, skill-to-artifact and skill-to-case mapping, with an interview question and evidence status for each skill |

Press `/` (or Ctrl/Cmd+K) anywhere to search everything. Every page except the overview has a Back button that returns to the previous page and its scroll position.

## Evidence labels

Every claim carries one of these labels:

- **Source-supported experience**: stated in the résumé.
- **Source-supported (owner brief)**: from the owner's own project description, beyond what the résumé lists.
- **Illustrative example**: written for this portfolio. Not a project document, incident or result.
- **Recommended approach**: practice capability, not a documented project claim.

No confidential client material is reproduced. IDs, ticket keys, endpoints, schemas and numbers are invented sample data.

## Files

```
index.html                 page shell (with social-preview tags)
assets/img/                portrait (abhishek-yadav.webp/.jpg) and social card (og-card.jpg)
assets/Abhishek_Yadav_Business_Analyst_Resume.pdf   résumé for the download buttons
assets/css/main.css        design tokens (light and dark) and all styles
assets/js/app.js           router, views, search, filters, tabs, modal, palette, progress
assets/js/widgets.js       swimlane flows, decision table, KPI dashboard, ERD
assets/js/intros.js        scroll intros (the home page uses chaos-to-clarity; the thread and blueprint intros are kept for reference)
assets/js/intro.js         earlier "request's journey" intro, kept for the concepts page
concepts/                  design study: direction A with four intro prototypes
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

The background graph shows traceability layers (objectives, requirements, stories, tests, releases). It moves from a scattered cloud to clusters, then to linked layers, then to a release route, as the reader scrolls the overview after the intro. Reading progress also appears as highway chainage in the corner chip.

- **Reduced motion**: the scene renders a single static frame for each formation.
- **No WebGL, or a blocked CDN**: a static SVG version is shown instead.

## Publishing

`.github/workflows/pages.yml` deploys on every push to `main`. One-time setup: Settings → Pages → Source: "GitHub Actions".
