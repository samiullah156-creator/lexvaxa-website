/**
 * Long-form industry content: a direct-answer introduction (for search and AI answer engines),
 * concrete use cases and common questions. Example solution types, not claims of past deployments.
 */
export type IndustryDetail = {
  /** One-paragraph direct answer to "How can AI and automation help this industry?" */
  answer: string;
  useCases: { title: string; text: string }[];
  /** How a typical request moves through the system, in four steps. */
  flow: [string, string, string, string];
  /** Kinds of systems usually connected (categories, not vendor claims). */
  systems: string[];
  faqs: { question: string; answer: string }[];
};

export const industryDetails: Record<string, IndustryDetail> = {
  'legal-services': {
    answer: 'AI and automation help law firms and legal departments handle client intake, document classification, deadline tracking and internal knowledge search faster, while every substantive legal decision stays with a qualified lawyer. Lexvaxa builds these systems around your matter-management software, email and document storage, with matter-level access controls and source-linked answers.',
    useCases: [
      { title: 'Client intake and conflict checks', text: 'Structured online intake that gathers the facts of a new enquiry, prepares a conflict-check summary and routes it to the right fee earner.' },
      { title: 'Document classification and retrieval', text: 'Incoming documents are sorted by matter and type, so lawyers find the right contract, filing or correspondence in seconds.' },
      { title: 'Deadline and task routing', text: 'Court and contractual dates are extracted for review, added to calendars and escalated before they become urgent.' },
      { title: 'Knowledge assistant with citations', text: 'Internal precedents and guidance become searchable in plain language, with every answer linked to its source document.' },
    ],
    flow: ['New enquiry', 'AI intake & conflict summary', 'Lawyer review', 'Matter opened'],
    systems: ['Practice management', 'Document storage', 'Email & calendar', 'E-signature'],
    faqs: [
      { question: 'Can AI give legal advice to our clients?', answer: 'No. The systems we build support lawyers with administration, retrieval and drafting assistance. Substantive legal work is always reviewed and approved by a qualified lawyer.' },
      { question: 'How is client confidentiality protected?', answer: 'Access is limited per matter and per user, data stays in approved storage, and every assistant answer cites the documents it used so it can be checked.' },
      { question: 'Does this work with our existing practice management system?', answer: 'Usually, yes. We integrate through the APIs or exports your current tools provide, rather than asking you to replace them.' },
    ],
  },
  'logistics-field-services': {
    answer: 'AI and automation help logistics, supply chain and field service teams assign jobs, update customers and spot exceptions without re-typing the same information across dispatch, CRM and messaging tools. Lexvaxa connects these systems so status changes flow automatically and dispatchers stay in control of every assignment.',
    useCases: [
      { title: 'Request intake and assignment', text: 'Service requests from email, web forms and calls are captured once and suggested to the right driver or technician for approval.' },
      { title: 'Customer status notifications', text: 'Customers receive accurate updates when a job is scheduled, en route or complete, triggered by the status your team already records.' },
      { title: 'Proof of service capture', text: 'Photos, signatures and notes from the field are attached to the right job and customer record automatically.' },
      { title: 'Exception dashboards', text: 'Late jobs, failed deliveries and repeated issues surface on one operational dashboard instead of being found in spreadsheets.' },
    ],
    flow: ['Service request', 'AI triage & job match', 'Dispatcher approval', 'Customer updated'],
    systems: ['Dispatch / TMS', 'CRM', 'SMS & WhatsApp', 'Mobile field app'],
    faqs: [
      { question: 'Will automation make dispatch decisions on its own?', answer: 'It suggests assignments and flags exceptions, but dispatchers can review and override any decision. Consequential changes always stay with your team.' },
      { question: 'What if drivers lose connectivity?', answer: 'We design for offline capture, retries and duplicate-event handling, so updates sync reliably once a device reconnects.' },
      { question: 'Can it connect to our existing fleet or warehouse software?', answer: 'Yes, where the software offers an API or data export. We map your current tools first and integrate rather than replace.' },
    ],
  },
  'saas-technology': {
    answer: 'Technology and SaaS companies use AI to ship product features, automate customer onboarding and support, and build internal tools faster without losing control of quality, cost or customer data. Lexvaxa designs and builds these features with evaluation, usage limits and tenant-level permissions from the first release.',
    useCases: [
      { title: 'AI product features', text: 'Assistants, summarisation, search and generation features designed with evaluation tests, fallbacks and cost controls.' },
      { title: 'MVP and product architecture', text: 'A scoped first release with multi-tenant architecture, authentication and billing that can grow with the product.' },
      { title: 'Onboarding and in-app support', text: 'Guided onboarding and support answers grounded in your documentation, with clear escalation to your team.' },
      { title: 'Internal tooling and APIs', text: 'Admin panels, reporting and integrations that remove manual work for product, success and finance teams.' },
    ],
    flow: ['User question', 'AI feature or agent', 'Product data & APIs', 'Answer in product'],
    systems: ['Product database', 'Billing', 'Support desk', 'Analytics'],
    faqs: [
      { question: 'How do you keep AI feature costs predictable?', answer: 'We set usage limits per plan and tenant, cache where it is safe, choose models by measured quality and track spend from day one.' },
      { question: 'Can you work with our existing engineering team?', answer: 'Yes. We can own a feature end to end or work inside your repository, review process and release cycle.' },
      { question: 'How do you measure whether an AI feature works?', answer: 'We agree acceptance criteria up front and build an evaluation set of real examples, so every change is measured before release.' },
    ],
  },
  'ecommerce-retail': {
    answer: 'AI and automation help retail and e-commerce businesses keep orders, inventory, customer conversations and marketing data in sync, answer routine support questions instantly and act on exceptions sooner. Lexvaxa connects storefronts such as Shopify or WooCommerce with fulfilment, CRM and support tools under clear business rules.',
    useCases: [
      { title: 'Order and fulfilment sync', text: 'Orders, stock levels and shipping updates move between storefront, warehouse and accounting tools without manual re-entry.' },
      { title: 'Customer service triage', text: 'Order-status and policy questions are answered instantly, while refunds and complaints are routed to the right person with context.' },
      { title: 'Catalogue and product data', text: 'Product information is kept consistent across channels, with automated checks for missing or conflicting details.' },
      { title: 'Post-purchase follow-up', text: 'Review requests, replenishment reminders and win-back messages triggered by real purchase data and consent.' },
    ],
    flow: ['Shopper message', 'AI assistant', 'Order & stock lookup', 'Resolved or escalated'],
    systems: ['Store platform', 'Inventory', 'Helpdesk', 'Email & SMS'],
    faqs: [
      { question: 'Can an AI assistant issue refunds automatically?', answer: 'Only within rules you define. Refunds above a threshold or outside policy are routed to a person to approve.' },
      { question: 'Which e-commerce platforms do you integrate with?', answer: 'Common platforms such as Shopify and WooCommerce, plus marketplaces and fulfilment tools that provide APIs or exports.' },
      { question: 'How do you avoid duplicate or lost orders?', answer: 'Integrations are built with idempotent processing, retries and alerts, so every order is handled exactly once and failures are visible.' },
    ],
  },
  'healthcare-operations': {
    answer: 'AI and automation can reduce administrative load in healthcare organisations through scheduling support, internal process automation, document routing and operational reporting. Lexvaxa focuses on non-clinical workflows and designs every system around applicable privacy and security obligations, with human oversight and no clinical claims.',
    useCases: [
      { title: 'Scheduling support', text: 'Appointment requests, reminders and rescheduling handled across channels, with staff approving changes where needed.' },
      { title: 'Document routing', text: 'Referrals, forms and administrative documents routed to the right team with access limited to authorised staff.' },
      { title: 'Staff process automation', text: 'Repetitive internal tasks such as onboarding checklists, approvals and notifications run automatically.' },
      { title: 'Operational reporting', text: 'Capacity, waiting times and administrative workload visible on dashboards built from agreed definitions.' },
    ],
    flow: ['Patient request', 'AI intake & routing', 'Staff confirmation', 'Booking & reminder'],
    systems: ['Scheduling system', 'Patient messaging', 'Forms', 'Reporting'],
    faqs: [
      { question: 'Do you build clinical decision tools?', answer: 'No. We focus on administrative and operational workflows. Anything that touches clinical decisions is outside our scope.' },
      { question: 'How is patient data protected?', answer: 'Systems are designed with privacy by default, least-privilege access, appropriate agreements and a compliance and security review specific to your organisation.' },
      { question: 'Can patients talk to a voice or chat assistant?', answer: 'For appropriate administrative tasks such as booking or directions, yes, with clear disclosure and a fast route to a person.' },
    ],
  },
  'professional-services': {
    answer: 'AI and automation help consulting, accounting, agency and other professional services firms qualify leads, prepare proposals, onboard clients and find internal knowledge faster, so experts spend more time on client work. Lexvaxa connects your CRM, documents and communication tools while people keep approval of pricing and commitments.',
    useCases: [
      { title: 'Lead qualification and booking', text: 'Enquiries are qualified against your criteria and good-fit prospects can book a call directly into the right calendar.' },
      { title: 'Proposal preparation', text: 'Proposals drafted from approved templates and past work, then reviewed and priced by your team.' },
      { title: 'Client onboarding', text: 'Engagement letters, document requests and reminders run as one consistent workflow for every new client.' },
      { title: 'Internal knowledge search', text: 'Methodologies, templates and past deliverables become searchable in plain language with source links.' },
    ],
    flow: ['Client request', 'AI drafting & research', 'Expert review', 'Delivered & logged'],
    systems: ['CRM', 'Document storage', 'Time & billing', 'Project tools'],
    faqs: [
      { question: 'Will AI send proposals or quotes without review?', answer: 'No. Drafts are prepared automatically, but pricing and commitments are always reviewed and sent by your team.' },
      { question: 'Which CRM systems can you connect?', answer: 'Popular CRMs such as HubSpot, Salesforce, Pipedrive and Zoho, and others that offer APIs.' },
      { question: 'How quickly can we see a first result?', answer: 'Most firms start with one workflow, such as lead qualification or onboarding, scoped as a focused first phase.' },
    ],
  },
  'real-estate-property': {
    answer: 'AI and automation help real estate agencies and property managers answer enquiries instantly, book viewings, route maintenance requests and keep listing data consistent across portals and CRM, while agents stay in charge of offers, pricing and contracts. Lexvaxa connects your CRM, portals, calendars and messaging so no lead or tenant request is left waiting.',
    useCases: [
      { title: 'Instant lead response', text: 'New portal and website enquiries receive a fast, personalised reply with qualifying questions, and good-fit leads are passed to the right agent.' },
      { title: 'Viewing and valuation booking', text: 'Prospects pick a slot that matches agent availability, with confirmations and reminders sent automatically.' },
      { title: 'Maintenance request routing', text: 'Tenant requests from WhatsApp, email or forms are categorised, prioritised and assigned to the right contractor for approval.' },
      { title: 'Listing data sync', text: 'Property details, photos and status changes stay consistent between your CRM and the portals you publish to.' },
    ],
    flow: ['Portal enquiry', 'AI qualification', 'Agent follow-up', 'Viewing booked'],
    systems: ['Property CRM', 'Listing portals', 'WhatsApp & email', 'Calendars'],
    faqs: [
      { question: 'Will AI negotiate or agree prices with buyers or tenants?', answer: 'No. It answers routine questions and gathers details. Offers, pricing and contract terms are always handled by your agents.' },
      { question: 'Can it work with our existing property CRM?', answer: 'Usually, yes. We integrate through your CRM and portal APIs or exports rather than replacing the tools your team already uses.' },
      { question: 'Can enquiries be handled outside office hours?', answer: 'Yes. Assistants can respond and book viewings around the clock, with anything unusual escalated to your team the next working day.' },
    ],
  },
  'education-elearning': {
    answer: 'AI and software help schools, academies and course creators deliver learning platforms with progress tracking, automate enrolment and support students with assistants grounded in approved course material, while educators stay responsible for teaching and assessment. Lexvaxa builds these systems with careful handling of student data.',
    useCases: [
      { title: 'Learning platforms', text: 'Course delivery with video lessons, quizzes and real-time progress tracking in one place for students and educators.' },
      { title: 'Enrolment and onboarding', text: 'Applications, payments, welcome messages and account setup run as one consistent workflow.' },
      { title: 'Student support assistant', text: 'Learners get instant answers about courses and deadlines, drawn only from approved material and linked to the source.' },
      { title: 'Progress reporting', text: 'Educators and managers see attendance, completion and assessment trends on a clear dashboard.' },
    ],
    flow: ['Student question', 'AI course assistant', 'Educator review', 'Answer & progress logged'],
    systems: ['Learning platform', 'Student records', 'Payments', 'Video hosting'],
    faqs: [
      { question: 'Will AI grade students automatically?', answer: 'AI can prepare suggested feedback and auto-mark objective quizzes, but grading decisions and final feedback stay with educators.' },
      { question: 'How is student data protected?', answer: 'We apply least-privilege access, store data in approved locations and design around the privacy rules that apply to your learners.' },
      { question: 'Can you extend our existing learning platform?', answer: 'Yes. We can integrate with an existing platform through its APIs or build a focused custom platform where that fits better.' },
    ],
  },
  'finance-accounting': {
    answer: 'AI and automation help finance teams and accounting firms capture invoice and receipt data, surface reconciliation exceptions, onboard clients and report faster, while every posting, payment and judgement stays with qualified people. Lexvaxa connects documents, bank data and accounting systems with audit trails on every automated step.',
    useCases: [
      { title: 'Invoice and receipt capture', text: 'Documents are read, key fields extracted and matched to suppliers, ready for review instead of manual entry.' },
      { title: 'Reconciliation exceptions', text: 'Unmatched transactions are grouped into a clear queue with suggested matches for your team to confirm.' },
      { title: 'Client onboarding', text: 'Engagement letters, identity documents and data requests are collected through one guided workflow.' },
      { title: 'Management reporting', text: 'Live dashboards bring together figures from your accounting system and spreadsheets without copy and paste.' },
    ],
    flow: ['Invoice received', 'AI data extraction', 'Accountant approval', 'Posted with audit trail'],
    systems: ['Accounting software', 'Bank feeds', 'Document storage', 'Spreadsheets'],
    faqs: [
      { question: 'Will automation post entries or make payments on its own?', answer: 'No. Automation prepares and checks the work, but postings and payments require human approval, with every step logged.' },
      { question: 'Which accounting systems can you connect?', answer: 'Common platforms such as Xero, QuickBooks and others that provide APIs or reliable exports.' },
      { question: 'How do you handle financial data security?', answer: 'Data is encrypted, access is limited to the people and services that need it, and every automated change leaves an audit trail.' },
    ],
  },
  'marketing-creative-agencies': {
    answer: 'AI and automation help marketing and creative agencies automate client reporting, run content approvals, manage brand assets and nurture leads, so the team spends more time on strategy and creative work. Lexvaxa connects your ad, analytics, CRM and project tools, and nothing is published without client approval.',
    useCases: [
      { title: 'Automated client reporting', text: 'Performance from ads, analytics and social channels is pulled into branded reports on a schedule.' },
      { title: 'Content approval workflows', text: 'Briefs, drafts and revisions move through clear stages, with clients approving in one place.' },
      { title: 'Brand asset hubs', text: 'Official logos, guidelines and media kits are available to partners from one central, permission-controlled hub.' },
      { title: 'Lead pipelines', text: 'New enquiries are captured, qualified and nurtured automatically until they are ready for a call.' },
    ],
    flow: ['Campaign data', 'AI report drafting', 'Strategist review', 'Client report sent'],
    systems: ['Ad platforms', 'Analytics', 'CRM', 'Project tools'],
    faqs: [
      { question: 'Will AI publish content without approval?', answer: 'No. AI can draft and prepare content, but publishing happens only after your team and the client approve it.' },
      { question: 'Can reports keep each client’s branding?', answer: 'Yes. Reports and portals can be branded per client and limited to that client’s data.' },
      { question: 'Do you build agency and campaign websites too?', answer: 'Yes. We design and develop high-performance portfolio, campaign and landing pages alongside the automation work.' },
    ],
  },
};
