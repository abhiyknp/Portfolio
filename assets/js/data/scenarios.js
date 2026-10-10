/* Decision scenarios. Educational simulations, not claims about undocumented production behaviour.
   Each option: verdict ('recommended' | 'situational' | 'risky'), and optional detail panels. */
window.PF = window.PF || { skills: [], cases: [], artifacts: [], scenarios: [] };

PF.scenarios.push(
{
  id: 'missing-info', name: 'An application cannot proceed: required information is missing',
  short: 'Missing information',
  situation: 'A reviewing officer opens an access-permission application. The ownership-proof document is a scan of the wrong page. Everything else looks fine. What should the system and the officer do?',
  context: 'Submission validation already checks that a file was attached (RULE-01). It cannot check that the content is correct, so this is caught at review.',
  options: [
    { id: 'reject', label: 'Reject the application', verdict: 'risky',
      reasoning: 'Rejection is final and forces the applicant to start again, including fees and location capture, for a fixable problem. It also distorts metrics: rejection counts rise for a reason unrelated to eligibility.',
      rule: 'Rejection should be reserved for ineligibility or substantive grounds defined in policy (for example, a location where access is not permitted). A wrong page is not such a ground.',
      ux: 'Applicant receives a rejection notice and must create a new application. High frustration; likely support calls.',
      workflow: 'Status → Rejected (terminal). Authority clock stops. New application starts a new clock.',
      ac: 'Given a rejection, then a reason from the configured rejection list is mandatory and the applicant can view it.',
      tests: 'Rejection without reason blocked; rejection reasons visible to applicant; terminal status cannot be reopened.',
      jira: 'Not recommended for this case. No story.' },
    { id: 'clarify', label: 'Return for clarification with a reason', verdict: 'recommended',
      reasoning: 'The problem is fixable and specific. Clarification keeps the application, its history and payments intact, tells the applicant exactly what to fix, and pauses the authority clock while the applicant acts.',
      rule: 'RULE-06: only the assigned reviewer can raise it. RULE-04: the authority clock pauses from Clarification Raised until the applicant responds, as per the documented rule (parameters illustrative). Reason code: "Wrong or illegible document", with the document named.',
      ux: 'Applicant gets SMS and email: "Your application needs one document: Ownership proof (wrong page uploaded). Respond by [date]." The dashboard shows the request as a checklist; the upload screen shows accepted formats.',
      workflow: 'Under Review → Clarification Raised (clock paused) → Clarification Responded (clock resumes) → Under Review. History records each event with actor and time.',
      ac: 'Given an assigned application, when I raise a clarification naming the document and reason, then status = Clarification Raised, the applicant is notified, and the clock pauses. Given the applicant uploads the requested document, then status = Clarification Responded and the file returns to my queue marked "changed".',
      tests: 'TC: raise with reason (pass) · raise without reason (blocked) · non-assigned reviewer (refused) · response uploads the named document · response without the document (blocked) · clock paused duration excluded from authority TAT · notification failure does not block status.',
      jira: 'PERMIT-101 Raise clarification with reasons · PERMIT-102 Applicant responds · PERMIT-103 Pause and resume clock' },
    { id: 'evidence', label: 'Request additional evidence through a separate channel', verdict: 'situational',
      reasoning: 'Useful when the document is valid but the reviewer needs more than the policy requires: for example, a supplementary site photo. Done by email, outside the system, it breaks traceability and the clock rules.',
      rule: 'If additional evidence is a recognised step, model it as a reason code ("Additional evidence requested") within the clarification flow, so it is recorded and timed. Never use an off-system channel.',
      ux: 'Off-system requests confuse applicants: the portal says "Under Review" while an email asks for documents.',
      workflow: 'Off-system: no status change, so the clock keeps running against the authority. In-system: same as clarification.',
      ac: 'Given a request for additional evidence, then it is raised through the clarification flow with the "Additional evidence" reason and a description.',
      tests: 'Reason code available; description mandatory for this reason.',
      jira: 'PERMIT-106 Admin maintains reason codes (add "Additional evidence requested")' }
  ],
  takeaways: ['Match the action to the nature of the problem: fixable leads to clarification; ineligible leads to rejection.', 'Keep every request inside the system so history and timing stay correct.', 'Write the rule, the message, the status change, the acceptance criteria and the tests together.'],
  skills: ['rules', 'ac', 'process', 'metrics', 'usability'], artifacts: ['decision', 'story', 'bpmn']
},
{
  id: 'conflict', name: 'Conflicting stakeholder requirements', short: 'Conflicting requirements',
  situation: 'Applicant representatives want a shorter form. The approving authority wants every field kept for compliance. Both escalate to the programme team.',
  context: 'The form has 38 fields (illustrative). Nobody has mapped which fields are used at which stage.',
  options: [
    { id: 'split', label: 'Split the difference: remove the 10 least-liked fields', verdict: 'risky', reasoning: 'Compromises by popularity may remove a field a later stage needs, creating clarifications, which is the opposite of the goal.' },
    { id: 'map', label: 'Map each field to who uses it, when, and under which rule', verdict: 'recommended', reasoning: 'Turns one argument into many small, evidence-based decisions. Unused fields go; fields needed later move to that stage; fields needed now stay with better help text. Contested fields go to the decision-maker with options and impacts, and the decision is recorded.', ac: 'Each removed or moved field has a decision-log entry with approver.', tests: 'Regression: later stages still have the data they need.' },
    { id: 'defer', label: 'Keep everything and add help text only', verdict: 'situational', reasoning: 'Acceptable as a first increment if the field mapping cannot be done before release, but it does not address the applicants\' need.' }
  ],
  takeaways: ['Turn positions into needs.', 'Use evidence (field usage) to depersonalise the conflict.', 'Record decisions with approver.'],
  skills: ['elicitation', 'conflict', 'comms'], artifacts: ['minutes']
},
{
  id: 'api-fail', name: 'A failed API response during payment', short: 'Failed API response',
  situation: 'An applicant pays. The payment platform debits the account, but the portal\'s callback times out. The applicant sees an error and calls support.',
  context: 'There is no "pending" state in the current design.',
  options: [
    { id: 'retry-pay', label: 'Ask the applicant to pay again', verdict: 'risky', reasoning: 'Risks double payment and refund work. Damages trust.' },
    { id: 'pending', label: 'Introduce a Payment Pending state with status verification and reconciliation', verdict: 'recommended', reasoning: 'Unknown outcomes are normal in integrations. Show "Payment status being confirmed", verify through the platform\'s status call, and reconcile daily with a finance exception list. Move forward only on confirmed success.', ux: '"We have not yet received confirmation from the payment service. Do not pay again. We will update this page; you will also get an SMS."', workflow: 'Payment Initiated → Payment Pending → Paid or Failed.', ac: 'Given no response within the timeout, then status = Payment Pending and the pay button is disabled for this application.', tests: 'Timeout simulation; verification resolves to success; to failure; reconciliation lists mismatch.', jira: 'PERMIT-140 Payment pending state · PERMIT-141 Daily reconciliation report' },
    { id: 'manual', label: 'Support marks it paid manually after checking', verdict: 'situational', reasoning: 'Needed as a fallback, but only with evidence, a reason, audit and separation of duties.' }
  ],
  takeaways: ['Design the unknown state.', 'Never let users pay twice.', 'Reconciliation has an owner.'],
  skills: ['integrations', 'api', 'rbac'], artifacts: ['api']
},
{
  id: 'invalid-doc', name: 'An invalid document: bank guarantee validity', short: 'Invalid document',
  situation: 'A bank guarantee\'s validity ends one day before the required date. Finance spots it during verification.',
  context: 'The current design has no way to replace a guarantee within the application.',
  options: [
    { id: 'reject-app', label: 'Reject the application', verdict: 'risky', reasoning: 'Disproportionate. The issue is fixable.' },
    { id: 'reupload', label: 'Mark invalid with reason; allow applicant re-upload; re-verify', verdict: 'recommended', reasoning: 'Keeps the application moving, retains history, and makes the reason explicit. It needs a change-impact analysis (workflow, roles, data versions, reports, SOP).', rule: 'RULE-03: valid-to must be on or after the required date. The boundary is explicitly inclusive.', ac: 'Given finance marks the guarantee invalid (reason: validity), then the applicant can upload a new version; the old version stays in history.', tests: 'Valid-to one day before (reject at upload) · equal (accept) · after (accept) · finance cannot upload · applicant cannot verify.', jira: 'PERMIT-121, PERMIT-122; DEF-14 boundary bug' },
    { id: 'override', label: 'Finance accepts it with a note', verdict: 'risky', reasoning: 'Bypasses a policy rule without authority, creating audit exposure.' }
  ],
  takeaways: ['Boundaries ("on or after") must be written into rules and tests.', 'Fixable problems need a correction loop.'],
  skills: ['rules', 'gap', 'uat'], artifacts: ['impact', 'srs', 'defect']
},
{
  id: 'migration', name: 'An unexpected migration discrepancy', short: 'Migration discrepancy',
  situation: 'A trial migration of legacy approvals loads 980 of 1,000 records. Twenty are rejected, and among the 980, three show a different fee amount from the source. (Numbers illustrative.)',
  context: 'Go-live is in three weeks.',
  options: [
    { id: 'ignore', label: 'Proceed. 98% is good enough', verdict: 'risky', reasoning: 'Each record is a real applicant. Value mismatches suggest a transformation bug that may affect production data.' },
    { id: 'investigate', label: 'Log every exception with a reason; trace value mismatches to the transformation rule; fix and re-run', verdict: 'recommended', reasoning: 'Reconcile counts and values; classify rejections (missing chainage, invalid applicant ID); route each class to an owner (data fix, manual capture, or excluded with communication). Value mismatches often come from a rounding or currency-unit rule; check the mapping sheet.', tests: 'Re-run reconciliation: counts by status, fee totals, sampled record comparison by business users.' },
    { id: 'manual', label: 'Capture the 20 manually after go-live', verdict: 'situational', reasoning: 'Acceptable for a small number if applicants are told and there is a migration-specific status so they are not treated as new submissions.' }
  ],
  takeaways: ['Reconcile values, not just counts.', 'Every exception needs a reason and an owner.'],
  skills: ['migration', 'sqlanalysis', 'datamodel'], artifacts: ['sql', 'impact']
},
{
  id: 'kpi-mismatch', name: 'A dashboard KPI mismatch', short: 'KPI mismatch',
  situation: 'The management dashboard shows average turnaround of 41 days; the regional office\'s own spreadsheet says 23 days for the same month. (Numbers illustrative.)',
  context: 'Both teams believe their number is right.',
  options: [
    { id: 'pick', label: 'Pick the dashboard number. It is the system of record', verdict: 'risky', reasoning: 'Both may be correct for different definitions. Choosing one without understanding the difference loses trust.' },
    { id: 'define', label: 'Compare definitions: start and end events, pauses, mean vs median, cohort', verdict: 'recommended', reasoning: 'Typical cause: the dashboard includes applicant clarification time and uses the mean (pulled up by a few very old files); the spreadsheet excludes clarification time and counts only files decided that month. Agree one definition per question, version it, and show both authority time and total time, labelled.', tests: 'Recompute both from history for a sample of applications; reconcile.' },
    { id: 'hide', label: 'Remove the KPI until agreed', verdict: 'situational', reasoning: 'Reasonable briefly, but the underlying definition still needs fixing.' }
  ],
  takeaways: ['A KPI without a definition is an opinion.', 'Separate targets from results; separate authority time from applicant time.'],
  skills: ['powerbi', 'metrics', 'sqlanalysis'], artifacts: ['kpi', 'sql']
},
{
  id: 'late-scope', name: 'A late change in scope', short: 'Late scope change',
  situation: 'Four days before UAT, a senior official asks that provisional approval letters include a QR code linking to the verification page.',
  context: 'The release date is fixed by a public announcement.',
  options: [
    { id: 'accept', label: 'Add it to the current release', verdict: 'risky', reasoning: 'Work that has not been estimated, a new integration dependency and no time to test it put the whole release at risk.' },
    { id: 'assess', label: 'Run a quick impact assessment and give options with consequences', verdict: 'recommended', reasoning: 'Assess design, template, verification page, security (what the QR exposes), testing and documentation. Option A: next release (no risk to date). Option B: current release, dropping a Could item and adding two days of testing (risk to date). The decision-maker chooses and the decision is logged.', ac: 'If accepted: given an approval letter, then it includes a QR resolving to a verification page that shows only permission number, validity and status.', jira: 'PERMIT-160 QR on letters (fixVersion decided by PO)' },
    { id: 'refuse', label: 'Refuse. Scope is frozen', verdict: 'situational', reasoning: 'Scope freezes are legitimate, but a flat refusal without options harms the relationship. Explain, then offer the next release.' }
  ],
  takeaways: ['Respond to late change with options and impacts, not yes or no.', 'Protect the release date, quality and the relationship together.'],
  skills: ['tradeoffs', 'conflict', 'release', 'gap'], artifacts: ['impact', 'release']
}
);
