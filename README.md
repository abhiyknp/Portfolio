# Abhishek Yadav, Business Analyst portfolio

An interactive portfolio and Business Analysis knowledge base. It is a static site with no build step: plain HTML, CSS and JavaScript, with Three.js loaded from a CDN.

## What is in it

| Area | What it contains |
|---|---|
| Scroll intro (top of `#home`) | "Chaos to clarity": stakeholder phrases fade as four words form "Turning complexity into clarity.", then the overview begins. It has a Skip intro button; with reduced motion, the final frame shows without pinning |
| Overview (`#home`) | Direction A narrative, readable in 60 to 90 seconds: hero, résumé-based summary, how I work with a traceability chain, an acceptance-criteria example, a before/after slider (four examples: request to user story, meeting notes to decision log, complaint to defect report, wish to testable requirement), case-study cards, skills with evidence, experience, evidence legend and contact. A scroll-drawn gold thread links the sections |
| Skills Library (`#skills`) | 42 skills in 9 areas (A to I). Search and filter by area and evidence status. Each skill has 15 parts in 4 tabs: Understand, How I do it, Proof and practice, Interview |
| Case studies (`#cases`) | Rajmarg Pravesh, NHAI DataLake 3.0, Healthcare Management System, ATS and VMS. Each has 20 sections told in 5 chapters (the problem, discovery, the solution, quality and delivery, results and lessons), with interactive swimlane workflows for three of them |
| Artifact Studio (`#studio`) | 17 sample deliverables arranged by project stage (discover and align, specify, plan and build, test and trace, release and measure), each with a plain-language explanation, who uses it and when, plus (BRD, FRD, SRS, RTM, story and acceptance criteria, BPMN, decision table, JIRA, Confluence, API contract, SQL and ERD, KPI dashboard, UAT, defect, minutes, release checklist, change impact), with tabbed views |
| Decision scenarios (`#scenarios`) | 7 interactive situations. Choose an option to see the reasoning, rule, UX, workflow and TAT effect, acceptance criteria, tests and JIRA story |
| Process puzzle (`#puzzle`) | Optional two-minute challenge: put seven shuffled steps of the permission lifecycle back in order. Correct steps lock on each check and a hint explains the first wrong one. Linked from the overview and the Scenarios page |
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
assets/js/extras.js        before/after slider and process puzzle
assets/js/stats.js         GoatCounter visit counts
assets/js/owner.js         private owner view of the stats (#stats)
assets/js/loader.js        "chaos to clarity" loader shared by the first-visit screen and #stats
assets/js/intros.js        scroll intros (the home page uses chaos-to-clarity; the thread and blueprint intros are kept for reference)
assets/js/intro.js         earlier "request's journey" intro, kept for the concepts page
concepts/                  design study: direction A with four intro prototypes
assets/js/words-bg.js      background words: questions to answers to constellation
assets/js/data/*.js        all content: skills-a/b/c, cases, flows, artifacts, scenarios, extras (slider pairs and puzzle steps), legal (privacy, terms, accessibility)
tools/serve.sh             local server
tools/test.js              end-to-end Playwright check
```

To edit content, change the files in `assets/js/data/`. The views pick up new entries automatically.

## Run locally

```sh
./tools/serve.sh            # http://localhost:8780/
PF_URL=http://localhost:8780/ node tools/test.js
```

`tools/test.js` checks every route and interaction at desktop and phone width, checks for horizontal overflow, and runs the reduced-motion case. Set `SHOTS=dir` to save screenshots.

## Background words

`assets/js/words-bg.js` draws the background on one canvas behind the page. On the overview, faint stakeholder questions roam slowly at different depths; as the reader scrolls, each turns into its gold answer ("is this in scope?" → "scope agreed"), and at the contact section the answers glide one by one into a slowly turning constellation with a gold spark hopping between them. Other pages show a faint constellation of Business Analyst terms. Every change eases over time, so fast scrolling never makes anything snap. With reduced motion the words stay still. Reading progress also appears as highway chainage in the corner chip.

## Publishing

`.github/workflows/pages.yml` deploys on every push to `main`. One-time setup: Settings → Pages → Source: "GitHub Actions".

## Visitor stats

`assets/js/stats.js` counts visits with [GoatCounter](https://www.goatcounter.com): no cookies, no personal data, no consent banner. It is off until you set `GOATCOUNTER_CODE` at the top of the file to your GoatCounter site code. Each view is counted as its own page (`/case/rajmarg`, `/puzzle`, ...), and these events are recorded: `resume-download`, `email-click`, `email-copy`, `linkedin-click`, `compare-used` and `puzzle-solved`. A footer line tells visitors that visits are counted.

### Private owner view

`#stats` (the "Owner's desk" link in the footer) shows the numbers in the site's own design: visitors, page visits, résumé downloads, contact clicks, puzzle and slider use, visitors per day, most-read pages, actions, sources, countries, screen sizes, browsers and operating systems, for today, 7, 30 or 90 days. It stays locked until you enter a GoatCounter API key with only "Read statistics" permission (GoatCounter → Settings → API). The key is kept in that browser only and sent only to GoatCounter; "Lock" removes it. Visits from a browser where the page is unlocked are not counted.

### Loader

`assets/js/loader.js` draws the "chaos to clarity" loader: small words spin around a gold line, gather behind its tip and merge into it one at a time while it fills smoothly. The first-visit screen (top of `index.html`) uses it only when the site is not ready within half a second, ending on "Ready."; fast visits never see it. The stats page uses it while GoatCounter answers, ending on "Clarity."

Visitors who open the owner's desk see an "Access request denied" page instead: a role and permission matrix (rule RBAC-07) with a DENIED stamp on the visitor's row, and the acceptance criteria behind it. "I'm the owner" opens the key box. On a device where the page is unlocked, the footer link reads "Visitor stats" and a Stats item appears in the main menu. Each denied visit is counted as the anonymous event `owner-desk-denied`.

## Site pages and footer

The footer on every page links to the main sections, contact details, the résumé, and three site pages: `#privacy` (privacy notice), `#terms` (terms of use, with credits and licences) and `#accessibility` (accessibility statement). Their text lives in `assets/js/data/legal.js`; change `updated` there whenever the wording changes. If the site starts storing anything new in the browser or loading a new outside service, add it to the privacy notice.

## Handover: common updates

| To change | Do this |
|---|---|
| Résumé | Replace `assets/Abhishek_Yadav_Business_Analyst_Resume.pdf`, keeping the same file name. Both download buttons pick it up. |
| Profile photo | Replace `assets/img/abhishek-yadav.webp` and `.jpg` (560 × 700, portrait). Rebuild `assets/img/og-card.jpg` (1200 × 630) so link previews match. |
| Any text | Edit the files in `assets/js/data/`, or the overview in `home()` in `assets/js/app.js`. |
| Visitor stats | GoatCounter site `abhiyknp` (`assets/js/stats.js`). The private view is the footer's "Owner's desk". |
| After any change | Bump the `?v=` tag on the asset links in `index.html` so browsers fetch the new files, then push to `main`. GitHub Pages republishes in a minute or two. |
