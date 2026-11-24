// Permanent redirects from the previous lexvaxa.com (Vite site) URLs that Google already indexed.
// Each old page points at the closest current page, so search traffic and links are not lost to 404s.
// Project URLs (/work/<slug>) kept their slugs and need no redirect.

const oldServices: Record<string, string> = {
  'ai-calling-agents': 'conversational-voice-ai',
  'ai-chatbots': 'conversational-voice-ai',
  'ai-receptionist': 'conversational-voice-ai',
  'ai-content-automation': 'generative-ai-ml-engineering',
  'ai-systems': 'generative-ai-ml-engineering',
  'ai-workflow-agents': 'ai-agents-intelligent-automation',
  'business-automation': 'ai-agents-intelligent-automation',
  'no-code-solutions': 'ai-agents-intelligent-automation',
  'api-integration': 'custom-software-web-apps',
  'custom-software': 'custom-software-web-apps',
  'web-app-dev': 'custom-software-web-apps',
  'ecommerce-solutions': 'custom-software-web-apps',
  'mobile-solutions': 'custom-software-web-apps',
  'crm-systems': 'crm-revenue-automation',
  'dashboards-bi': 'rag-data-business-intelligence',
  'digital-marketing': 'digital-marketing-growth',
  'saas-development': 'saas-ai-product-development',
};

// Old blog posts with a matching current guide; every other old post lands on /insights.
const oldPosts: Record<string, string> = {
  'rag-vs-fine-tuning-guide': 'rag-vs-fine-tuning',
  'rag-powered-chatbots-guide': 'rag-vs-fine-tuning',
  'build-vs-buy-decision-framework': 'custom-software-vs-saas',
  'no-code-vs-custom-code-comparison': 'custom-software-vs-saas',
  '10-business-processes-to-automate': 'ai-agent-vs-workflow-automation',
  'agentic-era-ai-agents-workflows': 'ai-agent-vs-workflow-automation',
  'building-first-ai-agent-crew': 'ai-agent-vs-workflow-automation',
  'crewai-vs-autogen-comparison': 'ai-agent-vs-workflow-automation',
  'multi-agent-ai-systems-crewai': 'ai-agent-vs-workflow-automation',
  'zapier-vs-make-vs-n8n-comparison': 'ai-agent-vs-workflow-automation',
  '10x-cold-calling-ai-agents': 'ai-voice-agents-customer-support',
  'ai-calling-agents-future-sales': 'ai-voice-agents-customer-support',
  'ai-chatbots-reducing-support-costs': 'ai-voice-agents-customer-support',
  'ai-receptionist-medical-practices': 'ai-voice-agents-customer-support',
  'ai-receptionist-vs-answering-service': 'ai-voice-agents-customer-support',
  'small-business-ai-receptionist-2025': 'ai-voice-agents-customer-support',
  'vapi-vs-bland-ai-comparison': 'ai-voice-agents-customer-support',
  'whatsapp-ai-assistant-guide': 'ai-voice-agents-customer-support',
  'automated-sales-pipeline-guide': 'crm-automation-lead-management',
  'crm-data-hygiene-guide': 'crm-automation-lead-management',
  'hubspot-vs-salesforce-comparison': 'crm-automation-lead-management',
  'core-web-vitals-optimization': 'seo-aeo-geo-service-businesses',
  'content-marketing-flywheel-guide': 'seo-aeo-geo-service-businesses',
  'seo-strategy-saas-2025': 'seo-aeo-geo-service-businesses',
};

type Redirect = { source: string; destination: string; permanent: true };

export const legacyRedirects: Redirect[] = [
  ...Object.entries(oldServices).map(([from, to]) => ({ source: `/services/${from}`, destination: `/services/${to}`, permanent: true as const })),
  { source: '/services/it-consulting', destination: '/services', permanent: true },
  ...Object.entries(oldPosts).map(([from, to]) => ({ source: `/blog/${from}`, destination: `/insights/${to}`, permanent: true as const })),
  { source: '/blog', destination: '/insights', permanent: true },
  { source: '/blog/:slug*', destination: '/insights', permanent: true },
];
