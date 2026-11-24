/**
 * The software each industry already runs on, grouped the way the team uses it. Industry pages show
 * these so a visitor sees their own stack and knows the new system connects to it instead of replacing
 * it. Names are listed for compatibility only (not partnership); depth depends on each vendor's API.
 */
export type ToolGroup = { label: string; tools: readonly string[] };

export const industryTools: Record<string, readonly ToolGroup[]> = {
  'legal-services': [
    { label: 'Practice & case management', tools: ['Clio', 'Filevine', 'MyCase', 'PracticePanther', 'Smokeball'] },
    { label: 'Legal AI & research', tools: ['Harvey', 'CoCounsel', 'Lexis+ AI', 'Westlaw'] },
    { label: 'Documents & e-signature', tools: ['DocuSign', 'NetDocuments', 'iManage', 'Adobe Acrobat Sign'] },
    { label: 'Intake, billing & calls', tools: ['Lawmatics', 'LawPay', 'RingCentral', 'Microsoft 365'] },
  ],
  'logistics-field-services': [
    { label: 'Fleet & telematics', tools: ['Samsara', 'Motive', 'Geotab', 'Descartes'] },
    { label: 'Field service & dispatch', tools: ['ServiceTitan', 'Jobber', 'Housecall Pro', 'Salesforce Field Service'] },
    { label: 'Warehouse, ERP & shipping', tools: ['NetSuite', 'SAP', 'ShipStation', 'Fishbowl'] },
    { label: 'Customer & driver messaging', tools: ['Twilio', 'WhatsApp Business', 'Slack', 'Microsoft Teams'] },
  ],
  'saas-technology': [
    { label: 'Billing & subscriptions', tools: ['Stripe', 'Chargebee', 'Paddle', 'Recurly'] },
    { label: 'Product analytics', tools: ['Segment', 'Mixpanel', 'Amplitude', 'PostHog'] },
    { label: 'Support & CRM', tools: ['Intercom', 'Zendesk', 'HubSpot', 'Salesforce'] },
    { label: 'Engineering & monitoring', tools: ['GitHub', 'Jira', 'Linear', 'Datadog', 'Sentry'] },
  ],
  'ecommerce-retail': [
    { label: 'Storefront', tools: ['Shopify', 'WooCommerce', 'BigCommerce', 'Adobe Commerce'] },
    { label: 'Inventory & fulfilment', tools: ['ShipStation', 'Cin7', 'NetSuite', 'Linnworks'] },
    { label: 'Customer support', tools: ['Gorgias', 'Zendesk', 'Intercom', 'WhatsApp Business'] },
    { label: 'Marketing & feeds', tools: ['Klaviyo', 'Meta Ads', 'Google Merchant Center', 'Attentive'] },
  ],
  'healthcare-operations': [
    { label: 'EHR & practice management', tools: ['Epic', 'Oracle Health', 'athenahealth', 'eClinicalWorks'] },
    { label: 'Scheduling & reminders', tools: ['NexHealth', 'Zocdoc', 'Weave', 'Luma Health'] },
    { label: 'Intake & forms', tools: ['Phreesia', 'IntakeQ', 'Jotform (HIPAA)'] },
    { label: 'Telehealth & reporting', tools: ['Doxy.me', 'Zoom for Healthcare', 'Power BI'] },
  ],
  'professional-services': [
    { label: 'CRM & pipeline', tools: ['HubSpot', 'Salesforce', 'Pipedrive', 'Zoho CRM'] },
    { label: 'Time, billing & accounts', tools: ['Harvest', 'QuickBooks', 'Xero', 'FreshBooks'] },
    { label: 'Projects & delivery', tools: ['Asana', 'monday.com', 'ClickUp', 'Notion'] },
    { label: 'Proposals & documents', tools: ['PandaDoc', 'DocuSign', 'Google Workspace', 'SharePoint'] },
  ],
  'real-estate-property': [
    { label: 'Agent CRM', tools: ['Follow Up Boss', 'kvCORE', 'Salesforce', 'HubSpot'] },
    { label: 'Property management', tools: ['AppFolio', 'Buildium', 'Yardi', 'Rent Manager'] },
    { label: 'Listing portals', tools: ['Zillow', 'Rightmove', 'Property Finder', 'MLS feeds'] },
    { label: 'Signing & viewings', tools: ['DocuSign', 'dotloop', 'Calendly', 'WhatsApp Business'] },
  ],
  'education-elearning': [
    { label: 'Learning platforms', tools: ['Moodle', 'Canvas', 'Google Classroom', 'Teachable', 'Thinkific'] },
    { label: 'Student records', tools: ['PowerSchool', 'Blackbaud', 'Google Workspace for Education'] },
    { label: 'Payments & enrolment', tools: ['Stripe', 'PayPal', 'HubSpot'] },
    { label: 'Live classes & video', tools: ['Zoom', 'Microsoft Teams', 'Vimeo', 'Mux'] },
  ],
  'finance-accounting': [
    { label: 'Accounting & ERP', tools: ['QuickBooks', 'Xero', 'Sage', 'NetSuite'] },
    { label: 'Banking & payments', tools: ['Plaid', 'Stripe', 'Wise', 'BILL'] },
    { label: 'Receipts & practice', tools: ['Dext', 'Hubdoc', 'Karbon', 'Canopy'] },
    { label: 'Reporting', tools: ['Excel', 'Power BI', 'Fathom', 'Google Sheets'] },
  ],
  'marketing-creative-agencies': [
    { label: 'Ads & analytics', tools: ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'GA4', 'Looker Studio'] },
    { label: 'CRM & email', tools: ['HubSpot', 'Mailchimp', 'ActiveCampaign', 'Klaviyo'] },
    { label: 'Projects & approvals', tools: ['Asana', 'ClickUp', 'monday.com', 'Frame.io'] },
    { label: 'Creative & social', tools: ['Figma', 'Canva', 'Adobe Creative Cloud', 'Hootsuite'] },
  ],
};

/**
 * Custom software Lexvaxa builds from scratch for each industry, named by software type (the way
 * development firms list their offerings), each with what it does.
 */
export type BuildOffering = { title: string; text: string };

export const industryBuilds: Record<string, readonly BuildOffering[]> = {
  'legal-services': [
    { title: 'Practice management software', text: 'Matters, contacts, tasks, time and billing in one system your firm owns.' },
    { title: 'Case management software', text: 'Case stages, deadlines, court dates and team assignments with full history.' },
    { title: 'Document management & e-signature', text: 'Matter-based storage, templates, version control and signing workflows.' },
    { title: 'Client intake & CRM', text: 'Web and phone intake, conflict-check preparation and lead follow-up.' },
    { title: 'Legal AI assistant', text: 'Source-linked research and drafting help over your own documents, with lawyer review.' },
    { title: 'Client portal & mobile app', text: 'Secure case updates, documents, messages and payments for clients.' },
  ],
  'logistics-field-services': [
    { title: 'Transport management system', text: 'Orders, loads, routes, carriers and proof of delivery in one place.' },
    { title: 'Dispatch & field service software', text: 'Job scheduling, technician assignment, checklists and status updates.' },
    { title: 'Fleet tracking dashboard', text: 'Live vehicle positions, alerts, utilisation and maintenance schedules.' },
    { title: 'Warehouse & inventory system', text: 'Stock levels, picking, transfers and barcode scanning.' },
    { title: 'Driver & technician mobile app', text: 'Jobs, navigation, photos, signatures and offline sync.' },
    { title: 'Customer tracking portal', text: 'Shipment status, ETAs, documents and automated notifications.' },
  ],
  'saas-technology': [
    { title: 'SaaS MVP & product build', text: 'From discovery to a launched product with real users and analytics.' },
    { title: 'Multi-tenant SaaS platform', text: 'Tenants, roles, SSO, billing and audit logs built in from the start.' },
    { title: 'AI product features', text: 'Copilots, search, summarisation and agents with evaluation and cost limits.' },
    { title: 'Admin & internal tools', text: 'Back-office dashboards for support, operations and finance teams.' },
    { title: 'Public API & integrations', text: 'Documented APIs, webhooks and connectors your customers can rely on.' },
    { title: 'Mobile companion app', text: 'iOS and Android apps that share your product backend and accounts.' },
  ],
  'ecommerce-retail': [
    { title: 'Custom storefront & headless commerce', text: 'Fast, branded shopping experiences on your own stack.' },
    { title: 'Order & inventory management', text: 'One view of stock and orders across channels and warehouses.' },
    { title: 'B2B ordering portal', text: 'Customer-specific pricing, quotes, reorders and credit terms.' },
    { title: 'Customer support automation', text: 'AI replies for order status, returns and FAQs, with human handover.' },
    { title: 'Loyalty & shopping app', text: 'Mobile app with accounts, rewards, offers and push notifications.' },
    { title: 'Sales & stock analytics', text: 'Dashboards for margin, sell-through and reorder points.' },
  ],
  'healthcare-operations': [
    { title: 'Patient scheduling system', text: 'Online booking, reminders, waitlists and multi-location calendars.' },
    { title: 'Clinic & hospital management software', text: 'Patients, doctors, appointments, billing and reporting.' },
    { title: 'Digital intake & forms', text: 'Pre-visit forms, consent and insurance details captured before arrival.' },
    { title: 'Patient portal & mobile app', text: 'Appointments, results, messages and payments for patients.' },
    { title: 'Telehealth platform', text: 'Video visits with scheduling, notes and follow-up workflows.' },
    { title: 'Operations dashboards', text: 'No-shows, capacity, revenue and staff utilisation at a glance.' },
  ],
  'professional-services': [
    { title: 'Client & project management platform', text: 'Clients, engagements, tasks and deliverables in one system.' },
    { title: 'Time tracking & billing software', text: 'Timesheets, rates, invoices and utilisation reporting.' },
    { title: 'Proposal & contract automation', text: 'Templates, approvals and e-signature from draft to signed.' },
    { title: 'Client portal', text: 'Documents, updates, approvals and invoices shared securely.' },
    { title: 'Knowledge assistant', text: 'AI search over past work, policies and templates with sources.' },
    { title: 'Resource planning tool', text: 'Who is available, booked or overloaded, week by week.' },
  ],
  'real-estate-property': [
    { title: 'Real estate CRM', text: 'Leads from portals, follow-ups, viewings and deal pipeline.' },
    { title: 'Property management software', text: 'Units, tenants, leases, rent collection and maintenance.' },
    { title: 'Listing website & portal sync', text: 'Your own listings site, kept in sync with major portals.' },
    { title: 'Tenant & owner portal', text: 'Payments, requests, statements and documents online.' },
    { title: 'Viewing & lead qualification bot', text: 'WhatsApp and web assistant that books viewings and qualifies buyers.' },
    { title: 'Agent mobile app', text: 'Listings, leads, notes and documents on the move.' },
  ],
  'education-elearning': [
    { title: 'Learning management system', text: 'Courses, lessons, quizzes, certificates and progress tracking.' },
    { title: 'Student information system', text: 'Enrolment, attendance, grades and records in one place.' },
    { title: 'Online course platform', text: 'Sell courses with payments, memberships and drip content.' },
    { title: 'Live class & video platform', text: 'Scheduling, video sessions, recordings and attendance.' },
    { title: 'AI tutor & assessment tools', text: 'Practice questions, feedback and marking help for teachers.' },
    { title: 'Student & parent mobile app', text: 'Timetables, assignments, results and notifications.' },
  ],
  'finance-accounting': [
    { title: 'Invoice & AP automation', text: 'Capture, matching, approvals and posting to your ledger.' },
    { title: 'Client onboarding & KYC portal', text: 'Document collection, checks and engagement letters online.' },
    { title: 'Practice management software', text: 'Clients, deadlines, tasks and recurring work for firms.' },
    { title: 'Financial reporting dashboards', text: 'Cash flow, KPIs and management packs from live data.' },
    { title: 'Expense & receipt app', text: 'Mobile capture, categorisation and approval of expenses.' },
    { title: 'Reconciliation automation', text: 'Bank and ledger matching with exceptions for review.' },
  ],
  'marketing-creative-agencies': [
    { title: 'Client reporting dashboards', text: 'Live campaign results across ad platforms in one branded view.' },
    { title: 'Agency project management', text: 'Briefs, tasks, approvals and deadlines for every client.' },
    { title: 'Content approval portal', text: 'Clients review, comment on and approve creative in one place.' },
    { title: 'Lead capture & CRM automation', text: 'Forms, scoring, routing and nurture sequences.' },
    { title: 'AI content workflows', text: 'Drafts, variations and briefs generated within brand rules, then reviewed.' },
    { title: 'Campaign landing page builder', text: 'On-brand pages launched fast with tracking built in.' },
  ],
};
