/**
 * The systems almost every business in an industry needs (calling agent, lead qualification,
 * follow-up) plus one industry-specific system, each tied to the pain point it removes.
 * The scene data are illustrative example scenarios, not records of real clients.
 */
export type CallLine = { who: 'caller' | 'agent'; text: string };
export type IndustrySystemsData = {
  /** Who the business serves, used in the shared problem statements ("clients", "patients"). */
  audience: string;
  call: { caller: string; lines: CallLine[]; outcome: string };
  lead: { source: string; fields: [string, string][]; score: number; route: string };
  followUp: { steps: [string, string][]; outcome: string };
  signature: { name: string; tagline: string; pain: string; build: string; result: string; steps: [string, string, string, string] };
};

export type SystemStory = { key: 'call' | 'lead' | 'followUp' | 'signature'; name: string; tagline: string; pain: string; build: string; result: string };

/** The problem / build / result story for each of the four systems on an industry page. */
export function systemStories(data: IndustrySystemsData): SystemStory[] {
  const { audience, signature } = data;
  return [
    { key: 'call', name: 'AI calling agent', tagline: 'Answers every call, day and night',
      pain: `Calls that come in after hours or while the team is busy go to voicemail, and many ${audience} never call back.`,
      build: 'A voice agent that answers in your tone, asks the right questions, checks your calendar and books or routes the call. Urgent calls go straight to a person.',
      result: 'Every call is answered and logged, with a short summary waiting for your team.' },
    { key: 'lead', name: 'Lead qualification', tagline: 'Scores and routes every enquiry',
      pain: `Your team spends hours on enquiries that were never a fit, while ready-to-buy ${audience} wait for a reply.`,
      build: 'Every form, call and chat is checked against your criteria, scored and sent to the right person with the key facts already collected.',
      result: 'Strong leads reach the right person in minutes. The rest move into nurture automatically.' },
    { key: 'followUp', name: 'Follow-up system', tagline: 'Never lets an enquiry go quiet',
      pain: 'Most enquiries need several touches, but manual follow-up usually stops after the first email.',
      build: 'Timed email, SMS and WhatsApp sequences that stop the moment someone replies, with a task for your team when a personal call is needed.',
      result: 'Consistent follow-up on every enquiry, without anyone keeping a list of who to chase.' },
    { key: 'signature', name: signature.name, tagline: signature.tagline, pain: signature.pain, build: signature.build, result: signature.result },
  ];
}

export const industrySystems: Record<string, IndustrySystemsData> = {
  'legal-services': {
    audience: 'clients',
    call: { caller: 'New client · Personal injury', outcome: 'Consultation booked · Thu 10:30', lines: [
      { who: 'agent', text: 'Thank you for calling. I can help you get started. What happened?' },
      { who: 'caller', text: 'I was hurt in a car accident last week.' },
      { who: 'agent', text: 'I’m sorry to hear that. When did it happen, and was a police report filed?' },
      { who: 'caller', text: 'On the 3rd. I have the report number.' },
    ] },
    lead: { source: 'Website intake form', score: 86, route: 'Sent to the personal injury team', fields: [['Matter', 'Personal injury'], ['Incident', '9 days ago'], ['Conflict check', 'Clear'], ['Jurisdiction', 'In area']] },
    followUp: { outcome: 'Engagement letter signed', steps: [['Now', 'Intake summary emailed'], ['Day 1', 'SMS: upload your documents'], ['Day 3', 'Email: engagement letter reminder'], ['Day 5', 'Task: paralegal calls the client']] },
    signature: { name: 'Case status updates', tagline: 'Clients stay informed automatically',
      pain: 'Clients call the office for updates, and staff spend hours answering the same “where is my case?” question.',
      build: 'Each phase change in your case-management system sends the client a plain-English update by SMS and email, then logs it on the matter.',
      result: 'Fewer status calls and better-informed clients, with every update on record.',
      steps: ['Case moves to Discovery', 'AI writes a plain update', 'Sent by SMS and email', 'Logged on the matter'] },
  },
  'logistics-field-services': {
    audience: 'customers',
    call: { caller: 'Customer · Delivery query', outcome: 'Tracking link sent · no dispatcher needed', lines: [
      { who: 'agent', text: 'Hi, you’ve reached dispatch. Can I take your order number?' },
      { who: 'caller', text: 'It’s 48213. Where is my delivery?' },
      { who: 'agent', text: 'Your driver is about 25 minutes away. Shall I text you the live tracking link?' },
      { who: 'caller', text: 'Yes, please.' },
    ] },
    lead: { source: 'Quote request', score: 82, route: 'Sent to an account manager', fields: [['Service', 'Weekly pallet freight'], ['Route', 'Manchester → Leeds'], ['Volume', '40 pallets / week'], ['Start', 'Next month']] },
    followUp: { outcome: 'Contract call booked', steps: [['Now', 'Quote sent with rate card'], ['Day 2', 'Email: answers to common questions'], ['Day 4', 'SMS: book a 15-minute call'], ['Day 7', 'Task: account manager calls']] },
    signature: { name: 'Live delivery updates', tagline: 'ETAs and proof of delivery, sent for you',
      pain: 'Customers chase dispatch for ETAs and proof of delivery, tying up the team during the busiest hours.',
      build: 'Driver status changes trigger ETA, delay and proof-of-delivery messages automatically, and exceptions go straight to the dispatcher.',
      result: 'Fewer “where is it?” calls and dispatchers focused on real exceptions.',
      steps: ['Driver marks en route', 'ETA calculated', 'Customer notified', 'Proof of delivery filed'] },
  },
  'saas-technology': {
    audience: 'prospects',
    call: { caller: 'Prospect · Demo request', outcome: 'Demo booked · Tue 15:00', lines: [
      { who: 'agent', text: 'Thanks for calling. Are you after a demo, or do you need support?' },
      { who: 'caller', text: 'A demo. We have about 40 users.' },
      { who: 'agent', text: 'Great. Which tools do you use today, so we can tailor it?' },
      { who: 'caller', text: 'HubSpot and Slack.' },
    ] },
    lead: { source: 'Free trial sign-up', score: 91, route: 'Sent to sales with a demo invite', fields: [['Company size', '40 seats'], ['Role', 'Head of Operations'], ['Usage', '12 sessions this week'], ['Plan fit', 'Team plan']] },
    followUp: { outcome: 'Converted to a paid plan', steps: [['Now', 'Welcome email and setup guide'], ['Day 1', 'In-app tip: connect your CRM'], ['Day 3', 'Email: a case study for their industry'], ['Day 6', 'Task: sales call before trial ends']] },
    signature: { name: 'Onboarding & support agent', tagline: 'Users reach value before the trial ends',
      pain: 'New users stall during setup and send the same support questions, so trials expire before they see value.',
      build: 'An in-app assistant answers from your documentation, guides setup step by step and hands complex issues to your team with full context.',
      result: 'Faster activation and fewer repeat tickets for your support team.',
      steps: ['User asks a question', 'Answer from your docs', 'Setup step completed', 'Hard cases to support'] },
  },
  'ecommerce-retail': {
    audience: 'customers',
    call: { caller: 'Customer · Order question', outcome: 'Resolved · no agent needed', lines: [
      { who: 'agent', text: 'Hi! I can help with orders, returns and sizing. What do you need?' },
      { who: 'caller', text: 'My order hasn’t arrived yet.' },
      { who: 'agent', text: 'I found order 10482. It’s out for delivery and will arrive before 6 pm today.' },
      { who: 'caller', text: 'Perfect, thank you.' },
    ] },
    lead: { source: 'Wholesale enquiry', score: 78, route: 'Sent to the wholesale team', fields: [['Business', 'Boutique, 3 stores'], ['Interest', 'Wholesale pricing'], ['Volume', '600 units / month'], ['Region', 'Domestic shipping']] },
    followUp: { outcome: 'Order completed', steps: [['1 hour', 'Email: items left in your cart'], ['Day 1', 'SMS: an item is low in stock'], ['Day 3', 'Email: reviews from other buyers'], ['Day 7', 'Win-back offer']] },
    signature: { name: 'Returns & order assistant', tagline: 'Returns handled by your own rules',
      pain: 'Support inboxes fill with order-status and return requests that follow the same few rules.',
      build: 'An assistant checks the order, applies your return policy, creates the label and updates the customer, escalating exceptions to your team.',
      result: 'Routine returns handled in minutes, and your team only sees the exceptions.',
      steps: ['Return requested', 'Policy checked', 'Label created', 'Refund queued for approval'] },
  },
  'healthcare-operations': {
    audience: 'patients',
    call: { caller: 'Patient · Appointment change', outcome: 'Rescheduled · reminder set', lines: [
      { who: 'agent', text: 'Hello, this is the clinic assistant. Are you booking, changing or cancelling?' },
      { who: 'caller', text: 'I need to move my appointment on Friday.' },
      { who: 'agent', text: 'I have Monday at 9:40 or Tuesday at 14:15. Which suits you?' },
      { who: 'caller', text: 'Monday, please.' },
    ] },
    lead: { source: 'New patient form', score: 88, route: 'Booked with an available clinician', fields: [['Service', 'Physiotherapy'], ['Insurance', 'Verified'], ['Preferred time', 'Mornings'], ['Referral', 'Letter attached']] },
    followUp: { outcome: 'Patient attended', steps: [['Booked', 'Confirmation and forms link'], ['48 h before', 'Reminder with a reschedule option'], ['2 h before', 'SMS: directions and parking'], ['After visit', 'Feedback and next booking']] },
    signature: { name: 'No-show recovery', tagline: 'Cancelled slots refilled automatically',
      pain: 'Missed and late-cancelled appointments leave empty slots that are hard to refill at short notice.',
      build: 'When a patient cancels or misses a slot, it is offered to the waiting list automatically and the schedule updates as soon as someone accepts.',
      result: 'Fewer empty slots, without reception phoning down a waiting list.',
      steps: ['Slot cancelled', 'Waiting list offered', 'Patient accepts', 'Schedule updated'] },
  },
  'professional-services': {
    audience: 'clients',
    call: { caller: 'New client · Enquiry', outcome: 'Discovery call booked · Wed 11:00', lines: [
      { who: 'agent', text: 'Thanks for calling. Which service are you interested in?' },
      { who: 'caller', text: 'We need an HR policy review for about 60 staff.' },
      { who: 'agent', text: 'Understood. When do you need it completed?' },
      { who: 'caller', text: 'Within the next month.' },
    ] },
    lead: { source: 'Contact form', score: 84, route: 'Sent to a senior consultant', fields: [['Service', 'HR policy review'], ['Company size', '60 staff'], ['Timeline', '4 weeks'], ['Budget', 'Confirmed']] },
    followUp: { outcome: 'Proposal accepted', steps: [['Now', 'Proposal sent'], ['Day 2', 'Email: a similar project summary'], ['Day 4', 'SMS: any questions?'], ['Day 6', 'Task: partner calls']] },
    signature: { name: 'Proposals & documents', tagline: 'From call notes to signed proposal',
      pain: 'Consultants rebuild proposals, engagement letters and reports from old files, which slows every new engagement.',
      build: 'Approved templates are filled from your CRM and call notes, checked by a person and sent for e-signature in one flow.',
      result: 'Proposals go out the same day, consistent and on-brand.',
      steps: ['Call notes captured', 'Proposal drafted', 'Partner approves', 'Sent for e-signature'] },
  },
  'real-estate-property': {
    audience: 'buyers',
    call: { caller: 'Buyer · Listing enquiry', outcome: 'Viewing booked · Sat 11:00', lines: [
      { who: 'agent', text: 'Hi, you’re calling about 14 Park Road. Would you like to view it?' },
      { who: 'caller', text: 'Yes. Is it still available?' },
      { who: 'agent', text: 'It is. Are you buying with a mortgage, and is it agreed in principle?' },
      { who: 'caller', text: 'Yes, agreed last week.' },
    ] },
    lead: { source: 'Property portal enquiry', score: 92, route: 'Sent to the listing agent', fields: [['Budget', 'Matches listing'], ['Finance', 'Mortgage agreed'], ['Timeline', 'Moving in 3 months'], ['Chain', 'No chain']] },
    followUp: { outcome: 'Offer received', steps: [['Now', 'Viewing confirmation'], ['Day 1', 'Email: similar listings'], ['Day 3', 'SMS: how was the viewing?'], ['Day 7', 'Task: agent calls about an offer']] },
    signature: { name: 'Viewing scheduler', tagline: 'Viewings booked without phone tag',
      pain: 'Agents lose hours coordinating viewings by phone between buyers, sellers and tenants.',
      build: 'Buyers pick a slot that fits the seller’s availability, confirmations and reminders go out automatically, and feedback is collected afterwards.',
      result: 'More viewings booked and feedback on every one, with less time on the phone.',
      steps: ['Buyer picks a slot', 'Seller confirms', 'Reminders sent', 'Feedback logged'] },
  },
  'education-elearning': {
    audience: 'students',
    call: { caller: 'Student · Course enquiry', outcome: 'Advisor call booked · brochure sent', lines: [
      { who: 'agent', text: 'Hello! Which course are you interested in?' },
      { who: 'caller', text: 'The data analytics certificate.' },
      { who: 'agent', text: 'It starts on 6 January, online. Shall I send the brochure and book a call with an advisor?' },
      { who: 'caller', text: 'Yes, both please.' },
    ] },
    lead: { source: 'Course enquiry form', score: 87, route: 'Sent to an admissions advisor', fields: [['Course', 'Data analytics'], ['Start', 'January intake'], ['Funding', 'Employer sponsored'], ['Entry criteria', 'Met']] },
    followUp: { outcome: 'Application submitted', steps: [['Now', 'Brochure and fees by email'], ['Day 2', 'Webinar invitation'], ['Day 5', 'SMS: application deadline'], ['Day 8', 'Task: advisor calls']] },
    signature: { name: 'Enrolment assistant', tagline: 'Complete applications, fewer repeat questions',
      pain: 'Admissions teams answer the same questions on fees, dates and requirements, and applications stall when documents are missing.',
      build: 'An assistant answers from your course catalogue, checks applications for missing documents and reminds applicants until the file is complete.',
      result: 'More complete applications and an admissions team focused on decisions.',
      steps: ['Application started', 'Missing documents flagged', 'Reminders sent', 'File ready for review'] },
  },
  'finance-accounting': {
    audience: 'clients',
    call: { caller: 'Client · Tax return', outcome: 'Upload link sent · task logged', lines: [
      { who: 'agent', text: 'Hello, how can I help with your accounts today?' },
      { who: 'caller', text: 'What do you still need for my tax return?' },
      { who: 'agent', text: 'Just your March bank statements. I’ll text you a secure upload link now.' },
      { who: 'caller', text: 'Great, thanks.' },
    ] },
    lead: { source: 'Website enquiry', score: 85, route: 'Sent to a client manager', fields: [['Service', 'Bookkeeping and payroll'], ['Business', 'Limited company'], ['Size', 'Within service range'], ['Software', 'Xero']] },
    followUp: { outcome: 'All documents received', steps: [['Now', 'Document checklist sent'], ['Day 3', 'Email: 2 items still missing'], ['Day 7', 'SMS: deadline approaching'], ['Day 10', 'Task: manager calls']] },
    signature: { name: 'Document collection', tagline: 'Less chasing, faster month-end',
      pain: 'Accountants chase clients for documents and key the same figures into several systems before work can start.',
      build: 'Clients upload to a secure portal, documents are read and matched to transactions, and only exceptions reach the accountant.',
      result: 'Less chasing, faster closes and fewer keying errors.',
      steps: ['Client uploads', 'Data extracted', 'Matched to ledger', 'Exceptions to accountant'] },
  },
  'marketing-creative-agencies': {
    audience: 'clients',
    call: { caller: 'Prospect · New project', outcome: 'Strategy call booked · Mon 14:00', lines: [
      { who: 'agent', text: 'Thanks for calling. What kind of project are you planning?' },
      { who: 'caller', text: 'A product launch campaign for March.' },
      { who: 'agent', text: 'Great. Which channels, and is a budget range agreed?' },
      { who: 'caller', text: 'Paid social and email. Budget is agreed.' },
    ] },
    lead: { source: 'Project brief form', score: 83, route: 'Sent to an account director', fields: [['Project', 'Launch campaign'], ['Channels', 'Paid social, email'], ['Timeline', '8 weeks'], ['Budget', 'In range']] },
    followUp: { outcome: 'Proposal requested', steps: [['Now', 'Credentials deck sent'], ['Day 2', 'Email: a relevant case study'], ['Day 4', 'SMS: time for a proposal call?'], ['Day 6', 'Task: director follows up']] },
    signature: { name: 'Client reporting', tagline: 'Monthly reports in minutes, not days',
      pain: 'Account teams spend days each month copying numbers from ad platforms into client reports.',
      build: 'Ad, analytics and CRM data is pulled into branded reports with AI-written summaries, checked by your team before sending.',
      result: 'Accurate reports every month and more time for strategy.',
      steps: ['Platforms synced', 'Report built', 'AI summary drafted', 'Reviewed and sent'] },
  },
};
