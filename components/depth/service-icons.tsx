import {
  Activity, AppWindow, AudioLines, BookOpen, CalendarCheck, ChartColumn, ChartNoAxesCombined, ChartScatter, ClipboardCheck, Clock,
  CloudUpload, CodeXml, Cpu, CreditCard, Database, Eye, FileStack, FileText, Filter, Gauge, Globe, Inbox, KeyRound,
  LayoutDashboard, Layers, ListChecks, Megaphone, MessageSquareText, Network, PanelsTopLeft, Phone, PlugZap, Route,
  ScanSearch, Search, Server, Settings2, ShieldCheck, Speech, Target, UserCheck, Users, Waypoints, Workflow, Zap,
  createLucideIcon, type LucideIcon,
} from 'lucide-react';
import { SERVICE_GLYPHS } from './service-glyphs';

/** One precise icon per module, so each system reads as its own pipeline. */
const MODULE_ICONS: Record<string, LucideIcon> = {
  'conversational-voice-ai:call': Phone,
  'conversational-voice-ai:speech': AudioLines,
  'conversational-voice-ai:core': MessageSquareText,
  'conversational-voice-ai:knowledge': BookOpen,
  'conversational-voice-ai:voice': Speech,
  'conversational-voice-ai:crm': CalendarCheck,
  'ai-agents-intelligent-automation:task': Inbox,
  'ai-agents-intelligent-automation:context': Database,
  'ai-agents-intelligent-automation:agent': Route,
  'ai-agents-intelligent-automation:tools': PlugZap,
  'ai-agents-intelligent-automation:review': UserCheck,
  'ai-agents-intelligent-automation:system': LayoutDashboard,
  'custom-software-web-apps:brief': ClipboardCheck,
  'custom-software-web-apps:frontend': AppWindow,
  'custom-software-web-apps:api': CodeXml,
  'custom-software-web-apps:db': Database,
  'custom-software-web-apps:auth': KeyRound,
  'custom-software-web-apps:deploy': CloudUpload,
  'generative-ai-ml-engineering:samples': FileStack,
  'generative-ai-ml-engineering:pipeline': Workflow,
  'generative-ai-ml-engineering:model': ChartScatter,
  'generative-ai-ml-engineering:evals': Gauge,
  'generative-ai-ml-engineering:guard': ShieldCheck,
  'generative-ai-ml-engineering:prod': Server,
  'rag-data-business-intelligence:sources': FileText,
  'rag-data-business-intelligence:warehouse': Database,
  'rag-data-business-intelligence:index': Layers,
  'rag-data-business-intelligence:retrieve': ScanSearch,
  'rag-data-business-intelligence:answer': MessageSquareText,
  'rag-data-business-intelligence:bi': ChartColumn,
  'crm-revenue-automation:leads': Inbox,
  'crm-revenue-automation:validate': ListChecks,
  'crm-revenue-automation:route': Filter,
  'crm-revenue-automation:crm': Users,
  'crm-revenue-automation:follow': Clock,
  'crm-revenue-automation:report': ChartNoAxesCombined,
  'saas-ai-product-development:idea': Target,
  'saas-ai-product-development:app': PanelsTopLeft,
  'saas-ai-product-development:core': Network,
  'saas-ai-product-development:ai': Cpu,
  'saas-ai-product-development:billing': CreditCard,
  'saas-ai-product-development:analytics': Activity,
  'ai-search-optimization:pages': Globe,
  'ai-search-optimization:tech': Settings2,
  'ai-search-optimization:schema': Waypoints,
  'ai-search-optimization:evidence': FileText,
  'ai-search-optimization:engines': Search,
  'ai-search-optimization:visibility': ChartNoAxesCombined,
  'digital-marketing-growth:audience': Target,
  'digital-marketing-growth:channels': Megaphone,
  'digital-marketing-growth:landing': AppWindow,
  'digital-marketing-growth:tracking': Eye,
  'digital-marketing-growth:crm': Filter,
  'digital-marketing-growth:results': ChartColumn,
};

/**
 * The signature icon carried for each service (menus, hero module, chips): Lexvaxa's own
 * pictograms, built as regular Lucide-style components so they accept the same props.
 */
const SERVICE_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  Object.entries(SERVICE_GLYPHS).map(([slug, nodes]) => [slug, createLucideIcon(`lexvaxa-${slug}`, nodes as Parameters<typeof createLucideIcon>[1])]),
);

export const moduleIcon = (slug: string, id: string): LucideIcon => MODULE_ICONS[`${slug}:${id}`] ?? Zap;
export const serviceIcon = (slug: string): LucideIcon => SERVICE_ICONS[slug] ?? Zap;
export const ICONED_MODULES = Object.keys(MODULE_ICONS);
