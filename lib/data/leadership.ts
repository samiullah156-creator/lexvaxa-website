/** Leadership team alongside the founder, as published on the existing lexvaxa.com/about page. */
export type Leader = {
  id: string;
  name: string;
  role: string;
  summary: string;
  focus: string[];
  /** Head-and-shoulders crop of the portrait published on lexvaxa.com/team; initials show if absent. */
  photo?: string;
};

export const leadership: Leader[] = [
  {
    id: 'abdul-ally',
    name: 'Abdul Ally',
    role: 'CTO & Technical Partner',
    summary: 'Driving the engineering vision and architectural strategy. Specialist in scaling distributed systems and AI infrastructure.',
    focus: ['Engineering vision', 'Architecture strategy', 'Distributed systems', 'AI infrastructure'],
    photo: '/team/abdul-ali.webp',
  },
  {
    id: 'hussnain-bukhari',
    name: 'Hussnain Bukhari',
    role: 'COO & Project Manager',
    summary: 'Operational strategist ensuring high-velocity delivery. Orchestrating seamless integration of AI solutions into core business logic.',
    focus: ['Delivery operations', 'Project management', 'AI solution integration'],
    photo: '/team/hussnain-bukhari.webp',
  },
];

/** Team members from the admin, minus the founder (who has their own section), in the Leader shape. */
export function leadersFromCms(members: readonly { name: string; role: string; summary: string; focus: string; photo: string }[], founderName: string): Leader[] {
  const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return members.filter((member) => member.name.trim().toLowerCase() !== founderName.trim().toLowerCase()).map((member) => ({
    id: slug(member.name), name: member.name, role: member.role, summary: member.summary,
    focus: member.focus.split(',').map((item) => item.trim()).filter(Boolean),
    ...(member.photo ? { photo: member.photo } : {}),
  }));
}
