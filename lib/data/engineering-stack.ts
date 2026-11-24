/**
 * The engineering Lexvaxa chooses from for enterprise systems and SaaS products. Each project uses the
 * part it needs; this is the range, not a bundle. Shown on /services and the Technology & SaaS page.
 */
export type EngineeringArea = { id: string; title: string; summary: string; tools: readonly string[] };

export const engineeringAreas: readonly EngineeringArea[] = [
  {
    id: 'ml', title: 'Machine learning & deep learning',
    summary: 'Neural networks for classification, forecasting, document understanding, vision and speech, trained and evaluated on your own data.',
    tools: ['PyTorch', 'TensorFlow', 'scikit-learn', 'XGBoost', 'Hugging Face Transformers', 'Computer vision'],
  },
  {
    id: 'llm', title: 'LLM apps & AI agents',
    summary: 'Retrieval (RAG), tool-using agents and multi-step agent workflows with guardrails, evaluations and human approval where it matters.',
    tools: ['LangChain', 'LangGraph', 'LlamaIndex', 'OpenAI', 'Anthropic Claude', 'Llama & Mistral', 'Evals'],
  },
  {
    id: 'data', title: 'Data & retrieval',
    summary: 'Clean pipelines, vector search and a single source of truth, so AI features answer from the right records.',
    tools: ['PostgreSQL', 'pgvector', 'Pinecone', 'MongoDB', 'Redis', 'Kafka', 'dbt'],
  },
  {
    id: 'product', title: 'Product engineering',
    summary: 'Web apps, portals, mobile apps and APIs, typed end to end and built to be maintained by your team later.',
    tools: ['Next.js', 'React', 'TypeScript', 'Node.js', 'NestJS', 'Python', 'FastAPI', 'React Native'],
  },
  {
    id: 'cloud', title: 'Cloud, DevOps & MLOps',
    summary: 'Infrastructure as code, CI/CD, model serving and monitoring, on the cloud you already use.',
    tools: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'MLflow'],
  },
  {
    id: 'saas', title: 'Enterprise SaaS foundations',
    summary: 'The parts every serious SaaS product needs: tenants, sign-in, permissions, billing, audit trails and observability.',
    tools: ['Multi-tenant architecture', 'SSO (SAML / OIDC)', 'Role-based access', 'Audit logs', 'Stripe billing', 'OpenTelemetry'],
  },
];
