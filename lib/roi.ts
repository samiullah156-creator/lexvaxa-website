/**
 * Starting figures for the ROI estimator. They are example inputs the visitor is asked to replace
 * with their own numbers, not results Lexvaxa claims. The estimate is plain arithmetic:
 * hours saved = volume × minutes per item × share automated ÷ 60; value = hours × hourly cost.
 */
export type RoiPreset = {
  /** The work being automated, e.g. "Supplier invoices processed". */
  task: string;
  unit: string;
  volume: number;
  minutes: number;
  /** 0–100: how much of that work the system takes over. */
  share: number;
  hourlyCost: number;
};

export const industryRoi: Record<string, RoiPreset> = {
  'legal-services': { task: 'Intake, document review and drafting', unit: 'documents', volume: 300, minutes: 25, share: 50, hourlyCost: 45 },
  'logistics-field-services': { task: 'Shipment updates, exceptions and paperwork', unit: 'shipments', volume: 1500, minutes: 6, share: 60, hourlyCost: 25 },
  'saas-technology': { task: 'Support tickets and onboarding questions', unit: 'tickets', volume: 1200, minutes: 8, share: 45, hourlyCost: 35 },
  'ecommerce-retail': { task: 'Order, return and delivery questions', unit: 'requests', volume: 2000, minutes: 5, share: 55, hourlyCost: 20 },
  'healthcare-operations': { task: 'Appointment calls, reminders and intake forms', unit: 'calls and forms', volume: 1500, minutes: 5, share: 50, hourlyCost: 22 },
  'professional-services': { task: 'Proposals, reports and client updates', unit: 'documents', volume: 200, minutes: 45, share: 40, hourlyCost: 50 },
  'real-estate-property': { task: 'Lead replies, viewing bookings and follow-ups', unit: 'leads', volume: 600, minutes: 12, share: 60, hourlyCost: 25 },
  'education-elearning': { task: 'Admissions questions, enrolments and admin', unit: 'requests', volume: 1000, minutes: 7, share: 50, hourlyCost: 25 },
  'finance-accounting': { task: 'Invoice entry, reconciliation and reporting', unit: 'invoices', volume: 800, minutes: 8, share: 70, hourlyCost: 30 },
  'marketing-creative-agencies': { task: 'Reporting, briefs and client updates', unit: 'reports', volume: 150, minutes: 60, share: 50, hourlyCost: 40 },
};

export const projectRoi: Record<string, RoiPreset> = {
  'lead-crm-automation': { task: 'Leads entered, enriched and followed up', unit: 'leads', volume: 400, minutes: 15, share: 70, hourlyCost: 30 },
  'invoice-processing-automation': { task: 'Supplier invoices processed', unit: 'invoices', volume: 800, minutes: 8, share: 75, hourlyCost: 30 },
  'company-knowledge-assistant': { task: 'Internal questions answered', unit: 'questions', volume: 1000, minutes: 12, share: 50, hourlyCost: 40 },
  // Projects published from the admin panel, by their address.
  'hvac-ai-voice-receptionist': { task: 'Booking and service calls handled', unit: 'calls', volume: 1200, minutes: 4, share: 60, hourlyCost: 22 },
  'ai-appointment-booking-agent': { task: 'Appointments booked and rescheduled', unit: 'bookings', volume: 800, minutes: 5, share: 65, hourlyCost: 22 },
  'ai-legal-intake-automation': { task: 'New client enquiries taken in', unit: 'enquiries', volume: 300, minutes: 20, share: 60, hourlyCost: 45 },
  'filevine-case-status-automation': { task: 'Case status updates and deadline checks', unit: 'updates', volume: 900, minutes: 6, share: 70, hourlyCost: 40 },
  'law-firm-crm-client-portal': { task: 'Client updates and document requests', unit: 'requests', volume: 600, minutes: 8, share: 50, hourlyCost: 40 },
};

export function estimateRoi({ volume, minutes, share, hourlyCost }: Pick<RoiPreset, 'volume' | 'minutes' | 'share' | 'hourlyCost'>, budget = 0) {
  const hours = (volume * minutes * (share / 100)) / 60;
  const monthly = hours * hourlyCost;
  return {
    hours,
    monthly,
    yearly: monthly * 12,
    /** Full-time people, at 160 working hours a month. */
    people: hours / 160,
    paybackMonths: budget > 0 && monthly > 0 ? budget / monthly : undefined,
  };
}

/** Starting figures for any automation or AI project without its own preset (e.g. one added in the admin later). */
const GENERIC_ROI: RoiPreset = { task: 'Repetitive tasks this system takes over', unit: 'tasks', volume: 600, minutes: 8, share: 60, hourlyCost: 30 };
/** Platforms and web apps save time through self-service and one shared record instead of manual admin. */
const PLATFORM_ROI: RoiPreset = { task: 'Manual admin, bookings and status requests replaced by self-service', unit: 'requests', volume: 800, minutes: 6, share: 50, hourlyCost: 25 };

/** The estimator preset for a project: its own figures, a generic one for automation/AI work, or a platform one. */
export function roiFor(project: { slug: string; tracks?: readonly string[] }, tracks: readonly string[]): RoiPreset {
  return projectRoi[project.slug] ?? (tracks.some((track) => track === 'automation' || track === 'ai') ? GENERIC_ROI : PLATFORM_ROI);
}
