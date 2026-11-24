/** Concrete operations shown by the service illustrations, separate from delivery phases. */
export const SERVICE_VISUALS: Record<string, { motif: string; description: string; steps: readonly string[] }> = {
  'conversational-voice-ai': {
    motif: 'voice-conversation',
    description: 'A microphone receives speech, a conversation is transcribed and its context reaches a booking handoff.',
    steps: ['Hear the request', 'Understand intent', 'Book or hand off'],
  },
  'ai-agents-intelligent-automation': {
    motif: 'automation-workcell',
    description: 'A mechanical workcell carries an approved task to its business-system output while keeping exceptions in a review lane.',
    steps: ['Receive a task', 'Use approved tools', 'Route exceptions'],
  },
  'generative-ai-ml-engineering': {
    motif: 'model-evaluation',
    description: 'An evaluation apparatus processes examples into text, image and code outputs, with a separate quality gate.',
    steps: ['Prepare examples', 'Generate & evaluate', 'Serve the model'],
  },
  'rag-data-business-intelligence': {
    motif: 'source-retrieval',
    description: 'An archive and source lens select an approved passage and connect its citation to an answer and reporting display.',
    steps: ['Index sources', 'Retrieve evidence', 'Cite the answer'],
  },
  'custom-software-web-apps': {
    motif: 'application-workflow',
    description: 'A laptop application sends an API request through its data layer and receives a matching record on a mobile client.',
    steps: ['Build the interface', 'Connect API & data', 'Release the app'],
  },
  'saas-ai-product-development': {
    motif: 'tenant-product',
    description: 'Separate customer workspaces connect to a shared product core, AI capability, billing and usage reporting.',
    steps: ['Separate tenants', 'Connect product modules', 'Release & observe'],
  },
  'crm-revenue-automation': {
    motif: 'lead-routing',
    description: 'A lead record passes through classification into an owner’s pipeline, with a scheduled follow-up and reporting.',
    steps: ['Capture a lead', 'Assign an owner', 'Schedule follow-up'],
  },
  'ai-search-optimization': {
    motif: 'structured-search',
    description: 'A crawler lens inspects a web page, its structured data and evidence before a source-linked search preview appears.',
    steps: ['Inspect the page', 'Structure evidence', 'Check search readiness'],
  },
  'digital-marketing-growth': {
    motif: 'campaign-attribution',
    description: 'A campaign megaphone connects a message to its audience, an enquiry and an attribution display.',
    steps: ['Activate a campaign', 'Track enquiries', 'Connect follow-up'],
  },
};
