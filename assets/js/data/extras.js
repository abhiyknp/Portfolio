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

/* Process puzzle: three short levels that follow one request from idea to release. lane is who leads the step; hint explains why it sits where it does. */
PF.puzzle = [
  {
    name: 'Discover', kicker: 'Level 1 · Find the real problem',
    intro: 'A stakeholder says "we need a new report". Put the first five moves in order.',
    lesson: 'Understand the problem and agree on success before anyone designs a solution. A report request often hides a different need.',
    steps: [
      { t: 'A stakeholder raises a request', lane: 'Stakeholder', hint: 'Everything starts with someone asking for something.' },
      { t: 'Ask "why?" until the real problem behind the request is clear', lane: 'Business Analyst', hint: 'Before mapping people or goals, find out what is actually wrong.' },
      { t: 'Map who is affected and who decides', lane: 'Business Analyst', hint: 'Once the problem is clear, find everyone it touches and who has the final say.' },
      { t: 'Agree what success will look like, with a number', lane: 'Stakeholders', hint: 'You can only agree a measure with the people you have just identified.' },
      { t: 'Write a one-page problem statement and get it signed off', lane: 'Business Analyst', hint: 'The sign-off records everything agreed so far, so it comes last.' }
    ]
  },
  {
    name: 'Specify', kicker: 'Level 2 · Turn the need into work',
    intro: 'The problem is agreed. Now turn it into something a team can build.',
    lesson: 'Requirements are agreed before they are split into stories, and stories are prioritised and refined before a sprint starts.',
    steps: [
      { t: 'Write numbered, testable requirements and the business rules behind them', lane: 'Business Analyst', hint: 'Specification starts by writing down exactly what is needed.' },
      { t: 'Walk stakeholders through the requirements and get sign-off', lane: 'Stakeholders', hint: 'Requirements are reviewed once they exist, and before work is planned.' },
      { t: 'Split the requirements into user stories with acceptance criteria', lane: 'Business Analyst', hint: 'Only signed-off requirements are broken down into stories.' },
      { t: 'Prioritise the backlog with the product owner', lane: 'Product owner', hint: 'You can only order stories that have been written.' },
      { t: 'Refine the top stories with developers and testers', lane: 'Delivery team', hint: 'Refinement works on the stories at the top of the prioritised backlog.' },
      { t: 'The team builds the stories in a sprint', lane: 'Delivery team', hint: 'Building starts once the stories are clear enough to estimate.' }
    ]
  },
  {
    name: 'Release', kicker: 'Level 3 · Prove it works, then ship',
    intro: 'The build is ready. Get it safely to users and check that it worked.',
    lesson: 'Trace every requirement to a test, let real users accept it, and measure the result against the success measure from level 1.',
    steps: [
      { t: 'Link every requirement to a test case in the traceability matrix', lane: 'Business Analyst', hint: 'Plan the tests from the requirements before anyone starts testing.' },
      { t: 'QA tests the build and logs defects', lane: 'QA', hint: 'Testing runs against the planned test cases.' },
      { t: 'Triage the defects: fix now, fix later or accept', lane: 'Product owner and team', hint: 'Defects are triaged after they have been logged.' },
      { t: 'Business users run UAT on their real tasks', lane: 'Business users', hint: 'Users test a build in which the serious defects are already fixed.' },
      { t: 'Stakeholders sign off the release', lane: 'Stakeholders', hint: 'Sign-off follows a successful UAT.' },
      { t: 'Go/no-go check, then release to production', lane: 'Product owner', hint: 'Nothing is released without sign-off.' },
      { t: 'Measure the result against the agreed success measure', lane: 'Business Analyst', hint: 'You can only measure the result once the change is live.' }
    ]
  }
];
