/* Before/after pairs and the process puzzle. Everything here is illustrative: written for this portfolio,
   not taken from a project document, ticket or meeting. */
window.PF = window.PF || { skills: [], cases: [], artifacts: [], scenarios: [] };

PF.compare = [
  {
    id: 'story', tab: 'Request → user story', skill: 'stories',
    before: '<p class="from">Email from a manager</p><p>Approvals are too slow. Can we make them faster? Urgent!!</p>',
    after: '<h4>User story</h4><p><b>As an</b> approver, <b>I want</b> my queue sorted oldest first, with anything over 7 days flagged, <b>so that</b> nothing waits too long.</p>' +
      '<h4>Done when</h4><ul><li>Oldest requests appear at the top</li><li>Requests older than 7 days show "Overdue"</li></ul>'
  },
  {
    id: 'decision', tab: 'Meeting notes → decision', skill: 'comms',
    before: '<p class="from">Notes, Tuesday call</p><p>Rejected uploads came up again. Re-upload or start over?? Someone check with legal. Fees next week maybe.</p>',
    after: '<h4>Decision 14 · Rejected documents</h4><p>The user re-uploads on the same request. No new request needed.</p>' +
      '<p><b>Agreed by</b> product lead and legal · <b>Next:</b> fee rules, owner finance, due Friday</p>'
  },
  {
    id: 'defect', tab: 'Complaint → bug report', skill: 'triage',
    before: '<p class="from">Chat message</p><p>Payment not working!!! Users complaining. Fix ASAP.</p>',
    after: '<h4>Bug 231 · Receipt shows the wrong order number</h4><p><b>Steps:</b> two open orders → pay the second → open the receipt.</p>' +
      '<p><b>Expected:</b> the paid order. <b>Actual:</b> the first order. Payment itself is fine.</p><p><b>Severity:</b> High · fix before release</p>'
  },
  {
    id: 'nfr', tab: 'Wish → testable requirement', skill: 'nfr',
    before: '<p class="from">First draft</p><p>The system should be fast and user friendly.</p>',
    after: '<h4>Speed</h4><p>Search answers in under 3 seconds for 95% of requests, with 200 users online.</p>' +
      '<h4>Ease of use</h4><p>A first-time user finishes a request alone in under 10 minutes.</p>'
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

/* About me and recommendations (quoted from LinkedIn, where they are public). */
PF.about = {
  title: 'Seven years, four teams.',
  text: 'I work where the people who need a system meet the teams who build it. For seven years I have turned complex, often policy-driven requirements into specifications that engineers can build, testers can verify and stakeholders can sign off. Most recently that has meant national-scale public-sector platforms for Digital India Corporation (MeitY), where documentation is mandatory and every decision has to stand up to audit. I care about detail, steady stakeholder relationships and releases that make things simpler for the people who use them. Next, I want to own the product as well as the requirements.',
  quotes: [
    { q: 'His ability to translate complex requirements into clear, actionable insights, along with his strong stakeholder management, has been instrumental in smooth project delivery. His ownership, proactive communication, and attention to detail truly set him apart.', who: 'Anhad Saini', role: 'Program Director · managed me directly' },
    { q: 'Abhishek played a pivotal role in bridging the gap between business needs, technical execution, and government compliance. He is, without a doubt, one of the most meticulous documenters I have worked with.', who: 'Himanshu Mewari', role: 'Deputy General Manager, Digital India Corporation · same team' }
  ]
};
