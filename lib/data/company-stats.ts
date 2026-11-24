/**
 * Company figures shown in the numbers band on the home page. Edit the values here when they change;
 * nothing else needs to be touched. Keep every figure one you can back up if a client asks.
 */
export type CompanyStat = { value: string; label: string };

export const COMPANY_STATS: readonly CompanyStat[] = [
  { value: '100+', label: 'Projects delivered' },
  { value: '15+', label: 'Countries served' },
  { value: '24/7', label: 'Support & monitoring' },
];
