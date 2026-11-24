/** Original practical examples. These are possibilities, NOT claimed completed case studies. */
export const serviceExtensions: Record<string, {
  useCases: { name: string; detail: string }[];
  related: string[];
  request: string;
}> = {
  'ai-agents-intelligent-automation': {
    useCases: [
      { name: 'Multi-step intake and triage', detail: 'Receive a request, validate required fields, classify its type, update the right record and flag ambiguous cases for a person.' },
      { name: 'Back-office process automation', detail: 'Move approved data between email, forms, cloud files and business applications with retries and change logs.' },
      { name: 'Internal task assistants', detail: 'Use an authorized agent to retrieve context, prepare a draft or invoke restricted business actions with approvals.' },
    ],
    related: ['crm-revenue-automation','rag-data-business-intelligence','conversational-voice-ai'], request: 'Automate a business workflow',
  },
  'generative-ai-ml-engineering': {
    useCases: [
      { name: 'Document understanding', detail: 'Extract and validate structured information from variable documents while retaining a review path.' },
      { name: 'AI-assisted product features', detail: 'Add text generation, classification, summaries or multimodal processing with versioned evaluation sets.' },
      { name: 'Model quality and cost controls', detail: 'Compare approaches using representative cases, latency constraints, accuracy thresholds and usage budgets.' },
    ],
    related: ['saas-ai-product-development','rag-data-business-intelligence','ai-agents-intelligent-automation'], request: 'Develop an AI capability',
  },
  'conversational-voice-ai': {
    useCases: [
      { name: 'Reception and first response', detail: 'Handle initial questions, capture contact details and route conversations when a human should intervene.' },
      { name: 'Appointment workflows', detail: 'Connect live availability checks and scheduling rules with a CRM and confirmation process.' },
      { name: 'Knowledge-aware support', detail: 'Answer permitted questions using approved content and clearly escalate uncertain or high-stakes requests.' },
    ],
    related: ['crm-revenue-automation','ai-agents-intelligent-automation','rag-data-business-intelligence'], request: 'Create a conversational or voice AI assistant',
  },
  'rag-data-business-intelligence': {
    useCases: [
      { name: 'Internal knowledge retrieval', detail: 'Search authorized policies, contracts, files and procedures with links back to relevant sources.' },
      { name: 'Operational analytics', detail: 'Consolidate relevant event and CRM data into a reporting layer with defined metrics and access rules.' },
      { name: 'Data-assisted support', detail: 'Retrieve current reference information before drafting responses that staff can verify.' },
    ],
    related: ['generative-ai-ml-engineering','ai-agents-intelligent-automation','custom-software-web-apps'], request: 'Build RAG or data integration',
  },
  'custom-software-web-apps': {
    useCases: [
      { name: 'Customer and partner portals', detail: 'Build permission-aware dashboards, submission workflows and status views around a real business process.' },
      { name: 'Internal operations tools', detail: 'Replace fragile spreadsheets and manual handoffs with focused applications and API connections.' },
      { name: 'Legacy system extensions', detail: 'Connect an existing platform to modern interfaces or automation layers without unnecessary replacement.' },
    ],
    related: ['saas-ai-product-development','crm-revenue-automation','generative-ai-ml-engineering'], request: 'Build custom software',
  },
  'saas-ai-product-development': {
    useCases: [
      { name: 'B2B SaaS MVP', detail: 'Define the first user journey, permissions, billing dependencies and must-have features before scaling scope.' },
      { name: 'AI-enabled subscription app', detail: 'Integrate a narrowly scoped AI workflow with usage controls, observability and customer access rules.' },
      { name: 'Product platform modernization', detail: 'Assess which user flows and application boundaries can be simplified or improved incrementally.' },
    ],
    related: ['custom-software-web-apps','generative-ai-ml-engineering','rag-data-business-intelligence'], request: 'Launch or improve a SaaS product',
  },
  'crm-revenue-automation': {
    useCases: [
      { name: 'Lead-to-appointment pipeline', detail: 'Combine lead capture, identity matching, ownership rules, booking events and follow-up.' },
      { name: 'CRM data synchronization', detail: 'Map fields and change events across supported platforms while handling duplicate records and API failures.' },
      { name: 'Sales operations visibility', detail: 'Create agreed pipeline definitions and reporting events for response time, status and conversion tracking.' },
    ],
    related: ['ai-agents-intelligent-automation','conversational-voice-ai','digital-marketing-growth'], request: 'Improve CRM and sales workflows',
  },
  'ai-search-optimization': {
    useCases: [
      { name: 'Technical search foundation', detail: 'Audit indexability, initial HTML, canonicals, crawl paths, site structure and page metadata.' },
      { name: 'Answer-focused service content', detail: 'Explain real capabilities, common buying questions and evidence in easily understood pages.' },
      { name: 'Search and AI visibility measurement', detail: 'Connect search performance reporting to qualified enquiries and adjust based on actual data.' },
    ],
    related: ['digital-marketing-growth','custom-software-web-apps','crm-revenue-automation'], request: 'Improve SEO, AEO and GEO readiness',
  },
  'digital-marketing-growth': {
    useCases: [
      { name: 'Digital acquisition strategy', detail: 'Align audience, offer, channel selection and campaign landing pages to measurable customer actions.' },
      { name: 'Conversion and attribution', detail: 'Connect consent-aware tracking, form leads and CRM outcomes to understand which activity creates useful demand.' },
      { name: 'Marketing workflow automation', detail: 'Automate appropriate lead qualification, lifecycle updates and performance reporting across connected tools.' },
    ],
    related: ['ai-search-optimization','crm-revenue-automation','custom-software-web-apps'], request: 'Improve digital growth',
  },
};
