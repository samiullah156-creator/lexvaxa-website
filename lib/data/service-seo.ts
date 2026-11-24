/** Editorial search intent, NOT measured keyword demand. Titles must be refined using Search Console data. */
export const serviceSeo: Record<string, { title: string; description: string; guide?: { href: string; title: string } }> = {
  'ai-agents-intelligent-automation': {
    title: 'Custom AI Agents & Workflow Automation Services',
    description: 'Build AI agents, n8n and Make workflows, API integrations and supervised business automation tailored to your operations.',
    guide: { href: '/insights/ai-agent-vs-workflow-automation', title: 'AI agent vs. workflow automation: how to choose' },
  },
  'generative-ai-ml-engineering': {
    title: 'Generative AI Development & ML Engineering',
    description: 'Explore custom generative AI applications, model evaluation, machine learning integration and production AI engineering.',
    guide: { href: '/insights/rag-vs-fine-tuning', title: 'RAG vs. fine-tuning: which fits the requirement?' },
  },
  'conversational-voice-ai': {
    title: 'AI Voice Agents & Conversational AI Development',
    description: 'Develop conversational and voice AI for customer interactions, scheduling, qualification and CRM-connected workflows.',
  },
  'rag-data-business-intelligence': {
    title: 'RAG Development, Data & Business Intelligence',
    description: 'Build permission-aware retrieval applications, business knowledge search, data integrations and practical reporting systems.',
    guide: { href: '/insights/rag-vs-fine-tuning', title: 'Understanding RAG vs. fine-tuning' },
  },
  'custom-software-web-apps': {
    title: 'Custom Software & Web Application Development',
    description: 'Design and develop web applications, internal business tools, customer portals and API integrations tailored to your process.',
  },
  'saas-ai-product-development': {
    title: 'SaaS MVP & AI Product Development Services',
    description: 'Plan and build SaaS MVPs, AI-powered products, subscription workflows and scalable web applications with clear milestones.',
  },
  'crm-revenue-automation': {
    title: 'CRM Automation, Integrations & Sales Workflows',
    description: 'Connect lead capture, follow-ups, calendars, calls and CRM data through reliable sales and service automation.',
    guide: { href: '/insights/ai-agent-vs-workflow-automation', title: 'When to use AI in a workflow' },
  },
  'ai-search-optimization': {
    title: 'AI Search Optimization, Technical SEO & GEO',
    description: 'Technical SEO, clear service content, source evidence and measurement for search and AI-assisted discovery. Explore practical AEO and GEO work.',
    guide: { href: '/insights/seo-aeo-geo-service-businesses', title: 'SEO, AEO and GEO: the practical differences' },
  },
  'digital-marketing-growth': {
    title: 'Digital Marketing, SEO & Marketing Automation',
    description: 'Connect digital acquisition, landing pages, marketing workflows and CRM attribution into a measurable growth strategy.',
    guide: { href: '/insights/seo-aeo-geo-service-businesses', title: 'How search and AI discovery fit into growth' },
  },
};
