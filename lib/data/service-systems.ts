/**
 * One engineered-system description per service. The hero, the homepage
 * explorer and each service page render from this data, so a service's
 * modules, connections, connected capabilities and delivery story stay aligned.
 *
 * Coordinates are floor-grid units on the shared system plate (x: 0–7, y: 0–3).
 * `stage` is assembly order; a connection appears once both ends are built.
 */

export type ModuleKind = 'box' | 'tower' | 'cylinder' | 'panel' | 'slab';
export type ModuleIcon =
  | 'bolt' | 'chip' | 'gear' | 'nodes' | 'doc' | 'check' | 'shield' | 'api' | 'phone' | 'wave'
  | 'funnel' | 'search' | 'target' | 'chart' | 'code' | 'layers' | 'clock' | 'cloud' | 'branch'
  | 'mail' | 'card' | 'grid' | 'eye';
export type PanelScreen = 'ui' | 'chart' | 'wave' | 'answer' | 'pipeline' | 'page';

export type SystemNode = {
  id: string;
  label: string;
  kind: ModuleKind;
  icon?: ModuleIcon;
  screen?: PanelScreen;
  x: number;
  y: number;
  stage: number;
  accent?: 'blue' | 'purple';
  labelAt?: 'top' | 'bottom' | 'left';
};

export type SystemLink = { from: string; to: string };

export type DiagramState = {
  /** Show planned modules as dashed outlines before they are built. */
  ghost: boolean;
  /** Modules with stage <= built are solid. */
  built: number;
  /** Connections whose endpoints are both <= linked are drawn. */
  linked: number;
  verified: boolean;
  live: boolean;
  monitor: boolean;
  focus: readonly string[];
};

export type StoryStep = {
  title: string;
  detail: string;
  output: string;
  state: Partial<DiagramState>;
};

export type ServiceSystem = {
  slug: string;
  token: string;
  phrase: string;
  /** One-sentence explanation shown with the service in focus. */
  summary: string;
  chain: readonly string[];
  nodes: readonly SystemNode[];
  links: readonly SystemLink[];
  monitorLabel: string;
  story: readonly StoryStep[];
};

export const EMPTY_STATE: DiagramState = { ghost: false, built: 0, linked: 0, verified: false, live: false, monitor: false, focus: [] };
export const COMPLETE_STATE: DiagramState = { ghost: false, built: 99, linked: 99, verified: false, live: true, monitor: false, focus: [] };

/** Story steps describe changes; each step inherits everything before it. */
export function storyState(system: ServiceSystem, through: number): DiagramState {
  let state: DiagramState = EMPTY_STATE;
  system.story.slice(0, Math.max(0, through + 1)).forEach((step) => {
    state = { ...state, ...step.state, focus: step.state.focus ?? [] };
  });
  return state;
}

export const maxStage = (system: ServiceSystem) => Math.max(...system.nodes.map((node) => node.stage));

const connectAll = { linked: 99 } as const;

export const SERVICE_SYSTEMS: Record<string, ServiceSystem> = {
  'conversational-voice-ai': {
    slug: 'conversational-voice-ai',
    token: 'Voice AI',
    phrase: 'conversations',
    summary: 'Turn conversations into useful actions, with the context your team needs when a person takes over.',
    chain: ['Voice AI', 'AI Agents', 'Automation', 'CRM'],
    monitorLabel: 'Call quality',
    nodes: [
      { id: 'call', label: 'Inbound call', kind: 'box', icon: 'phone', x: 0.2, y: 1.3, stage: 1 },
      { id: 'speech', label: 'Speech to text', kind: 'panel', screen: 'wave', x: 2.0, y: 0.2, stage: 2 },
      { id: 'core', label: 'Dialogue engine', kind: 'tower', icon: 'chip', x: 2.6, y: 1.7, stage: 3, accent: 'purple' },
      { id: 'knowledge', label: 'Approved knowledge', kind: 'cylinder', x: 4.5, y: 0.4, stage: 4 },
      { id: 'voice', label: 'Voice response', kind: 'box', icon: 'wave', x: 4.7, y: 2.3, stage: 4 },
      { id: 'crm', label: 'CRM & booking', kind: 'panel', screen: 'ui', x: 6.4, y: 1.3, stage: 5 },
    ],
    links: [
      { from: 'call', to: 'speech' }, { from: 'speech', to: 'core' }, { from: 'knowledge', to: 'core' },
      { from: 'core', to: 'voice' }, { from: 'core', to: 'crm' },
    ],
    story: [
      { title: 'Call discovery', detail: 'Review real calls: why people ring, what they need and when a person must take over.', output: 'Conversation map', state: { built: 1, focus: ['call'] } },
      { title: 'Conversation design', detail: 'Define disclosure, call paths, tone and every escalation route before any voice is generated.', output: 'Call flows & rules', state: { ghost: true, focus: ['core'] } },
      { title: 'Speech layer', detail: 'Configure speech recognition for your accents, vocabulary and line quality.', output: 'Transcription setup', state: { built: 2, focus: ['speech'] } },
      { title: 'Dialogue engine', detail: 'Build the reasoning that understands intent, asks follow-up questions and keeps context.', output: 'Dialogue logic', state: { built: 3, focus: ['core'] } },
      { title: 'Knowledge & voice', detail: 'Attach only approved answers and a natural voice that confirms details back to the caller.', output: 'Grounded responses', state: { built: 4, focus: ['knowledge', 'voice'] } },
      { title: 'CRM & calendar', detail: 'Connect booking and CRM actions so every call ends with a record your team can use.', output: 'Integrated actions', state: { built: 5, ...connectAll, focus: ['crm'] } },
      { title: 'Live-call testing', detail: 'Test interruptions, accents, silence and edge cases. Fix the failure paths, not just the happy path.', output: 'Test report', state: { verified: true, focus: [] } },
      { title: 'Launch & monitoring', detail: 'Go live on a controlled share of calls, review transcripts and widen coverage with evidence.', output: 'Monitored launch', state: { verified: false, live: true, monitor: true, focus: ['crm'] } },
    ],
  },
  'ai-agents-intelligent-automation': {
    slug: 'ai-agents-intelligent-automation',
    token: 'AI Agents',
    phrase: 'workflows',
    summary: 'Connect your business tools, automate repeatable work and keep uncertain decisions with your team.',
    chain: ['Request', 'AI Agents', 'Tools & APIs', 'Business system'],
    monitorLabel: 'Exceptions',
    nodes: [
      { id: 'task', label: 'Task intake', kind: 'box', icon: 'bolt', x: 0.2, y: 1.2, stage: 1 },
      { id: 'context', label: 'Context & memory', kind: 'cylinder', x: 2.0, y: 0.1, stage: 2 },
      { id: 'agent', label: 'Reasoning agent', kind: 'tower', icon: 'nodes', x: 2.5, y: 1.6, stage: 3, accent: 'purple' },
      { id: 'tools', label: 'Approved tools', kind: 'box', icon: 'api', x: 4.4, y: 0.5, stage: 4 },
      { id: 'review', label: 'Human approval', kind: 'box', icon: 'shield', x: 4.6, y: 2.3, stage: 5, accent: 'purple' },
      { id: 'system', label: 'CRM / ERP', kind: 'panel', screen: 'ui', x: 6.4, y: 1.2, stage: 4 },
    ],
    links: [
      { from: 'task', to: 'agent' }, { from: 'context', to: 'agent' }, { from: 'agent', to: 'tools' },
      { from: 'tools', to: 'system' }, { from: 'agent', to: 'review' }, { from: 'review', to: 'system' },
    ],
    story: [
      { title: 'Process discovery', detail: 'Map one real workflow: its inputs, decisions, owners and where an error is expensive.', output: 'Process map', state: { built: 1, focus: ['task'] } },
      { title: 'Automation architecture', detail: 'Decide step by step what stays deterministic and where an AI agent genuinely adds value.', output: 'System blueprint', state: { ghost: true, focus: ['agent'] } },
      { title: 'Context & permissions', detail: 'Connect the information the agent may use, with access limited to what each task needs.', output: 'Scoped data access', state: { built: 2, focus: ['context'] } },
      { title: 'Agent engineering', detail: 'Build the reasoning loop: interpret the task, plan, choose an approved tool and record why.', output: 'Working agent', state: { built: 3, focus: ['agent'] } },
      { title: 'Tool integration', detail: 'Wire APIs, CRM and ERP actions with validation on every write.', output: 'Integrated tools', state: { built: 4, ...connectAll, focus: ['tools', 'system'] } },
      { title: 'Human approval', detail: 'Route consequential or uncertain actions to a person, with the context needed to decide quickly.', output: 'Approval path', state: { built: 5, focus: ['review'] } },
      { title: 'Scenario testing', detail: 'Replay real cases, incomplete data and failures. Every action must be explainable and reversible.', output: 'Test evidence', state: { verified: true } },
      { title: 'Deployment & monitoring', detail: 'Release with logs, alerts and retries, then expand the automation as confidence grows.', output: 'Monitored workflow', state: { verified: false, live: true, monitor: true, focus: ['system'] } },
    ],
  },
  'custom-software-web-apps': {
    slug: 'custom-software-web-apps',
    token: 'Custom Software',
    phrase: 'systems',
    summary: 'Build applications, portals and integrations around the way your business actually works.',
    chain: ['Web app', 'APIs', 'Integrations', 'Your systems'],
    monitorLabel: 'Uptime & errors',
    nodes: [
      { id: 'brief', label: 'Requirements', kind: 'box', icon: 'doc', x: 0.2, y: 1.3, stage: 1 },
      { id: 'frontend', label: 'Web interface', kind: 'panel', screen: 'ui', x: 2.1, y: 0.2, stage: 2 },
      { id: 'api', label: 'Backend & API', kind: 'tower', icon: 'code', x: 2.6, y: 1.7, stage: 3, accent: 'purple' },
      { id: 'db', label: 'Database', kind: 'cylinder', x: 4.4, y: 0.4, stage: 3 },
      { id: 'auth', label: 'Auth & security', kind: 'box', icon: 'shield', x: 4.7, y: 2.3, stage: 4 },
      { id: 'deploy', label: 'Cloud deployment', kind: 'box', icon: 'cloud', x: 6.4, y: 1.3, stage: 5 },
    ],
    links: [
      { from: 'brief', to: 'frontend' }, { from: 'frontend', to: 'api' }, { from: 'api', to: 'db' },
      { from: 'api', to: 'auth' }, { from: 'api', to: 'deploy' },
    ],
    story: [
      { title: 'Discovery', detail: 'Understand the users, the workflow the software must support and what “done” means.', output: 'Validated scope', state: { built: 1, focus: ['brief'] } },
      { title: 'Architecture', detail: 'Design the data model, routes, integrations and access boundaries before writing features.', output: 'Technical design', state: { ghost: true, focus: ['api'] } },
      { title: 'Interface', detail: 'Build the screens people use every day, tested against the real workflow.', output: 'Usable interface', state: { built: 2, focus: ['frontend'] } },
      { title: 'Backend & data', detail: 'Implement business logic, APIs and a database structured for the reports you will need.', output: 'Core services', state: { built: 3, focus: ['api', 'db'] } },
      { title: 'Security', detail: 'Add authentication, roles and audit trails so each person sees only what they should.', output: 'Access control', state: { built: 4, focus: ['auth'] } },
      { title: 'Integration', detail: 'Connect the application to your existing tools through stable, documented APIs.', output: 'Connected system', state: { built: 5, ...connectAll, focus: ['deploy'] } },
      { title: 'Testing', detail: 'Automated and acceptance tests on every increment, including permissions and failure cases.', output: 'Release candidate', state: { verified: true } },
      { title: 'Deployment & support', detail: 'Ship to production with monitoring, backups and a clear owner for every component.', output: 'Live application', state: { verified: false, live: true, monitor: true, focus: ['deploy'] } },
    ],
  },
  'generative-ai-ml-engineering': {
    slug: 'generative-ai-ml-engineering',
    token: 'Generative AI',
    phrase: 'decisions',
    summary: 'Build useful AI features with representative evaluations and a clear path from experiment to production.',
    chain: ['Data', 'Generative AI', 'Evaluation', 'Product'],
    monitorLabel: 'Quality & cost',
    nodes: [
      { id: 'samples', label: 'Data & examples', kind: 'box', icon: 'layers', x: 0.2, y: 1.3, stage: 1 },
      { id: 'pipeline', label: 'Data pipeline', kind: 'box', icon: 'gear', x: 2.1, y: 0.3, stage: 2 },
      { id: 'model', label: 'Model core', kind: 'tower', icon: 'chip', x: 2.7, y: 1.8, stage: 3, accent: 'purple' },
      { id: 'evals', label: 'Evaluation suite', kind: 'panel', screen: 'chart', x: 4.5, y: 0.5, stage: 4 },
      { id: 'guard', label: 'Guardrails', kind: 'box', icon: 'shield', x: 4.8, y: 2.3, stage: 4 },
      { id: 'prod', label: 'Production API', kind: 'box', icon: 'api', x: 6.4, y: 1.3, stage: 5 },
    ],
    links: [
      { from: 'samples', to: 'pipeline' }, { from: 'pipeline', to: 'model' }, { from: 'model', to: 'evals' },
      { from: 'model', to: 'guard' }, { from: 'evals', to: 'prod' }, { from: 'guard', to: 'prod' },
    ],
    story: [
      { title: 'Use-case definition', detail: 'Agree the task, a baseline and measurable acceptance criteria before choosing any model.', output: 'Success criteria', state: { built: 1, focus: ['samples'] } },
      { title: 'Representative data', detail: 'Collect real examples, including the difficult ones, and prepare them through a repeatable pipeline.', output: 'Evaluation dataset', state: { built: 2, focus: ['pipeline'] } },
      { title: 'Model architecture', detail: 'Compare prompting, retrieval and fine-tuning against quality, latency, privacy and cost.', output: 'Architecture decision', state: { ghost: true, built: 3, focus: ['model'] } },
      { title: 'Evaluation & guardrails', detail: 'Build regression tests and output checks so every change is measured, not guessed.', output: 'Eval harness', state: { built: 4, focus: ['evals', 'guard'] } },
      { title: 'Productionise', detail: 'Wrap the model in a versioned API with fallbacks, rate limits and cost controls.', output: 'Production service', state: { built: 5, ...connectAll, focus: ['prod'] } },
      { title: 'Validation', detail: 'Run the full evaluation suite and review failures with your domain experts.', output: 'Signed-off quality', state: { verified: true } },
      { title: 'Observe & improve', detail: 'Track quality, latency and spend in production, and feed new failures back into the tests.', output: 'Measured AI feature', state: { verified: false, live: true, monitor: true, focus: ['evals'] } },
    ],
  },
  'rag-data-business-intelligence': {
    slug: 'rag-data-business-intelligence',
    token: 'Data & RAG',
    phrase: 'knowledge',
    summary: 'Connect scattered knowledge to source-linked answers and operational reporting your team can inspect.',
    chain: ['Documents', 'Retrieval', 'Cited answers', 'Dashboards'],
    monitorLabel: 'Answer accuracy',
    nodes: [
      { id: 'sources', label: 'Documents & data', kind: 'box', icon: 'doc', x: 0.2, y: 1.2, stage: 1 },
      { id: 'warehouse', label: 'Data sources', kind: 'cylinder', x: 1.9, y: 0.1, stage: 1 },
      { id: 'index', label: 'Index & permissions', kind: 'tower', icon: 'layers', x: 2.6, y: 1.7, stage: 2, accent: 'purple' },
      { id: 'retrieve', label: 'Retrieval', kind: 'box', icon: 'search', x: 4.4, y: 0.5, stage: 3 },
      { id: 'answer', label: 'Cited answers', kind: 'panel', screen: 'answer', x: 4.7, y: 2.3, stage: 4 },
      { id: 'bi', label: 'BI dashboard', kind: 'panel', screen: 'chart', x: 6.4, y: 1.2, stage: 4 },
    ],
    links: [
      { from: 'sources', to: 'index' }, { from: 'warehouse', to: 'index' }, { from: 'index', to: 'retrieve' },
      { from: 'retrieve', to: 'answer' }, { from: 'retrieve', to: 'bi' },
    ],
    story: [
      { title: 'Source inventory', detail: 'List where knowledge lives, who owns it and who is allowed to see it.', output: 'Source & permission map', state: { built: 1, focus: ['sources', 'warehouse'] } },
      { title: 'Retrieval architecture', detail: 'Choose chunking, indexing and search strategy for your content, not a generic template.', output: 'Retrieval design', state: { ghost: true, focus: ['index'] } },
      { title: 'Ingestion & indexing', detail: 'Build pipelines that keep the index current and carry access rules with every document.', output: 'Permission-aware index', state: { built: 2, focus: ['index'] } },
      { title: 'Retrieval & ranking', detail: 'Tune search so the right passages surface first for real questions from your team.', output: 'Ranked evidence', state: { built: 3, focus: ['retrieve'] } },
      { title: 'Answers & reporting', detail: 'Generate answers that cite their sources, and dashboards built on agreed metric definitions.', output: 'Cited answers & BI', state: { built: 4, ...connectAll, focus: ['answer', 'bi'] } },
      { title: 'Accuracy testing', detail: 'Score answers against a reviewed question set and check that restricted content stays restricted.', output: 'Accuracy baseline', state: { verified: true } },
      { title: 'Rollout & monitoring', detail: 'Launch to a team, collect feedback on answers and keep improving retrieval quality.', output: 'Trusted knowledge system', state: { verified: false, live: true, monitor: true, focus: ['answer'] } },
    ],
  },
  'crm-revenue-automation': {
    slug: 'crm-revenue-automation',
    token: 'CRM Automation',
    phrase: 'operations',
    summary: 'Connect lead intake, ownership and follow-up so the next step stays clear across your customer journey.',
    chain: ['Lead capture', 'Automation', 'CRM', 'Revenue reports'],
    monitorLabel: 'Pipeline health',
    nodes: [
      { id: 'leads', label: 'Lead sources', kind: 'box', icon: 'mail', x: 0.2, y: 1.3, stage: 1 },
      { id: 'validate', label: 'Validation', kind: 'box', icon: 'check', x: 2.0, y: 0.3, stage: 2 },
      { id: 'route', label: 'Routing rules', kind: 'tower', icon: 'funnel', x: 2.6, y: 1.7, stage: 3, accent: 'purple' },
      { id: 'crm', label: 'CRM', kind: 'panel', screen: 'pipeline', x: 4.5, y: 0.5, stage: 4 },
      { id: 'follow', label: 'Follow-up', kind: 'box', icon: 'clock', x: 4.8, y: 2.3, stage: 4 },
      { id: 'report', label: 'Revenue reports', kind: 'panel', screen: 'chart', x: 6.4, y: 1.3, stage: 5 },
    ],
    links: [
      { from: 'leads', to: 'validate' }, { from: 'validate', to: 'route' }, { from: 'route', to: 'crm' },
      { from: 'route', to: 'follow' }, { from: 'crm', to: 'report' }, { from: 'follow', to: 'report' },
    ],
    story: [
      { title: 'Journey mapping', detail: 'Trace every step from first enquiry to signed client, including where leads go quiet.', output: 'Lead journey', state: { built: 1, focus: ['leads'] } },
      { title: 'Data audit', detail: 'Check duplicates, missing fields and ownership rules in the CRM you already use.', output: 'Data fixes', state: { built: 2, focus: ['validate'] } },
      { title: 'Routing design', detail: 'Define who owns which lead, how fast they respond and what happens when nobody does.', output: 'Routing rules', state: { ghost: true, built: 3, focus: ['route'] } },
      { title: 'CRM & follow-up', detail: 'Automate record updates, tasks and reminders so the next step is always clear.', output: 'Automated pipeline', state: { built: 4, focus: ['crm', 'follow'] } },
      { title: 'Reporting', detail: 'Connect pipeline stages to reports the sales team and leadership both trust.', output: 'Revenue visibility', state: { built: 5, ...connectAll, focus: ['report'] } },
      { title: 'Validation', detail: 'Run test leads through every path and confirm nothing is lost or double-handled.', output: 'Verified flows', state: { verified: true } },
      { title: 'Launch & refine', detail: 'Go live, watch response times and refine rules with the people who use them.', output: 'Measured follow-up', state: { verified: false, live: true, monitor: true, focus: ['report'] } },
    ],
  },
  'saas-ai-product-development': {
    slug: 'saas-ai-product-development',
    token: 'AI Products',
    phrase: 'customers',
    summary: 'Bring a focused product to life with customer workspaces, subscription flows and room to evolve.',
    chain: ['SaaS platform', 'AI features', 'Billing', 'Analytics'],
    monitorLabel: 'Product usage',
    nodes: [
      { id: 'idea', label: 'Product hypothesis', kind: 'box', icon: 'target', x: 0.2, y: 1.3, stage: 1 },
      { id: 'app', label: 'Product interface', kind: 'panel', screen: 'ui', x: 2.0, y: 0.2, stage: 2 },
      { id: 'core', label: 'Multi-tenant core', kind: 'tower', icon: 'grid', x: 2.6, y: 1.7, stage: 2, accent: 'purple' },
      { id: 'ai', label: 'AI feature', kind: 'box', icon: 'chip', x: 4.4, y: 0.5, stage: 3 },
      { id: 'billing', label: 'Billing & plans', kind: 'box', icon: 'card', x: 4.7, y: 2.3, stage: 4 },
      { id: 'analytics', label: 'Usage analytics', kind: 'panel', screen: 'chart', x: 6.4, y: 1.3, stage: 5 },
    ],
    links: [
      { from: 'idea', to: 'core' }, { from: 'app', to: 'core' }, { from: 'core', to: 'ai' },
      { from: 'core', to: 'billing' }, { from: 'ai', to: 'analytics' }, { from: 'billing', to: 'analytics' },
    ],
    story: [
      { title: 'Product definition', detail: 'Identify the customer, the core job and the smallest version worth paying for.', output: 'MVP scope', state: { built: 1, focus: ['idea'] } },
      { title: 'Platform architecture', detail: 'Design tenancy, roles and data isolation so the product can grow without a rewrite.', output: 'Platform design', state: { ghost: true, focus: ['core'] } },
      { title: 'Core product', detail: 'Build workspaces, onboarding and the main workflow customers will use every day.', output: 'Working product', state: { built: 2, focus: ['app', 'core'] } },
      { title: 'AI capability', detail: 'Add the AI feature that differentiates the product, with evaluations and cost limits.', output: 'Measured AI feature', state: { built: 3, focus: ['ai'] } },
      { title: 'Billing & access', detail: 'Connect subscriptions, plans and entitlements to what each customer can use.', output: 'Monetised product', state: { built: 4, focus: ['billing'] } },
      { title: 'Analytics', detail: 'Instrument activation and usage so roadmap decisions come from evidence.', output: 'Product metrics', state: { built: 5, ...connectAll, focus: ['analytics'] } },
      { title: 'Beta & hardening', detail: 'Release to early customers, fix what they find and harden security and performance.', output: 'Production-ready release', state: { verified: true } },
      { title: 'Launch & iterate', detail: 'Launch publicly, monitor usage and ship improvements in small, safe releases.', output: 'Live SaaS product', state: { verified: false, live: true, monitor: true, focus: ['analytics'] } },
    ],
  },
  'ai-search-optimization': {
    slug: 'ai-search-optimization',
    token: 'AI Search',
    phrase: 'expertise',
    summary: 'Make your expertise accessible, understandable and supported by clear sources across search experiences.',
    chain: ['Expert content', 'Structured data', 'AI search', 'Enquiries'],
    monitorLabel: 'Visibility',
    nodes: [
      { id: 'pages', label: 'Expert pages', kind: 'panel', screen: 'page', x: 0.3, y: 1.3, stage: 1 },
      { id: 'tech', label: 'Technical health', kind: 'box', icon: 'code', x: 2.0, y: 0.3, stage: 2 },
      { id: 'schema', label: 'Structured data', kind: 'tower', icon: 'nodes', x: 2.6, y: 1.7, stage: 3, accent: 'purple' },
      { id: 'evidence', label: 'Sources & evidence', kind: 'box', icon: 'doc', x: 4.5, y: 0.5, stage: 3 },
      { id: 'engines', label: 'Search & AI answers', kind: 'box', icon: 'search', x: 4.8, y: 2.3, stage: 4 },
      { id: 'visibility', label: 'Visibility report', kind: 'panel', screen: 'chart', x: 6.4, y: 1.3, stage: 5 },
    ],
    links: [
      { from: 'pages', to: 'tech' }, { from: 'tech', to: 'schema' }, { from: 'pages', to: 'schema' },
      { from: 'evidence', to: 'schema' }, { from: 'schema', to: 'engines' }, { from: 'engines', to: 'visibility' },
    ],
    story: [
      { title: 'Search audit', detail: 'Review which pages exist, which questions buyers ask and where you are already visible.', output: 'Visibility baseline', state: { built: 1, focus: ['pages'] } },
      { title: 'Technical fixes', detail: 'Resolve crawl, speed and indexing issues that stop good pages from being found.', output: 'Healthy foundation', state: { built: 2, focus: ['tech'] } },
      { title: 'Content architecture', detail: 'Plan pages that answer real questions clearly, without duplication or filler.', output: 'Content plan', state: { ghost: true, focus: ['schema'] } },
      { title: 'Structure & evidence', detail: 'Add accurate structured data and visible sources that support every claim.', output: 'Machine-readable pages', state: { built: 3, focus: ['schema', 'evidence'] } },
      { title: 'Search surfaces', detail: 'Make expertise accessible to search engines and AI answer experiences alike.', output: 'Discoverable expertise', state: { built: 4, focus: ['engines'] } },
      { title: 'Measurement', detail: 'Track impressions, rankings and enquiries from real search data, not vanity metrics.', output: 'Visibility reporting', state: { built: 5, ...connectAll, live: true, monitor: true, focus: ['visibility'] } },
    ],
  },
  'digital-marketing-growth': {
    slug: 'digital-marketing-growth',
    token: 'Digital Marketing',
    phrase: 'channels',
    summary: 'Join campaign intent, useful landing pages and measured enquiries with the follow-up behind them.',
    chain: ['Campaigns', 'Landing pages', 'Tracking', 'CRM'],
    monitorLabel: 'Cost per enquiry',
    nodes: [
      { id: 'audience', label: 'Audience & offer', kind: 'box', icon: 'target', x: 0.2, y: 1.3, stage: 1 },
      { id: 'channels', label: 'Campaign channels', kind: 'box', icon: 'bolt', x: 2.0, y: 0.3, stage: 2 },
      { id: 'landing', label: 'Landing page', kind: 'panel', screen: 'page', x: 2.7, y: 1.8, stage: 3, accent: 'purple' },
      { id: 'tracking', label: 'Conversion tracking', kind: 'box', icon: 'eye', x: 4.5, y: 0.5, stage: 3 },
      { id: 'crm', label: 'CRM follow-up', kind: 'box', icon: 'funnel', x: 4.8, y: 2.3, stage: 4 },
      { id: 'results', label: 'Results dashboard', kind: 'panel', screen: 'chart', x: 6.4, y: 1.3, stage: 5 },
    ],
    links: [
      { from: 'audience', to: 'channels' }, { from: 'channels', to: 'landing' }, { from: 'landing', to: 'tracking' },
      { from: 'landing', to: 'crm' }, { from: 'tracking', to: 'results' }, { from: 'crm', to: 'results' },
    ],
    story: [
      { title: 'Audience & goals', detail: 'Define who you want to reach, the offer and the number that decides success.', output: 'Growth plan', state: { built: 1, focus: ['audience'] } },
      { title: 'Channel plan', detail: 'Choose channels by where your buyers actually are, with a budget you can test.', output: 'Channel mix', state: { ghost: true, built: 2, focus: ['channels'] } },
      { title: 'Landing & tracking', detail: 'Build focused landing pages and fix tracking so every enquiry is attributed.', output: 'Measured funnel', state: { built: 3, focus: ['landing', 'tracking'] } },
      { title: 'CRM follow-up', detail: 'Connect new enquiries to fast, automated follow-up in your CRM.', output: 'Connected follow-up', state: { built: 4, focus: ['crm'] } },
      { title: 'Launch & measure', detail: 'Launch campaigns and report on enquiries and cost, not just clicks.', output: 'Results dashboard', state: { built: 5, ...connectAll, live: true, monitor: true, focus: ['results'] } },
      { title: 'Test & reinvest', detail: 'Run structured tests and move budget toward what is proven to work.', output: 'Compounding growth', state: { verified: true, focus: ['channels', 'landing'] } },
    ],
  },
};

/** Hero order reads as a sentence sequence: conversations, workflows, systems… */
export const HERO_ORDER = [
  'conversational-voice-ai',
  'ai-agents-intelligent-automation',
  'custom-software-web-apps',
  'generative-ai-ml-engineering',
  'rag-data-business-intelligence',
  'crm-revenue-automation',
  'saas-ai-product-development',
  'ai-search-optimization',
  'digital-marketing-growth',
] as const;
