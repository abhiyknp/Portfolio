/* Before/after pairs and the process puzzle. Everything here is illustrative: written for this portfolio,
   not taken from a project document, ticket or meeting. */
window.PF = window.PF || { skills: [], cases: [], artifacts: [], scenarios: [] };

PF.compare = [
  {
    id: 'story', tab: 'Request → user story', skill: 'stories',
    before: '<p class="from">From: Programme team<br>Subject: approvals</p><p>Hi, approvals are taking too long. Can we make approval faster? Maybe add a button or something.</p><p>Need this urgently!!</p>',
    after: '<h4>Problem</h4><p>Files wait in the approving authority\'s queue with no sign of how long they have waited.</p>' +
      '<h4>User story</h4><p><b>As an</b> approving authority, <b>I want</b> my queue sorted by days pending, with files older than 7 days highlighted, <b>so that</b> I act on the oldest files first.</p>' +
      '<h4>Acceptance criteria</h4><ul><li><b>Given</b> files in my queue, <b>then</b> they are sorted by days pending, oldest first.</li><li><b>Given</b> a file pending more than 7 days, <b>then</b> it shows an "Overdue" tag.</li><li><b>Given</b> I filter by "Overdue", <b>then</b> only those files are listed.</li></ul>' +
      '<h4>How we will know</h4><p>Median days in "Recommended" status, measured for 4 weeks before and after release.</p>'
  },
  {
    id: 'decision', tab: 'Meeting notes → decision log', skill: 'comms',
    before: '<p class="from">Notes, Tuesday call</p><p>Finance + programme team. Bank guarantee thing came up again. Some say re-upload, some say new application?? Someone to check with legal.</p><p>Also fees. Maybe next week.</p>',
    after: '<h4>DEC-014 · Invalid bank guarantee</h4><p><b>Decision:</b> the applicant re-uploads a corrected guarantee on the same application. No new application is needed.</p>' +
      '<p><b>Options considered:</b> (1) re-upload on the same file; (2) withdraw and apply again. Option 2 restarts the authority clock and repeats the inspection.</p>' +
      '<p><b>Decided by:</b> programme lead, with finance and legal agreeing · <b>Date:</b> 14 Aug</p>' +
      '<h4>Impact</h4><ul><li>FRD: update FR-14 and the status model</li><li>RTM: add a trace to the new test cases</li><li>Open item: fee revision, owner finance, due 21 Aug</li></ul>'
  },
  {
    id: 'defect', tab: 'Complaint → defect report', skill: 'triage',
    before: '<p class="from">Chat message</p><p>Payment not working!!! Users are complaining. Please fix ASAP.</p>',
    after: '<h4>DEF-231 · Receipt shows the wrong application number</h4><p><b>Environment:</b> UAT, build 2.4.1, Chrome</p>' +
      '<p><b>Steps:</b> (1) Log in as an applicant with two open applications. (2) Pay the fee for the second one. (3) Open the receipt.</p>' +
      '<p><b>Expected:</b> the receipt shows the application that was paid for.<br><b>Actual:</b> it shows the first application\'s number. The payment itself is recorded correctly.</p>' +
      '<p><b>Frequency:</b> every time, for applicants with more than one open application.</p>' +
      '<p><b>Severity:</b> High (wrong legal record) · <b>Priority:</b> fix before release · <b>Evidence:</b> screenshot and transaction ID attached</p>'
  },
  {
    id: 'nfr', tab: 'Wish → testable requirement', skill: 'nfr',
    before: '<p class="from">Requirement, first draft</p><p>The system should be fast and user friendly.</p>',
    after: '<h4>NFR-03 · Performance</h4><p>Search results appear within 3 seconds for 95% of requests, with 200 users working at the same time. <b>Test:</b> load test before each release.</p>' +
      '<h4>NFR-07 · Usability</h4><p>A first-time applicant can submit a complete application without help in under 20 minutes. <b>Test:</b> five-user moderated session; at least four succeed.</p>' +
      '<h4>NFR-08 · Accessibility</h4><p>Pages meet WCAG 2.1 AA. <b>Test:</b> automated scan plus a keyboard-only walkthrough.</p>'
  }
];

/* Permission lifecycle, simplified to seven steps. lane is who does the step; hint explains why it sits where it does. */
PF.puzzle = [
  { t: 'Applicant submits the application, marks the location and uploads documents', lane: 'Applicant', hint: 'Everything starts with the applicant. Nothing can be checked until something is submitted.' },
  { t: 'Portal checks mandatory documents and assigns a reviewer', lane: 'Portal', hint: 'The portal checks completeness before any person spends time on the file.' },
  { t: 'Reviewing officer scrutinises the file and raises a clarification if needed', lane: 'Reviewing officer', hint: 'A reviewer can only scrutinise a file the portal has already assigned.' },
  { t: 'Field inspector visits the site and uploads a report', lane: 'Field inspector', hint: 'The inspector needs a file the reviewer has already found complete.' },
  { t: 'Approving authority grants provisional approval', lane: 'Approving authority', hint: 'The authority decides only after reading the inspection report.' },
  { t: 'Applicant pays the fees and uploads a bank guarantee', lane: 'Applicant', hint: 'Fees are asked for only after provisional approval, so nobody pays for a permission that may be refused.' },
  { t: 'Finance verifies the payment, then the authority signs the final approval', lane: 'Finance and authority', hint: 'Final sign-off comes last, once finance has confirmed the money.' }
];
