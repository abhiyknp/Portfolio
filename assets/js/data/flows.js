/* Interactive swimlane workflows (BPMN-style). All three are illustrative reconstructions, not production configuration.
   kind: start | task | gateway | end | event. col is the column; lane is the index into lanes. */
window.PF = window.PF || { skills: [], cases: [], artifacts: [], scenarios: [] };

PF.flows = {
  rajmarg: {
    title: 'Permission application lifecycle (illustrative)',
    lanes: ['Applicant', 'Portal', 'Reviewing officer', 'Field inspector', 'Approving authority', 'Finance'],
    nodes: [
      { id: 'r1', lane: 0, col: 0, kind: 'start', label: 'Register and verify identity', status: 'Onboarded', note: 'Onboarding with verified mobile and email. Legacy applicants can claim an existing record from here.', req: 'BR-01' },
      { id: 'r2', lane: 0, col: 1, kind: 'task', label: 'Start application, choose type', status: 'Draft', note: 'Application type drives the mandatory-document matrix and fee rules.', rule: 'RULE-01, RULE-02', req: 'FR-01' },
      { id: 'r3', lane: 0, col: 2, kind: 'task', label: 'Mark location on map; enter chainage', status: 'Draft', note: 'GIS capture plus chainage from and to in km. From must be less than to. A typed alternative supports accessibility.', rule: 'FR-05 validation', req: 'FR-05' },
      { id: 'r4', lane: 0, col: 3, kind: 'task', label: 'Upload documents and submit', status: 'Draft', note: 'The checklist shows formats and examples. A duplicate warning appears if an active application overlaps the same chainage.', rule: 'RULE-01, RULE-05', req: 'FR-03' },
      { id: 'r5', lane: 1, col: 3, kind: 'gateway', label: 'All mandatory documents?', note: 'If anything is missing, submission is blocked and the missing items are listed. Nothing reaches the authority incomplete.', rule: 'RULE-01', req: 'FR-03' },
      { id: 'r6', lane: 1, col: 4, kind: 'task', label: 'Assign reviewer; start authority clock', status: 'Submitted', note: 'Assignment rules by region or office. The authority-side timer starts here.', rule: 'RULE-04 (clock)', req: 'FR-06' },
      { id: 'r7', lane: 2, col: 5, kind: 'task', label: 'Scrutinise application', status: 'Under Review', note: 'Reviewer checks documents, location and eligibility.', req: 'FR-08' },
      { id: 'r8', lane: 2, col: 6, kind: 'gateway', label: 'Information sufficient?', note: 'If not, raise a clarification with reason codes. Only the assigned reviewer can do this.', rule: 'RULE-06', req: 'FR-09' },
      { id: 'r9', lane: 0, col: 6, kind: 'task', label: 'Respond to clarification', status: 'Clarification Raised → Responded', note: 'Authority clock paused while waiting, per the documented rule. Resumes on response. The response window lapse triggers a reminder, then escalation (illustrative).', rule: 'RULE-04', req: 'FR-10' },
      { id: 'r10', lane: 3, col: 7, kind: 'task', label: 'Site inspection and report', status: 'Inspection', note: 'Inspector uploads the report and photos. A failed inspection returns the file to review with remarks.', req: 'FR-11' },
      { id: 'r11', lane: 2, col: 8, kind: 'task', label: 'Recommend', status: 'Recommended', note: 'Recommendation with remarks, forwarded to the approving authority.', req: 'FR-12' },
      { id: 'r12', lane: 4, col: 9, kind: 'gateway', label: 'Provisional approval?', note: 'Approve provisionally, return for review, or reject with reasons.', req: 'FR-13' },
      { id: 'r13', lane: 4, col: 10, kind: 'end', label: 'Rejected with reasons', status: 'Rejected', note: 'Reasons recorded and communicated; the applicant can see them.', req: 'BR-03' },
      { id: 'r14', lane: 0, col: 10, kind: 'task', label: 'Pay fees; upload bank guarantee', status: 'Provisionally Approved', note: 'Payment through the government payment platform (BharatKosh is named in the résumé). Pending state if no response.', req: 'FR-15' },
      { id: 'r15', lane: 5, col: 11, kind: 'gateway', label: 'Payment and guarantee valid?', note: 'Finance verifies payment and guarantee validity. If invalid, the guarantee is returned for re-upload with a reason. History is kept.', rule: 'RULE-03', req: 'FR-14' },
      { id: 'r16', lane: 4, col: 12, kind: 'task', label: 'Final approval with e-signature', status: 'Approved', note: 'Authorised approver signs with eSign. Signature failure lets them retry, and the status changes only on success.', req: 'FR-18' },
      { id: 'r17', lane: 0, col: 13, kind: 'end', label: 'Permission issued; download', status: 'Permission Issued', note: 'Signed permission available on the dashboard; notification sent.', req: 'BR-01' }
    ],
    edges: [['r1', 'r2'], ['r2', 'r3'], ['r3', 'r4'], ['r4', 'r5'], ['r5', 'r4', 'missing'], ['r5', 'r6', 'complete'], ['r6', 'r7'], ['r7', 'r8'], ['r8', 'r9', 'no'], ['r9', 'r7', 'responded'], ['r8', 'r10', 'yes'], ['r10', 'r11'], ['r11', 'r12'], ['r12', 'r13', 'reject'], ['r12', 'r14', 'approve'], ['r14', 'r15'], ['r15', 'r14', 're-upload'], ['r15', 'r16', 'valid'], ['r16', 'r17']]
  },
  healthcare: {
    title: 'Appointment to billing (illustrative)',
    lanes: ['Patient', 'Front desk', 'Doctor', 'Lab', 'Billing'],
    nodes: [
      { id: 'h1', lane: 0, col: 0, kind: 'start', label: 'Request appointment', note: 'Online or by phone.' },
      { id: 'h2', lane: 1, col: 1, kind: 'gateway', label: 'Slot available?', note: 'Slot is held for a short, configurable time during booking to prevent double booking.', rule: 'FR-H3' },
      { id: 'h3', lane: 1, col: 2, kind: 'task', label: 'Confirm and send reminder', status: 'Booked', note: 'SMS reminder before the appointment (timing configurable).' },
      { id: 'h4', lane: 1, col: 3, kind: 'task', label: 'Check in patient', status: 'Checked In', note: 'Late or no-show is handled by policy.' },
      { id: 'h5', lane: 2, col: 4, kind: 'task', label: 'Consultation; update record', status: 'In Consultation', note: 'Access to records only for patients under care, logged.', rule: 'FR-H8' },
      { id: 'h6', lane: 2, col: 5, kind: 'gateway', label: 'Lab test needed?', note: 'Order lab test or proceed to billing.' },
      { id: 'h7', lane: 3, col: 6, kind: 'task', label: 'Run test; publish result', status: 'Result Ready', note: 'Result linked to the visit; the doctor is notified.' },
      { id: 'h8', lane: 4, col: 7, kind: 'task', label: 'Generate invoice; take payment', status: 'Billed', note: 'Invoice items from consultation and lab.' },
      { id: 'h9', lane: 0, col: 8, kind: 'end', label: 'Visit closed', status: 'Closed', note: 'Patient can view the summary.' }
    ],
    edges: [['h1', 'h2'], ['h2', 'h3', 'yes'], ['h2', 'h1', 'no: choose another'], ['h3', 'h4'], ['h4', 'h5'], ['h5', 'h6'], ['h6', 'h7', 'yes'], ['h7', 'h8'], ['h6', 'h8', 'no'], ['h8', 'h9']]
  },
  ats: {
    title: 'Requisition to offer (illustrative)',
    lanes: ['Hiring manager', 'Recruiter', 'Vendor', 'Candidate', 'Interviewer'],
    nodes: [
      { id: 'a1', lane: 0, col: 0, kind: 'start', label: 'Raise requisition', status: 'Draft', note: 'Role, budget, location and headcount.' },
      { id: 'a2', lane: 1, col: 1, kind: 'gateway', label: 'Approved?', note: 'Approval chain by budget. Unapproved requisitions are never visible to vendors.', rule: 'BR-A1' },
      { id: 'a3', lane: 1, col: 2, kind: 'task', label: 'Release to vendors', status: 'Open', note: 'Selected vendors only.' },
      { id: 'a4', lane: 2, col: 3, kind: 'task', label: 'Submit candidate', note: 'Vendor uploads CV and consent.' },
      { id: 'a5', lane: 1, col: 4, kind: 'gateway', label: 'Duplicate within ownership window?', note: 'Match by email and phone. If found, reject without revealing the other vendor.', rule: 'FR-A6' },
      { id: 'a6', lane: 1, col: 5, kind: 'task', label: 'Screen candidate', status: 'Screening' },
      { id: 'a7', lane: 4, col: 6, kind: 'task', label: 'Interview and feedback', status: 'Interview', note: 'Structured feedback is required before the next stage.' },
      { id: 'a8', lane: 0, col: 7, kind: 'gateway', label: 'Select?', note: 'Hiring manager decides.' },
      { id: 'a9', lane: 3, col: 8, kind: 'end', label: 'Offer accepted', status: 'Offer Accepted', note: 'Onboarding starts; the vendor is notified.' }
    ],
    edges: [['a1', 'a2'], ['a2', 'a3', 'yes'], ['a2', 'a1', 'no'], ['a3', 'a4'], ['a4', 'a5'], ['a5', 'a4', 'duplicate'], ['a5', 'a6', 'new'], ['a6', 'a7'], ['a7', 'a8'], ['a8', 'a9', 'yes'], ['a8', 'a3', 'no: continue search']]
  }
};
