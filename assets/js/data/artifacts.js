/* Artifact Studio. Every artifact is an educational reconstruction. None is a client document.
   tabs: [label, html]. Special placeholders: <div data-flow="id">, <div data-widget="decision|kpi|erd">. */
window.PF = window.PF || { skills: [], cases: [], artifacts: [], scenarios: [] };

PF.artifacts.push(
{
  id: 'brd', name: 'BRD excerpt', kind: 'Requirements',
  purpose: 'Records what the business needs and why, for sponsor approval.',
  problem: 'Scope disputes, unclear objectives and requirements with no business reason.',
  howto: 'Use as the baseline for the FRD, the RTM and change control. Every later requirement should trace to a BR here.',
  good: ['Objectives are measurable or have a named measure', 'Explicit exclusions', 'Rules separated from requirements, with IDs', 'Assumptions have owners', 'Version and approval recorded'],
  skills: ['brd', 'rules', 'rtm'], cases: ['rajmarg'],
  tabs: [
    ['Document', '<div class="doc"><p class="doc-meta">BRD · Clarification Management Enhancement · v1.2 (illustrative) · Status: Approved for build</p><h4>1. Business objective</h4><p>OBJ-1: Reduce avoidable clarification cycles between reviewing officers and applicants. OBJ-2: Make clarification time visible and correctly excluded from authority turnaround where policy requires.</p><h4>2. Scope</h4><p><strong>In:</strong> reason codes for clarifications; applicant response with documents; reminders; status and clock behaviour; reporting fields. <strong>Out:</strong> changes to fee schedules; eligibility rules; offline submissions.</p><h4>3. Stakeholders</h4><table><tr><th>Role</th><th>Responsibility</th></tr><tr><td>Approving authority representative</td><td>Approves BRD; owns policy interpretation</td></tr><tr><td>Reviewing officers (2 regions)</td><td>Process input; UAT</td></tr><tr><td>Programme team</td><td>Product governance</td></tr><tr><td>Delivery team</td><td>Feasibility; build; test</td></tr></table><h4>4. Business requirements</h4><table><tr><th>ID</th><th>Requirement</th><th>Objective</th></tr><tr><td>BR-01</td><td>Reviewers must record at least one standard reason for each clarification.</td><td>OBJ-1</td></tr><tr><td>BR-02</td><td>Applicants must be able to respond, including documents, within the same application.</td><td>OBJ-1</td></tr><tr><td>BR-03</td><td>Waiting time on the applicant must be identifiable separately from authority time.</td><td>OBJ-2</td></tr><tr><td>BR-04</td><td>Applicants must be reminded before the response window ends.</td><td>OBJ-1</td></tr><tr><td>BR-05</td><td>Every clarification event must be recorded in the application history.</td><td>OBJ-2</td></tr><tr><td>BR-06</td><td>Administrators must be able to maintain the reason list without a release.</td><td>OBJ-1</td></tr></table><h4>5. Business rules</h4><p>RULE-04: Authority clock pauses from "Clarification Raised" until the applicant responds (as defined in the applicable SOP; parameters to be confirmed). RULE-06: Only the assigned reviewer may raise a clarification.</p><h4>6. Assumptions and constraints</h4><p>A-1: Applicants have verified contact details (owner: onboarding). C-1: Notification channels are SMS and email only.</p><h4>7. Success criteria</h4><p>Share of first-review clarifications citing a missing or invalid document, compared with a baseline period. Target to be agreed after baseline is measured.</p></div>'],
    ['Business view', '<p>The sponsor reads sections 1, 2 and 7. If the objective and exclusions are right, most downstream disagreements disappear.</p>'],
    ['Testing', '<p>QA reads the rules (section 5) and success criteria to plan test strategy and reporting checks.</p>']
  ]
},
{
  id: 'frd', name: 'FRD requirements table', kind: 'Requirements',
  purpose: 'Specifies system behaviour for each function, including alternate and exception flows.',
  problem: 'Ambiguity between business intent and what developers build.',
  howto: 'Each row traces to a BR. Use it in refinement to create stories, and in test design.',
  good: ['Actor, trigger, behaviour, validation and exception per row', 'Rules referenced by ID', 'No vague verbs'],
  skills: ['frd', 'rules', 'stories'], cases: ['rajmarg'],
  tabs: [
    ['Document', '<div class="tw"><table><tr><th>ID</th><th>Area</th><th>Actor</th><th>Behaviour</th><th>Validation</th><th>Exception</th><th>Parent</th></tr><tr><td>FR-03</td><td>Submission</td><td>Applicant</td><td>Submit application when all mandatory documents for the type are attached</td><td>RULE-01 matrix by type</td><td>Missing items listed; submit disabled with reason</td><td>BR-01</td></tr><tr><td>FR-05</td><td>Submission</td><td>Applicant</td><td>Capture location and chainage from/to (km, 3 decimals)</td><td>from &lt; to; within highway extent</td><td>Map unavailable: typed entry flagged for verification</td><td>BR-01</td></tr><tr><td>FR-09</td><td>Clarification</td><td>Reviewer</td><td>Raise clarification with reason codes and remarks</td><td>≥1 reason; remarks ≤1,000 chars; RULE-06</td><td>Notification failure queued; status still changes</td><td>BR-02</td></tr><tr><td>FR-10</td><td>Clarification</td><td>Applicant</td><td>Respond with note and documents</td><td>Each requested document has a file</td><td>Window lapsed: per RULE-04 escalation</td><td>BR-02</td></tr><tr><td>FR-13</td><td>Approval</td><td>Approver</td><td>Provisionally approve, return or reject</td><td>Reason mandatory for return or reject</td><td>–</td><td>BR-03</td></tr><tr><td>FR-14</td><td>Payment</td><td>Finance</td><td>Verify payment and guarantee</td><td>RULE-03 validity</td><td>Invalid: return for re-upload with reason</td><td>BR-04</td></tr><tr><td>FR-16</td><td>Notifications</td><td>System</td><td>Send event notifications by template</td><td>Template per event</td><td>Retry; log failure</td><td>BR-05</td></tr></table></div><p class="note">Values such as 1,000 characters are illustrative.</p>'],
    ['Functional detail', '<p><strong>Business vs functional</strong>: BR-02 says applicants can respond. FR-10 says how: what they upload, what is validated, what status results, and what happens if the window lapses.</p>'],
    ['Testing', '<p>Each row yields at least one positive, one negative and one exception test.</p>']
  ]
},
{
  id: 'srs', name: 'SRS functional requirement', kind: 'Requirements',
  purpose: 'A complete, versioned system specification for design, build, integration and test.',
  problem: 'Multi-team builds without one reference; changes that silently break traceability.',
  howto: 'Use stable IDs, a permission matrix, interface sections and a change history.',
  good: ['Stable IDs', 'Change history', 'NFRs measurable or labelled as assumptions', 'Error handling defined'],
  skills: ['srs', 'nfr', 'rbac'], cases: ['rajmarg', 'datalake'],
  tabs: [
    ['Document', '<div class="doc"><p class="doc-meta">SRS §4.6 Bank Guarantee Management · v2.1 (illustrative)</p><h4>SRS-BG-004 Re-upload bank guarantee</h4><p><strong>Description:</strong> The system shall allow the applicant to upload a replacement bank guarantee when finance has marked the current one invalid.</p><p><strong>Actors:</strong> Applicant (upload); Finance user (verify).</p><p><strong>Preconditions:</strong> Application status = Provisionally Approved; guarantee verification status = Invalid.</p><p><strong>Inputs:</strong> guarantee document (PDF); guarantee number; issuing bank; amount; valid-from; valid-to.</p><p><strong>Processing:</strong> validate valid-to ≥ required date (RULE-03); validate amount ≥ required amount; store as new version; set verification status = Pending; notify finance.</p><p><strong>Outputs:</strong> new version in history; confirmation to applicant.</p><p><strong>Errors:</strong> E-BG-01 validity before required date (message names the date); E-BG-02 amount below required; E-DOC-03 document service unavailable ("Upload could not be completed. Try again.").</p><p><strong>Permissions:</strong> only the applicant who owns the application may upload; only finance may verify.</p><p><strong>Audit:</strong> user, time, version, previous status, new status.</p><p><strong>Trace:</strong> BR-04 → FR-14 → US PERMIT-122 → TC-41..TC-46.</p><h4>Change history</h4><table><tr><th>Version</th><th>Change</th><th>Reason</th></tr><tr><td>2.1</td><td>Added SRS-BG-004</td><td>CR-07 re-upload after validity issue</td></tr><tr><td>2.0</td><td>Clarified RULE-03 boundary ("on or after")</td><td>UAT finding</td></tr></table></div>'],
    ['Technical', '<p>Interface note: document service returns a document ID; the portal stores metadata only. Timeouts follow the platform standard (to be confirmed by architecture).</p><p><strong>NFR examples (assumptions to validate):</strong> NFR-AUD-01 immutable history; NFR-PERF-01 upload confirmation within a target set by architecture.</p>'],
    ['Testing', '<p>Boundary: valid-to = required date (accept), one day before (reject). Role: finance cannot upload; applicant cannot verify.</p>']
  ]
},
{
  id: 'rtm', name: 'Requirements Traceability Matrix', kind: 'Traceability',
  purpose: 'Connects objectives to requirements, stories, tests and releases.',
  problem: 'Coverage gaps and unknown change impact.',
  howto: 'Filter by an ID to see everything downstream; check coverage before UAT.',
  good: ['Maintained continuously', 'Includes tests and results', 'Both forward and backward checks'],
  skills: ['rtm', 'gap'], cases: ['rajmarg', 'healthcare', 'ats-vms'],
  tabs: [
    ['Document', '<div class="tw"><table><tr><th>Objective</th><th>BR</th><th>FR</th><th>Story</th><th>Design</th><th>Test cases</th><th>Release</th><th>Status</th></tr><tr><td>OBJ-1</td><td>BR-01</td><td>FR-09</td><td>PERMIT-101</td><td>Clarify dialog v3</td><td>TC-01..05</td><td>R5</td><td>Passed</td></tr><tr><td>OBJ-1</td><td>BR-02</td><td>FR-10</td><td>PERMIT-102</td><td>Respond screen v2</td><td>TC-06..10</td><td>R5</td><td>Passed</td></tr><tr><td>OBJ-2</td><td>BR-03</td><td>FR-11</td><td>PERMIT-103</td><td>–</td><td>TC-11..14</td><td>R5</td><td>1 failed (retest)</td></tr><tr><td>OBJ-1</td><td>BR-04</td><td>FR-12</td><td>PERMIT-105</td><td>Templates</td><td>–</td><td>R6</td><td class="warn">No tests yet</td></tr><tr><td>–</td><td>–</td><td>–</td><td>PERMIT-109</td><td>–</td><td>TC-30</td><td>R5</td><td class="warn">No parent requirement</td></tr></table></div><p><strong>Change impact example</strong>: RULE-04 changes from a fixed response window to a configurable one. Filter: BR-03, BR-04 → FR-10, FR-11, FR-12 → PERMIT-102, 103, 105 → TC-06..14 → reporting definition KPI-03 → SOP §6 and the applicant user manual.</p>'],
    ['Business view', '<p>Row 4 shows forward coverage missing (no tests). Row 5 shows backward coverage missing (a story with no requirement): either undocumented scope or scope creep.</p>']
  ]
},
{
  id: 'story', name: 'User story and acceptance criteria', kind: 'Agile',
  purpose: 'A testable slice of value with agreed acceptance conditions.',
  problem: 'Vague work items, rework and "is it done?" arguments.',
  howto: 'Refine with the team; check against the Definition of Ready.',
  good: ['User, capability, value', 'Negative, permission, exception and audit criteria', 'Linked designs and rules'],
  skills: ['stories', 'ac', 'wireframes', 'figma'], cases: ['rajmarg', 'ats-vms'],
  tabs: [
    ['Document', '<div class="doc"><p class="doc-meta">PERMIT-101 · Story · Epic: Clarification management · 5 points (illustrative)</p><p><strong>As a</strong> reviewing officer <strong>I want</strong> to raise a clarification with specific reasons <strong>so that</strong> the applicant knows exactly what to provide.</p><h4>Acceptance criteria</h4><ol class="ac"><li><strong>Given</strong> an application assigned to me in Under Review, <strong>when</strong> I raise a clarification with ≥1 reason, <strong>then</strong> status = Clarification Raised, applicant notified, event recorded with my ID and time.</li><li><strong>Given</strong> no reason selected, <strong>when</strong> I submit, <strong>then</strong> "Select at least one reason" and nothing saved.</li><li><strong>Given</strong> remarks exceed the limit, <strong>then</strong> the counter shows the excess and submit is disabled.</li><li><strong>Given</strong> I am not the assigned reviewer, <strong>then</strong> the action is unavailable and a direct request returns 403.</li><li><strong>Given</strong> notification sending fails, <strong>then</strong> the status still changes and the failure is logged for retry.</li><li><strong>Given</strong> status Clarification Raised, <strong>then</strong> the authority clock is paused per RULE-04.</li></ol><p><strong>Links:</strong> RULE-04, RULE-06 · Design "Clarify dialog v3" · FR-09</p><p><strong>Not acceptance criteria (implementation):</strong> "use a modal", "add column reason_codes". Those are design and engineering decisions.</p></div>'],
    ['Business view', '<p><strong>Annotated wireframe (HTML illustration, not from Figma)</strong></p><div class="wf"><div class="wf-bar"><span>APP-2025-0412 · Access permission · M/s Example Fuels</span><span class="wf-pill">Under Review · 6 days in stage</span></div><div class="wf-tabs"><span class="on">Documents</span><span>Details</span><span>Map</span><span>History</span></div><div class="wf-row"><span>Site plan.pdf · v1</span><span class="wf-st">Accepted</span></div><div class="wf-row"><span>Ownership proof.pdf · v1</span><span class="wf-st bad">Needs clarification</span></div><div class="wf-row"><span>Traffic study.pdf · v2</span><span class="wf-st">Pending</span></div><div class="wf-actions"><span class="wf-btn">Raise clarification <b>A</b></span><span class="wf-btn ghost">Recommend</span></div><div class="wf-dialog"><strong>Raise clarification</strong><div>Reasons (select at least one) <b>B</b><br>☑ Document illegible ☐ Document expired ☐ Wrong document type</div><div>Remarks (up to 1,000 characters) <b>C</b></div></div></div><ol class="anno"><li><b>A</b> Visible to the assigned reviewer only (RULE-06). Others see the read-only view.</li><li><b>B</b> Reason codes from admin-maintained list (BR-06).</li><li><b>C</b> Remarks optional; reasons mandatory.</li><li>States to design: loading, no documents, service error with reference ID.</li></ol>'],
    ['Testing', '<p>Each criterion maps to test cases: AC2 gives TC-02; AC3 gives TC-03a and TC-03b (at the limit and over the limit); AC4 gives TC-04 (UI) and TC-04b (API).</p>']
  ]
},
{
  id: 'bpmn', name: 'BPMN-style workflow', kind: 'Process',
  purpose: 'Shows roles, steps, decisions and exception paths.',
  problem: 'Missing return paths, unclear handoffs, statuses without exits.',
  howto: 'Select a step to see its status, rule and requirement. Use in workshops and training.',
  good: ['Every gateway has every outcome drawn', 'Every step in a lane', 'Statuses derived from the model'],
  skills: ['process', 'rules', 'metrics'], cases: ['rajmarg'],
  tabs: [['Interactive model', '<div data-flow="rajmarg"></div><p class="note">Illustrative reconstruction of the lifecycle in the owner\'s brief, not the production configuration.</p>'], ['Notation', '<p>Circle: start or end event. Rounded box: task. Diamond: decision (gateway). Dashed arrows: return or exception paths.</p>']]
},
{
  id: 'decision', name: 'Decision table', kind: 'Rules',
  purpose: 'Makes combined conditions and their outcomes explicit and testable.',
  problem: 'Inconsistent decisions on incomplete applications.',
  howto: 'Change the conditions to see the outcome and the rule. Each column becomes a test case.',
  good: ['Every combination covered', 'Outcome and rule per row', 'Owner confirmed'],
  skills: ['rules', 'ac', 'testing'], cases: ['rajmarg'],
  tabs: [['Interactive table', '<div data-widget="decision"></div>'], ['Testing', '<p>A full decision table has one test per column (rule). Here, 8 rows means 8 test cases, plus boundary tests for dates.</p>']]
},
{
  id: 'jira', name: 'JIRA epic and backlog', kind: 'Agile',
  purpose: 'Makes scope, order and readiness visible.',
  problem: 'Unordered work, missing dependencies, untraceable bugs.',
  howto: 'Order by value and dependency; write the reason beside the rank.',
  good: ['Epic with problem and objective', 'Stories with acceptance criteria', 'Dependencies linked', 'Test and documentation subtasks'],
  skills: ['jira', 'backlog', 'scrum', 'stories'], cases: ['rajmarg', 'ats-vms'],
  tabs: [
    ['Backlog', '<p class="note">Keys are invented. This does not reflect a live JIRA instance.</p><div class="doc"><p><strong>PERMIT-E1 Epic: Clarification management.</strong> Problem: applications return repeatedly for missing or unclear information. Objective: OBJ-1. Release: R5.</p></div><div class="tw"><table><tr><th>Rank</th><th>Key</th><th>Summary</th><th>MoSCoW</th><th>Reasoning</th><th>Depends on</th></tr><tr><td>1</td><td>PERMIT-110</td><td>Status history audit records</td><td>Must</td><td>Defensible decisions; needed for clock and reports</td><td>–</td></tr><tr><td>2</td><td>PERMIT-101</td><td>Raise clarification with reasons</td><td>Must</td><td>Core of epic</td><td>110, 106</td></tr><tr><td>3</td><td>PERMIT-106</td><td>Admin: maintain reason codes</td><td>Must</td><td>Blocks 101</td><td>–</td></tr><tr><td>4</td><td>PERMIT-102</td><td>Applicant responds</td><td>Must</td><td>Completes loop</td><td>101</td></tr><tr><td>5</td><td>PERMIT-103</td><td>Pause and resume clock</td><td>Must</td><td>Policy rule</td><td>110</td></tr><tr><td>6</td><td>PERMIT-104</td><td>Queue filter by stage and changed</td><td>Should</td><td>Reviewer productivity</td><td>103</td></tr><tr><td>7</td><td>PERMIT-105</td><td>Reminder before window ends</td><td>Should</td><td>Fewer lapses; templates pending</td><td>Templates approved</td></tr><tr><td>8</td><td>PERMIT-108</td><td>Dashboard colour themes</td><td>Could</td><td>No user blocked</td><td>–</td></tr></table></div><p><strong>Subtasks for PERMIT-101</strong>: API (dev) · UI dialog (dev) · test cases TC-01..05 (QA) · update SOP §6 (BA) · release-note entry (BA).</p>'],
    ['JQL', '<pre><code>project = PERMIT AND "Epic Link" = PERMIT-E1 AND status != Done ORDER BY Rank\n-- What is left in the epic, in backlog order\n\nproject = PERMIT AND issuetype = Bug AND fixVersion = R5 AND statusCategory != Done AND priority in (Highest, High)\n-- Release blockers to review at go/no-go\n\nproject = PERMIT AND issuetype = Story AND sprint in futureSprints() AND (labels is EMPTY OR labels not in (ready))\n-- Stories planned soon but not marked ready\n\nproject = PERMIT AND issueLinkType = "is blocked by" AND statusCategory != Done\n-- Blocked work for the dependency review</code></pre>'],
    ['Lifecycle', '<ol><li>Discovery: epic created with problem statement</li><li>Definition: stories with acceptance criteria, linked to the FRD</li><li>Refinement: estimated, split, dependencies linked, marked ready</li><li>Sprint: subtasks; daily updates</li><li>Testing: test links; bugs linked to the story</li><li>Release: fix version; release notes generated</li><li>After release: production bugs linked to the version</li></ol>']
  ]
},
{
  id: 'confluence', name: 'Confluence documentation structure', kind: 'Documentation',
  purpose: 'One navigable home for requirements, decisions and guides.',
  problem: 'Documents scattered in email; stale copies.',
  howto: 'Create the page tree at project start; templates for each page type.',
  good: ['Owner and version on every page', 'Links to JIRA', 'Archive instead of delete'],
  skills: ['confluence', 'comms'], cases: ['healthcare', 'rajmarg'],
  tabs: [['Structure', '<pre><code>Permit Portal (space)\n├── 00 Overview: vision · glossary · stakeholder register\n├── 01 Requirements\n│   ├── BRD v1.2 (approved)\n│   ├── FRD: Submission · Clarification · Approval · Payment · Notifications\n│   ├── Business Rules Catalogue (RULE-xx)\n│   ├── NFRs\n│   └── RTM\n├── 02 Design: user flows · wireframe links · design decisions\n├── 03 Integrations: GIS · payment · eSign · documents · notifications\n├── 04 Meetings: minutes (by date) · decision log · RAID log\n├── 05 Testing: UAT plan · execution reports · sign-offs\n├── 06 Releases: R4 · R5 notes\n└── 07 Operations: SOPs · user manuals · FAQ · support runbook</code></pre>'], ['Page template', '<p>Header: owner · status · version · last reviewed · linked epic. Body: purpose, content, open questions, change history.</p>']]
},
{
  id: 'api', name: 'API contract and JSON payload', kind: 'Technical',
  purpose: 'Specifies an interface\'s fields, rules, responses and failures in business terms.',
  problem: 'Integrations that fail on edge cases nobody specified.',
  howto: 'Review with engineering; turn each response into a Postman check.',
  good: ['Required vs optional fields with meaning', 'Every failure status defined', 'Idempotency for creates'],
  skills: ['api', 'integrations'], cases: ['rajmarg'],
  tabs: [
    ['Contract', '<p class="note">Illustrative endpoint and payload, not a production API.</p><pre><code>POST /api/v1/applications\nHeaders: Authorization: Bearer &lt;token&gt;\n         Idempotency-Key: 6f1c-…  (required; same key = same request)\n\nRequest body\n{\n  "applicationType": "ACCESS_PERMISSION",        // required; configured types\n  "highwayNo": "NH-XX",                          // required\n  "chainage": { "fromKm": 124.350, "toKm": 124.600 },  // required; fromKm &lt; toKm\n  "location": { "lat": 26.4499, "lng": 80.3319 },      // required\n  "documentIds": ["doc_81a", "doc_81b"],          // required; must be uploaded by caller\n  "remarks": "Access to proposed fuel station"    // optional; ≤ 500 chars\n}\n\n201 Created\n{ "applicationNo": "APP-2025-000412", "status": "SUBMITTED", "submittedAt": "2025-08-14T10:22:05+05:30" }\n\n422 Unprocessable\n{ "errors": [\n  { "field": "chainage.toKm", "code": "RANGE", "message": "End chainage must be greater than start chainage." },\n  { "field": "documentIds", "code": "MISSING_MANDATORY", "message": "Upload: Ownership proof." } ] }\n\n401  not logged in / token expired\n403  role cannot submit applications\n409  Idempotency-Key reused with a different body\n503  dependency unavailable; safe to retry with same key</code></pre>'],
    ['Status check', '<pre><code>GET /api/v1/applications/APP-2025-000412\n200 { "applicationNo": "APP-2025-000412", "status": "CLARIFICATION_RAISED",\n      "stage": "REVIEW", "with": "Reviewing officer",\n      "openClarification": { "reasons": ["DOC_ILLEGIBLE"], "dueBy": "2025-08-29" } }\n404  not found OR not owned by caller (same response, to avoid revealing existence)</code></pre>'],
    ['Technical', '<ul><li>Applicant identity from the token, never from the body.</li><li>Pagination for lists: <code>?page=2&amp;size=20</code>, with total count in the response.</li><li>Timeouts and retries: client retries only on 503 or timeout, reusing the same Idempotency-Key.</li><li>Logging: correlation ID returned in headers and shown in user error messages for support.</li></ul>'],
    ['Postman tests', '<table><tr><th>#</th><th>Case</th><th>Expect</th></tr><tr><td>1</td><td>Valid submission</td><td>201; applicationNo matches pattern; status SUBMITTED</td></tr><tr><td>2</td><td>fromKm = toKm</td><td>422; field chainage.toKm</td></tr><tr><td>3</td><td>Missing documentIds</td><td>422; MISSING_MANDATORY</td></tr><tr><td>4</td><td>No token</td><td>401</td></tr><tr><td>5</td><td>Reviewer token</td><td>403</td></tr><tr><td>6</td><td>Same key, same body twice</td><td>Second returns same 201 body; one record</td></tr><tr><td>7</td><td>Same key, different body</td><td>409</td></tr><tr><td>8</td><td>GET other applicant\'s app</td><td>404</td></tr></table><pre><code>pm.test("201 and number format", () =&gt; {\n  pm.response.to.have.status(201);\n  pm.expect(pm.response.json().applicationNo).to.match(/^APP-\d{4}-\d{6}$/);\n});</code></pre>']
  ]
},
{
  id: 'sql', name: 'SQL query and sample result', kind: 'Data',
  purpose: 'Answers operational questions directly from data.',
  problem: 'Slow or anecdotal answers to "where are files stuck?"',
  howto: 'Read the business question first, then the query, then the caveats.',
  good: ['Question stated', 'Grain understood', 'Validated against a known total'],
  skills: ['datamodel', 'sqlanalysis'], cases: ['rajmarg', 'datalake', 'healthcare'],
  tabs: [
    ['Data model', '<p class="note">Illustrative teaching schema, not a project database.</p><div data-widget="erd"></div>'],
    ['Queries', '<div class="doc"><h4>1. Pending by stage (status-based reporting)</h4><pre><code>SELECT status, COUNT(*) AS pending\nFROM applications\nWHERE status NOT IN (\'PERMISSION_ISSUED\',\'REJECTED\',\'WITHDRAWN\')\nGROUP BY status ORDER BY pending DESC;</code></pre><p>Business question: where is work sitting right now?</p><h4>2. Time in each stage (joins, aggregation)</h4><pre><code>WITH t AS (\n  SELECT app_id, to_status AS stage, acted_at AS entered,\n         LEAD(acted_at) OVER (PARTITION BY app_id ORDER BY acted_at) AS left_at\n  FROM workflow_history)\nSELECT stage, COUNT(*) AS visits,\n       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (left_at - entered))/86400) AS median_days\nFROM t WHERE left_at IS NOT NULL\nGROUP BY stage ORDER BY median_days DESC;</code></pre><p>Business question: which stage takes longest? Uses history, not current status. (PostgreSQL syntax.)</p><h4>3. Filtering: overdue clarifications</h4><pre><code>SELECT a.app_id, h.acted_at AS raised_at\nFROM applications a JOIN workflow_history h ON h.app_id = a.app_id\nWHERE a.status = \'CLARIFICATION_RAISED\' AND h.to_status = \'CLARIFICATION_RAISED\'\n  AND h.acted_at &lt; CURRENT_DATE - INTERVAL \'15 days\';</code></pre><p>15 days is illustrative. Read it from configuration in practice.</p><h4>4. Duplicate detection</h4><p>See the SQL and data analysis skill: self-join on applicant and highway with chainage overlap.</p><h4>5. Payment reconciliation</h4><pre><code>SELECT p.gateway_ref, p.amount AS portal_amount, s.amount AS settled_amount\nFROM payments p FULL OUTER JOIN settlement_report s ON s.ref = p.gateway_ref\nWHERE p.status = \'SUCCESS\' AND (s.ref IS NULL OR s.amount &lt;&gt; p.amount)\n   OR (p.gateway_ref IS NULL);</code></pre><p>Business question: which payments disagree between the portal and the payment platform?</p></div>'],
    ['Sample result', '<p class="note">Sample data.</p><table class="num"><tr><th>stage</th><th>visits</th><th>median_days</th></tr><tr><td>UNDER_REVIEW</td><td>412</td><td>4.5</td></tr><tr><td>INSPECTION</td><td>198</td><td>6.0</td></tr><tr><td>CLARIFICATION_RAISED</td><td>156</td><td>7.5</td></tr><tr><td>RECOMMENDED</td><td>187</td><td>2.0</td></tr></table><p><strong>Interpretation caveat</strong>: CLARIFICATION_RAISED is applicant waiting time; do not count it as authority delay.</p>']
  ]
},
{
  id: 'kpi', name: 'Power BI KPI definition sheet', kind: 'Data',
  purpose: 'Defines each KPI precisely so everyone computes it the same way.',
  problem: 'Conflicting numbers and misleading averages.',
  howto: 'Agree definitions before building visuals. Use the toggle to see how one definition change moves a number.',
  good: ['Numerator, denominator, period, source, refresh, interpretation', 'Target and result kept separate', 'Pause rules explicit'],
  skills: ['powerbi', 'metrics', 'hypotheses'], cases: ['rajmarg', 'healthcare', 'datalake'],
  tabs: [
    ['Dashboard', '<div data-widget="kpi"></div>'],
    ['Definitions', '<div class="tw"><table><tr><th>KPI</th><th>Numerator</th><th>Denominator</th><th>Period</th><th>Source</th><th>Refresh</th><th>Interpretation</th></tr><tr><td>KPI-01 Pending by stage</td><td>Open applications in stage</td><td>–</td><td>Snapshot</td><td>applications</td><td>Daily</td><td>Where work sits now</td></tr><tr><td>KPI-02 Ageing</td><td>Open applications by days since submission bucket</td><td>–</td><td>Snapshot</td><td>applications</td><td>Daily</td><td>How old the backlog is</td></tr><tr><td>KPI-03 Authority TAT (median)</td><td>Working days submitted → decision, excluding clarification pauses</td><td>Decided applications</td><td>Month of decision</td><td>workflow_history</td><td>Daily</td><td>Authority speed. Not total applicant experience</td></tr><tr><td>KPI-04 First-review clarification rate</td><td>Applications with a clarification at first review</td><td>Applications with a first review completed</td><td>Month</td><td>workflow_history</td><td>Daily</td><td>Submission quality</td></tr><tr><td>KPI-05 Fee collection</td><td>Confirmed payment amount</td><td>–</td><td>Month</td><td>payments</td><td>Daily</td><td>Revenue; reconcile with platform</td></tr><tr><td>KPI-06 Workload</td><td>Open assigned files per officer</td><td>–</td><td>Snapshot</td><td>assignments</td><td>Daily</td><td>Balance across officers</td></tr></table></div>'],
    ['Misleading KPI', '<p>"Average TAT, submission to decision, all days" mixes applicant waiting time with authority time, and a few very old files pull the mean up. Corrected: KPI-03 (authority-only median), plus a separate applicant response-time measure and an outlier count. A policy target ("decide within N days") is shown as a reference line, never as the result.</p>']
  ]
},
{
  id: 'uat', name: 'UAT plan and test cases', kind: 'Testing',
  purpose: 'Organises business acceptance: scope, users, scenarios, defects and sign-off.',
  problem: 'Unstructured UAT, hidden risks, unclear sign-off.',
  howto: 'Agree entry criteria, brief users, triage daily, record residual risks.',
  good: ['Entry and exit criteria', 'Role-based scenarios with data', 'Sign-off lists open issues'],
  skills: ['uat', 'testing', 'triage', 'usability'], cases: ['rajmarg', 'healthcare', 'ats-vms'],
  tabs: [
    ['Plan', '<div class="doc"><p class="doc-meta">UAT Plan · Release R5 (illustrative)</p><p><strong>Scope:</strong> clarification management; bank guarantee re-upload. <strong>Out:</strong> reports (next release).</p><p><strong>Entry:</strong> system test complete; no open critical defects; UAT data loaded; users briefed.</p><p><strong>Participants:</strong> 2 reviewers per region (2 regions), 1 approver, 1 finance user, 2 applicant proxies.</p><p><strong>Schedule:</strong> 5 working days; daily triage at 16:00.</p><p><strong>Exit:</strong> all Must scenarios passed; no open critical or high defects without an agreed workaround; sign-off by authority representative.</p><p><strong>Accessibility checks:</strong> keyboard-only completion of applicant response; error messages read by a screen reader.</p></div>'],
    ['Execution matrix', '<div class="tw"><table><tr><th>ID</th><th>Scenario</th><th>Role</th><th>Data</th><th>Expected</th><th>Result</th></tr><tr><td>UAT-01</td><td>Raise clarification</td><td>Reviewer</td><td>APP-…0412</td><td>Status changes; applicant SMS</td><td class="ok">Pass</td></tr><tr><td>UAT-02</td><td>Respond with 2 documents</td><td>Applicant</td><td>APP-…0412</td><td>Back in queue, marked changed</td><td class="ok">Pass</td></tr><tr><td>UAT-07</td><td>Guarantee valid well after required date</td><td>Finance</td><td>BG valid +90d</td><td>Accepted</td><td class="ok">Pass</td></tr><tr><td>UAT-08</td><td>Guarantee valid exactly to required date</td><td>Finance</td><td>BG valid = required</td><td>Accepted (on or after)</td><td class="bad">Fail → DEF-14</td></tr><tr><td>UAT-09</td><td>Non-assigned reviewer</td><td>Reviewer B</td><td>APP-…0412</td><td>No action available</td><td class="ok">Pass</td></tr><tr><td>UAT-08 retest</td><td>After fix</td><td>Finance</td><td>same</td><td>Accepted</td><td class="ok">Pass</td></tr></table></div><p><strong>Happy path passed, edge case failed</strong>: UAT-07 passed but UAT-08 failed. The rule says "on or after", and the code used "after".</p>'],
    ['Defect log', '<table><tr><th>ID</th><th>Summary</th><th>Severity</th><th>Priority</th><th>Status</th></tr><tr><td>DEF-14</td><td>Guarantee ending on required date rejected</td><td>Medium</td><td>High</td><td>Fixed, retested</td></tr><tr><td>DEF-15</td><td>Reminder SMS uses old template</td><td>Low</td><td>Medium</td><td>Open, workaround: email correct</td></tr></table>'],
    ['Sign-off', '<ul class="check"><li>All Must scenarios executed and passed</li><li>Open defects listed with workarounds (DEF-15)</li><li>Residual risk accepted: SMS template fixed in R5.1</li><li>User guide and SOP updated</li><li>Signed: authority representative, date</li></ul>']
  ]
},
{
  id: 'defect', name: 'Defect report', kind: 'Testing',
  purpose: 'Gives developers everything needed to reproduce and fix, and gives triage what it needs to decide.',
  problem: 'Bugs bounced back as "cannot reproduce".',
  howto: 'Use the template; attach evidence; separate severity from priority.',
  good: ['Environment and preconditions', 'Numbered steps', 'Expected vs actual', 'Evidence'],
  skills: ['triage', 'jira', 'uat'], cases: ['rajmarg', 'ats-vms'],
  tabs: [['Report', '<div class="doc"><p class="doc-meta">DEF-14 (illustrative)</p><p><strong>Title:</strong> Bank guarantee rejected when validity ends exactly on the required date</p><p><strong>Environment:</strong> UAT · build R5-rc2 · Chrome · Finance role</p><p><strong>Preconditions:</strong> APP in Provisionally Approved; required validity date 31-03-2026</p><p><strong>Steps:</strong> 1) Log in as applicant. 2) Upload guarantee with valid-to 31-03-2026. 3) Log in as finance; open verification.</p><p><strong>Expected:</strong> accepted; RULE-03 says "on or after".</p><p><strong>Actual:</strong> upload blocked with E-BG-01 "validity before required date".</p><p><strong>Severity:</strong> Medium (workaround: a guarantee valid one more day). <strong>Priority:</strong> High (contradicts policy; affects applicants).</p><p><strong>Evidence:</strong> screenshot, timestamp, request ID.</p><p><strong>Links:</strong> RULE-03 · SRS-BG-004 · UAT-08</p></div>'], ['Triage', '<p>Decision: fix in R5 before release; add boundary test to regression; update the SRS change history (boundary clarified).</p>']]
},
{
  id: 'minutes', name: 'Meeting minutes and decision log', kind: 'Communication',
  purpose: 'Records decisions, rationale, actions and open questions.',
  problem: 'Decisions reopened; actions forgotten.',
  howto: 'Publish within 24 hours; review open actions next meeting.',
  good: ['Decisions with approver', 'Actions with owner and date', 'Open questions tracked'],
  skills: ['comms', 'workshops', 'elicitation', 'conflict'], cases: ['rajmarg', 'healthcare'],
  tabs: [
    ['Minutes', '<div class="doc"><p class="doc-meta">Clarification workflow workshop · 12 Aug (illustrative)</p><p><strong>Attendees:</strong> authority representative (chair), 2 reviewing officers, programme team, BA, tech lead, QA lead.</p><p><strong>Objective:</strong> agree clarification reasons, the response window and clock behaviour.</p><h4>Decisions</h4><ol><li>D-21: Reasons mandatory; remarks optional.</li><li>D-22: Response window configurable; initial value per SOP.</li><li>D-23: Notification failure must not block status change.</li></ol><h4>Actions</h4><table><tr><th>Action</th><th>Owner</th><th>Due</th></tr><tr><td>Provide reason code list</td><td>Reviewing officer A</td><td>16 Aug</td></tr><tr><td>Confirm pause rule wording against SOP</td><td>Authority rep</td><td>19 Aug</td></tr><tr><td>Update FRD and RTM</td><td>BA</td><td>20 Aug</td></tr></table><h4>Open questions</h4><p>OQ-14: Does a partial response resume the clock? Owner: authority rep.</p></div>'],
    ['Decision log', '<table><tr><th>ID</th><th>Date</th><th>Decision</th><th>Rationale</th><th>Approver</th><th>Impacts</th></tr><tr><td>D-21</td><td>12 Aug</td><td>Reasons mandatory</td><td>Consistency; enables measurement</td><td>Authority rep</td><td>FR-09, PERMIT-101</td></tr><tr><td>D-23</td><td>12 Aug</td><td>Notifications non-blocking</td><td>Workflow must not depend on SMS</td><td>Programme team</td><td>FR-16</td></tr></table>']
  ]
},
{
  id: 'release', name: 'Release checklist', kind: 'Delivery',
  purpose: 'Confirms a release is ready: scope, quality, dependencies, people and support.',
  problem: 'Releases that work technically but fail operationally.',
  howto: 'Review at go/no-go; every item has an owner.',
  good: ['Covers people and process, not just code', 'Rollback and workaround plans', 'Post-release monitoring'],
  skills: ['release', 'dor-dod', 'enablement', 'tradeoffs'], cases: ['rajmarg', 'healthcare'],
  tabs: [
    ['Checklist', '<ul class="check"><li>Scope matches RTM; all Must items done</li><li>UAT signed off; residual risks recorded</li><li>No open critical defects; high defects have workarounds</li><li>Configuration and master data loaded (reason codes, templates)</li><li>Integrations verified in production (payment, eSign, notifications)</li><li>Data migration scripts run and reconciled (if any)</li><li>Rollback plan confirmed by engineering</li><li>Release notes: applicants, authority users, support</li><li>SOP and user manual updated</li><li>Support briefed; FAQ updated</li><li>Monitoring plan: tickets, error logs, payment exceptions for 2 weeks</li></ul>'],
    ['Release plan', '<p class="note">Illustrative, with assumptions marked.</p><table><tr><th>Week</th><th>Activity</th><th>Assumption</th></tr><tr><td>1</td><td>Sprint complete; system test</td><td>–</td></tr><tr><td>2</td><td>UAT</td><td>Users available 2 hours a day</td></tr><tr><td>3</td><td>Fixes; regression; go/no-go</td><td>Templates approved by week 2</td></tr><tr><td>3</td><td>Release; hypercare begins</td><td>Release window agreed with programme team</td></tr></table>']
  ]
},
{
  id: 'impact', name: 'Change-impact analysis', kind: 'Analysis',
  purpose: 'Lists everything a proposed change touches, with level, owner and action.',
  problem: '"Small" changes that break reports, integrations or training.',
  howto: 'Start from the problem statement and the RTM; walk the fixed checklist.',
  good: ['Problem and current state first', 'Non-system impacts included', 'Policy dependencies named'],
  skills: ['gap', 'discovery', 'migration', 'sop', 'po'], cases: ['rajmarg'],
  tabs: [
    ['Analysis', '<div class="doc"><p class="doc-meta">CR-07 · Allow bank guarantee re-upload after validity issue (illustrative)</p><p><strong>Problem statement:</strong> when finance finds a guarantee invalid, applicants currently cannot correct it within the application, so the application stalls.</p><p><strong>Current state:</strong> finance records remarks; resolution happens outside the system.</p></div><div class="tw"><table><tr><th>Area</th><th>Impact</th><th>Level</th><th>Owner</th><th>Action</th></tr><tr><td>Workflow</td><td>New loop: Invalid → applicant re-upload → finance re-verify</td><td>High</td><td>BA</td><td>Update model and statuses</td></tr><tr><td>Roles</td><td>Applicant upload; finance verify only</td><td>Medium</td><td>BA</td><td>Permission matrix</td></tr><tr><td>Data</td><td>Version history for guarantees</td><td>Medium</td><td>Tech lead</td><td>Schema change</td></tr><tr><td>Integrations</td><td>Document service: new version</td><td>Low</td><td>Tech lead</td><td>Confirm</td></tr><tr><td>Notifications</td><td>2 new templates</td><td>Low</td><td>BA</td><td>Draft for approval</td></tr><tr><td>Reports</td><td>Guarantee ageing should count from latest upload</td><td>Medium</td><td>BA</td><td>Update KPI definition</td></tr><tr><td>Testing</td><td>New cases + regression on approval flow</td><td>Medium</td><td>QA</td><td>Plan</td></tr><tr><td>Docs and training</td><td>SOP, user manual, finance briefing</td><td>Medium</td><td>BA</td><td>Update</td></tr><tr><td>Policy</td><td>Limit on re-uploads?</td><td>Open</td><td>Authority</td><td>Decision needed</td></tr></table></div>'],
    ['Recommendation', '<p>Take in the next release; decide the re-upload limit before refinement; no impact on fee rules.</p>']
  ]
}
);
