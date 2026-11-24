export type Service = {
  slug: string;
  name: string;
  shortName: string;
  blurb: string;
  description: string;
  keyword: string;
  whatItIs: string;
  audience: string;
  problems: string[];
  deliverables: { name: string; detail: string }[];
  outcomes: string[];
  approach: string[];
  faqs: { question: string; answer: string }[];
};

export const services: Service[] = [
  {
    slug: 'ai-agents-intelligent-automation', name: 'AI Agents & Intelligent Automation', shortName: 'AI Agents & Automation',
    blurb: 'Connect decisions, data and execution through supervised intelligent workflows.',
    description: 'Custom AI agents and workflow automation that connect your business applications, handle repeatable tasks and escalate exceptions to your team.',
    keyword: 'AI agent development and workflow automation',
    whatItIs: 'An AI agent can reason over permitted information, decide which approved tool to use and take an action. Intelligent automation combines that capability with deterministic workflows, validation, logs and human approval where the cost of error is high.',
    audience: 'Operations teams, service businesses and growing companies spending too much time transferring information between systems.',
    problems: ['Manual copy-and-paste between apps', 'Leads, tickets or requests that sit unanswered', 'Processes that break when data is incomplete', 'No clear record of what an automation changed'],
    deliverables: [
      { name: 'Workflow assessment', detail: 'Map inputs, decisions, failure points and the human checkpoints that matter.' },
      { name: 'Custom AI agents', detail: 'Tool-using agents with constrained access and auditable actions.' },
      { name: 'n8n, Make & API workflows', detail: 'Trigger-based integrations across existing business software.' },
      { name: 'Document-to-action pipelines', detail: 'Classify incoming materials, extract fields and route for review.' },
      { name: 'Exception handling', detail: 'Retries, alerts, escalation paths and error logs.' },
      { name: 'Operational handover', detail: 'Workflow documentation, tests and ownership guidelines.' },
    ],
    outcomes: ['Reduce repetitive operational steps', 'Improve response consistency', 'Keep employees in control of sensitive decisions'],
    approach: ['Audit a real process and its business rules', 'Choose deterministic automation versus AI at each step', 'Build, test and monitor with appropriate approvals'],
    faqs: [
      { question: 'Do we need an AI agent or a conventional workflow?', answer: 'Use a conventional workflow for fixed, predictable rules. Add an AI component only where classification, interpretation or flexible language adds clear value.' },
      { question: 'Can automation work with our current CRM?', answer: 'Often yes, through native integrations, webhooks or APIs. Feasibility depends on your CRM edition, permissions and API limits.' },
      { question: 'How do you manage agent mistakes?', answer: 'We design validation, restricted permissions, test cases, logging and human review for consequential actions.' },
    ],
  },
  {
    slug: 'generative-ai-ml-engineering', name: 'Generative AI & ML Engineering', shortName: 'Generative AI & ML',
    blurb: 'Turn AI experiments into dependable applications with measured outcomes.',
    description: 'Generative AI development, machine learning integrations, evaluations and deployment engineering for practical business applications.',
    keyword: 'generative AI development and machine learning engineering',
    whatItIs: 'Generative AI development combines language and multimodal models with product requirements, data access, evaluation and operational controls. ML engineering focuses on the full lifecycle: preparing data, choosing models, measuring performance and keeping systems reliable.',
    audience: 'Product owners and engineering teams ready to move from an AI proof of concept to a maintained product capability.',
    problems: ['Unreliable model output in production', 'Prototype prompts that cannot be tested consistently', 'Unclear model cost or latency', 'No evaluation method for quality or failure'],
    deliverables: [
      { name: 'AI feasibility & architecture', detail: 'Define the task, constraints, baseline and measurable acceptance criteria.' },
      { name: 'LLM integrations', detail: 'Connect suitable hosted or self-managed model APIs into applications.' },
      { name: 'Prompt & evaluation systems', detail: 'Build repeatable test cases and regression checks for output quality.' },
      { name: 'Model adaptation', detail: 'Assess retrieval, fine-tuning and other methods against task needs.' },
      { name: 'Machine learning pipelines', detail: 'Data processing, inference integration and lifecycle monitoring.' },
      { name: 'Production observability', detail: 'Track latency, cost, failures and relevant quality indicators.' },
    ],
    outcomes: ['More repeatable AI product behavior', 'Better visibility into model cost and quality', 'A path from prototype to production'],
    approach: ['Define success criteria and representative examples', 'Compare realistic model and architecture options', 'Deploy with evaluation, monitoring and recovery paths'],
    faqs: [
      { question: 'Will we need to train a custom model?', answer: 'Not always. Many applications work best with existing models, targeted prompting, retrieval and software controls. Training is considered only when the evidence supports it.' },
      { question: 'Can you work with our internal data?', answer: 'Yes, where access is authorized and the required privacy, security and data-handling arrangements are in place.' },
      { question: 'What determines model choice?', answer: 'Task quality, latency, operational cost, privacy requirements, context length and integration constraints.' },
    ],
  },
  {
    slug: 'conversational-voice-ai', name: 'Conversational & Voice AI', shortName: 'Conversational & Voice AI',
    blurb: 'Handle conversations, qualification and routing across voice and messaging channels.',
    description: 'AI voice agents, chat assistants and conversational workflows for customer support, qualification, scheduling and service operations.',
    keyword: 'AI voice agents and conversational AI development',
    whatItIs: 'Conversational AI combines language understanding with business rules and integrated actions. Voice systems add speech recognition, synthesis, call routing and safeguards for live interactions.',
    audience: 'Teams handling high volumes of calls, messages and scheduling requests that require timely responses.',
    problems: ['Missed inbound calls and unqualified appointments', 'Repeated support questions consuming staff time', 'Disconnected conversation and CRM records', 'Inconsistent handoff from a virtual assistant to a person'],
    deliverables: [
      { name: 'Voice AI agents', detail: 'Design call paths, tool actions and escalation across appropriate voice platforms.' },
      { name: 'Website chat assistants', detail: 'Guide visitors to relevant answers and capture qualified enquiries.' },
      { name: 'Lead qualification', detail: 'Collect necessary context and update authorized CRM records.' },
      { name: 'Appointment workflows', detail: 'Check permitted calendar availability and request bookings.' },
      { name: 'Conversation safeguards', detail: 'Disclosure, fallbacks, escalation and sensitive-topic boundaries.' },
      { name: 'Call analytics & QA', detail: 'Review transcripts, failure patterns and business outcomes where permitted.' },
    ],
    outcomes: ['Offer more consistent first responses', 'Reduce repetitive conversation handling', 'Route qualified requests to the right person'],
    approach: ['Map conversations and appropriate disclosure rules', 'Integrate approved knowledge, CRM and booking tools', 'Test real-world accents, interruptions and exception paths'],
    faqs: [
      { question: 'Can voice AI book appointments?', answer: 'It can when a scheduling system offers the necessary APIs and access. Booking rules, availability checks and confirmation messages must be tested.' },
      { question: 'Will it replace our support team?', answer: 'The best fit is often answering repeatable questions and helping your team prioritize complex or sensitive cases.' },
      { question: 'What about call consent?', answer: 'Telephony, recording, disclosure and consent rules vary by jurisdiction. Legal and provider-specific requirements must be confirmed before launch.' },
    ],
  },
  {
    slug: 'rag-data-business-intelligence', name: 'RAG, Data & Business Intelligence', shortName: 'RAG, Data & BI',
    blurb: 'Make company knowledge easier to retrieve, verify and act on.',
    description: 'Retrieval-augmented generation, internal knowledge search, data pipelines and business dashboards for operational decision-making.',
    keyword: 'RAG development and business intelligence solutions',
    whatItIs: 'Retrieval-augmented generation (RAG) lets an AI application consult selected information sources at response time. Data engineering and business intelligence organize records so teams can trace information, answer questions and evaluate performance.',
    audience: 'Organizations with scattered documents, multiple data sources or reporting that still depends on manual spreadsheets.',
    problems: ['Answers buried across drives and document repositories', 'Unclear source references in AI responses', 'Siloed data across operational tools', 'Reports that cannot be reproduced reliably'],
    deliverables: [
      { name: 'Document ingestion & parsing', detail: 'Prepare and classify supported document formats with access controls.' },
      { name: 'Vector search & retrieval', detail: 'Embedding, filtering and ranked retrieval with source references.' },
      { name: 'Knowledge assistants', detail: 'Question answering grounded in authorized internal materials.' },
      { name: 'Data pipelines', detail: 'Clean, reconcile and connect business datasets.' },
      { name: 'BI dashboards', detail: 'Create interpretable operational views and clear metric definitions.' },
      { name: 'Retrieval evaluation', detail: 'Test relevance, access boundaries, citation coverage and response quality.' },
    ],
    outcomes: ['Find relevant information faster', 'Improve traceability of AI answers', 'Make reporting more consistent'],
    approach: ['Inventory and permission-map information sources', 'Establish retrieval and dashboard baselines', 'Validate answers, access control and metric definitions'],
    faqs: [
      { question: 'How is RAG different from fine-tuning?', answer: 'RAG retrieves current source material at query time. Fine-tuning changes model behavior using training examples. They solve different problems and can sometimes be combined.' },
      { question: 'Can RAG respect document permissions?', answer: 'Yes, but only if permissions are explicitly modeled and enforced at retrieval time. A vector database by itself does not provide complete authorization.' },
      { question: 'Will answers always be correct?', answer: 'No. Retrieval and answer quality must be tested; high-stakes uses should include source inspection and human review.' },
    ],
  },
  {
    slug: 'custom-software-web-apps', name: 'Custom Software & Web Apps', shortName: 'Custom Software & Web Apps',
    blurb: 'Build maintainable digital systems designed around your operations.',
    description: 'Custom web applications, portals, API integrations, dashboards and software modernization engineered for your business workflow.',
    keyword: 'custom software development and web application development',
    whatItIs: 'Custom software replaces disconnected workarounds with purpose-built applications. A strong implementation starts with clear workflows, practical architecture, secure access and maintainability.',
    audience: 'Organizations needing a secure portal, integration-heavy application or tailored internal tool.',
    problems: ['Off-the-shelf software that does not match business rules', 'Disconnected tools and duplicate data entry', 'Legacy experiences that customers find difficult', 'Features that are expensive to change'],
    deliverables: [
      { name: 'Product discovery & UX', detail: 'Clarify workflows, user roles, screen flows and scope.' },
      { name: 'Next.js web applications', detail: 'Responsive, accessible user experiences with server-rendered routes.' },
      { name: 'API & integration layers', detail: 'Connect services using documented interfaces and robust error handling.' },
      { name: 'Operations dashboards', detail: 'Surface the right controls and reporting to authorized users.' },
      { name: 'Authentication & roles', detail: 'Plan and implement appropriate permissions and user access.' },
      { name: 'Testing & deployment', detail: 'Automated checks, release workflows and operational handover.' },
    ],
    outcomes: ['Improve fit between software and business process', 'Reduce dependence on disconnected workarounds', 'Create a foundation that can evolve'],
    approach: ['Validate the core workflows and constraints', 'Design the data model, routes and access boundaries', 'Ship in tested increments with clear acceptance criteria'],
    faqs: [
      { question: 'Can you improve an existing application?', answer: 'Often yes. We first review the codebase, dependencies, infrastructure and technical debt to determine the safest upgrade path.' },
      { question: 'How long does a custom app take?', answer: 'Timelines depend on scope, integrations, compliance and review cycles. A discovery phase is the right place for a credible estimate.' },
      { question: 'Who owns the code?', answer: 'Ownership, access, licensing and handover terms should be clearly established in the project agreement.' },
    ],
  },
  {
    slug: 'saas-ai-product-development', name: 'SaaS & AI Product Development', shortName: 'SaaS & AI Products',
    blurb: 'From a validated product idea to a launch-ready software platform.',
    description: 'MVP development, multi-tenant SaaS engineering, subscription flows and AI product features built for iteration and scale.',
    keyword: 'SaaS development and AI product engineering',
    whatItIs: 'SaaS product engineering combines product discovery, application architecture, recurring-access flows, onboarding, monitoring and lifecycle maintenance. AI products additionally require model evaluation and safe data handling.',
    audience: 'Founders and teams building subscription products, B2B tools or AI-enabled applications.',
    problems: ['Oversized MVP scope and unclear priorities', 'User onboarding and billing complexity', 'Multi-tenant data isolation concerns', 'AI features that are hard to evaluate or price'],
    deliverables: [
      { name: 'MVP planning', detail: 'Define core users, a narrow value proposition and a testable first release.' },
      { name: 'Product architecture', detail: 'Map tenants, entities, permissions, APIs and integrations.' },
      { name: 'Web application engineering', detail: 'Build customer-facing workflows and internal controls.' },
      { name: 'Subscription integration', detail: 'Integrate a supported billing provider with robust state handling.' },
      { name: 'AI feature integration', detail: 'Add tested AI capabilities where they improve the product.' },
      { name: 'Launch readiness', detail: 'Deployment, logging, monitoring and a maintenance handover.' },
    ],
    outcomes: ['Launch with a more focused feature set', 'Reduce architectural rework', 'Learn from real product usage'],
    approach: ['Identify product hypotheses and measurable value', 'Build the smallest coherent, secure version', 'Use feedback and observed usage to guide subsequent releases'],
    faqs: [
      { question: 'Should we build an MVP before a full platform?', answer: 'Usually. An MVP can test the riskiest product assumptions before investing in a broader feature set.' },
      { question: 'Can you integrate payments?', answer: 'Yes where a payment provider supports the required product and geography. Billing access, tax handling and security requirements must be scoped.' },
      { question: 'How do you handle tenant isolation?', answer: 'Isolation is an architectural requirement involving application authorization, database access policies, testing and monitoring.' },
    ],
  },
  {
    slug: 'crm-revenue-automation', name: 'CRM & Revenue Automation', shortName: 'CRM & Revenue Automation',
    blurb: 'Connect lead capture, follow-up, pipeline updates and client handoffs.',
    description: 'CRM integration, lead response systems, pipeline automation and sales operations workflows that reduce administrative friction.',
    keyword: 'CRM automation and sales workflow integration',
    whatItIs: 'CRM automation joins marketing, sales and service processes around an accurate contact and opportunity record. Done well, it reduces manual updates while preserving consent, ownership and visibility into every handoff.',
    audience: 'Sales and service teams working across lead forms, messaging, phones, calendars and CRMs.',
    problems: ['Leads not followed up promptly', 'Duplicate or incomplete contact records', 'Appointments disconnected from sales pipeline', 'Sales staff doing repetitive administrative tasks'],
    deliverables: [
      { name: 'CRM audit & architecture', detail: 'Review objects, fields, permissions, pipeline rules and integrations.' },
      { name: 'Lead intake routing', detail: 'Connect authorized forms, calls and messages with reliable deduplication.' },
      { name: 'Follow-up automation', detail: 'Implement consent-aware reminders, assignments and sequences.' },
      { name: 'Booking workflows', detail: 'Synchronize supported calendars, appointments and follow-up events.' },
      { name: 'Sales reporting', detail: 'Define funnel stages, attribution fields and performance views.' },
      { name: 'Data hygiene', detail: 'Validate identifiers, field formats and update permissions.' },
    ],
    outcomes: ['Reduce delayed lead response', 'Improve pipeline data quality', 'Give sales teams more consistent processes'],
    approach: ['Map the complete lead-to-client journey', 'Audit data and integration constraints', 'Introduce automation with validation and visibility'],
    faqs: [
      { question: 'Which CRMs do you work with?', answer: 'Work can be scoped for CRMs such as GoHighLevel, HubSpot and other platforms with suitable access and integration capabilities.' },
      { question: 'Can different lead sources feed one pipeline?', answer: 'Often yes, provided each source supplies usable identifiers and you define attribution and duplicate-handling rules.' },
      { question: 'Can an AI assistant update our CRM?', answer: 'Yes, with carefully restricted tools, validation and authorization. Sensitive records should not be modified by an unrestricted agent.' },
    ],
  },
  {
    slug: 'ai-search-optimization', name: 'AI Search Optimization', shortName: 'AI Search Optimization',
    blurb: 'Make your expertise clear to people, search engines and AI-assisted discovery.',
    description: 'Technical SEO, answer-focused content architecture and AI search readiness grounded in authoritative search engine guidance.',
    keyword: 'AI search optimization, AEO and GEO services',
    whatItIs: 'AI search optimization strengthens discoverability and comprehension across classic search and AI-assisted results. It starts with accessible pages, useful original answers, consistent business information and evidence of genuine expertise, not shortcuts promising AI citations.',
    audience: 'B2B service providers with valuable expertise but weak organic visibility or confusing website content.',
    problems: ['Important services have no dedicated crawlable pages', 'Unclear or repetitive explanations across service URLs', 'Content lacks distinct evidence and useful answers', 'Search performance cannot be interpreted reliably'],
    deliverables: [
      { name: 'Crawl & indexability audit', detail: 'Review server HTML, internal links, canonicals, robots rules and sitemap coverage.' },
      { name: 'Intent & entity mapping', detail: 'Organize business topics by audience, problem and search intent.' },
      { name: 'Service page optimization', detail: 'Write clear answers, specifics, trust cues and conversion paths.' },
      { name: 'Structured data', detail: 'Add supported, truthful Organization, Service and breadcrumb context.' },
      { name: 'Original content strategy', detail: 'Prioritize case studies, explainers and first-party examples worth citing.' },
      { name: 'Measurement', detail: 'Define baseline queries, indexed pages, leads and AI-search reporting where available.' },
    ],
    outcomes: ['Improve crawlability and service clarity', 'Build topic authority with substantive content', 'Measure visibility and qualified enquiries'],
    approach: ['Confirm baseline technical health and search demand', 'Publish useful, non-duplicative pages with evidence', 'Measure, revise and improve based on real search data'],
    faqs: [
      { question: 'Does GEO guarantee citations in AI answers?', answer: 'No. Search and AI systems choose sources independently. The objective is to make content technically accessible, trustworthy and genuinely useful.' },
      { question: 'Do we need a special AI sitemap or llms.txt?', answer: 'Google does not require special AI markup or llms.txt for AI Overviews and AI Mode. Standard technical SEO remains foundational.' },
      { question: 'What is the difference between SEO, AEO and GEO?', answer: 'SEO covers search visibility broadly. AEO emphasizes useful, direct answers. GEO commonly refers to visibility in generative AI experiences; substantial technical and content practices overlap.' },
    ],
  },
  {
    slug: 'digital-marketing-growth', name: 'Digital Marketing & Growth', shortName: 'Digital Marketing',
    blurb: 'Build measurable acquisition journeys that connect campaigns with revenue.',
    description: 'SEO, performance marketing strategy, conversion optimization and marketing automation for service businesses and software companies.',
    keyword: 'digital marketing and growth automation services',
    whatItIs: 'Digital marketing combines audience research, channel strategy, conversion-oriented experiences and credible measurement. Technology and automation support the process, but a clear message and a real customer problem come first.',
    audience: 'Businesses seeking more qualified enquiries from organic search, campaigns and integrated lifecycle marketing.',
    problems: ['Traffic without qualified enquiries', 'Weak landing pages or conversion paths', 'Campaign data disconnected from CRM', 'Unclear channel attribution and inconsistent follow-up'],
    deliverables: [
      { name: 'Growth & messaging audit', detail: 'Examine audience, value proposition, conversion points and current metrics.' },
      { name: 'Search strategy', detail: 'Coordinate technical SEO, topical content and local considerations where relevant.' },
      { name: 'Landing pages', detail: 'Develop fast, responsive pages matched to specific campaign intent.' },
      { name: 'Conversion optimization', detail: 'Improve forms, navigation, trust signals and contact journeys.' },
      { name: 'Campaign tracking', detail: 'Design ethical analytics, conversion events and attribution boundaries.' },
      { name: 'Marketing automation', detail: 'Connect approved campaigns with CRM workflows and reporting.' },
    ],
    outcomes: ['Strengthen the path from visitor to enquiry', 'Improve visibility into acquisition performance', 'Connect marketing work with operational follow-up'],
    approach: ['Define audience, proposition and measurable goals', 'Fix tracking and conversion fundamentals', 'Test improvements and invest according to observed results'],
    faqs: [
      { question: 'Do you offer both SEO and paid marketing?', answer: 'The service strategy can cover organic search, paid acquisition and conversion journeys. Specific channels and management scope are agreed during discovery.' },
      { question: 'Can we track leads into the CRM?', answer: 'Yes when CRM, analytics and consent setup permit reliable tracking. Attribution remains an estimate in some multi-device and privacy-limited journeys.' },
      { question: 'When should we expect results?', answer: 'Timing varies by channel, competition, starting point and investment. No reputable strategy can guarantee a specific ranking or lead volume.' },
    ],
  },
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s])) as Record<string, Service>;
