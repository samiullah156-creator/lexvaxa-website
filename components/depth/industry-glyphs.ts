/**
 * Lexvaxa's own industry pictograms.
 *
 * Same drawing rules as the service glyphs: a 24-unit grid, one line weight, and exactly one accent
 * element (`lx-accent` / `lx-accent-fill`) that takes the brand colour of its context. Each icon
 * shows the work we do for that sector, not just the sector's cliché object.
 */
type Node = [tag: string, attributes: Record<string, string | number>];
const accent = 'lx-accent';
const accentFill = 'lx-accent-fill';

export const INDUSTRY_GLYPHS: Record<string, Node[]> = {
  // Scales in balance; one pan carries the decision a lawyer signs off.
  'legal-services': [
    ['path', { d: 'M12 5v15M8 20h8M4.5 7.5h15', key: 'frame' }],
    ['circle', { cx: 12, cy: 4.2, r: 1.2, fill: 'currentColor', stroke: 'none', key: 'pivot' }],
    ['path', { d: 'M6.5 7.5 4 13M6.5 7.5 9 13M3.5 13a3 3 0 0 0 6 0', key: 'left' }],
    ['path', { d: 'M17.5 7.5 15 13M17.5 7.5 20 13', key: 'strings' }],
    ['path', { d: 'M14.5 13h6a3 3 0 0 1-6 0Z', className: accentFill, key: 'right' }],
  ],
  // A parcel on its way: a dashed route ending at the delivery pin.
  'logistics-field-services': [
    ['rect', { x: 3, y: 14.5, width: 7, height: 6, rx: 1, key: 'box' }],
    ['path', { d: 'M6.5 14.5v2.5', key: 'tape' }],
    ['path', { d: 'M10 17.5h3.5a3 3 0 0 0 3-3V13', strokeDasharray: '1.8 2.2', key: 'route' }],
    ['path', { d: 'M16.5 2.5A4 4 0 0 0 12.5 6.5c0 3 4 6.5 4 6.5s4-3.5 4-6.5a4 4 0 0 0-4-4Z', className: accentFill, key: 'pin' }],
  ],
  // One product, many customer workspaces: a window of tenant rows with the active one picked out.
  'saas-technology': [
    ['rect', { x: 2.5, y: 3.5, width: 19, height: 13.5, rx: 2, key: 'window' }],
    ['path', { d: 'M2.5 7.5h19M9 20.5h6M12 17v3.5', key: 'chrome' }],
    ['path', { d: 'M6 11h5M6 14h7', key: 'rows' }],
    ['rect', { x: 14.5, y: 10, width: 4, height: 4, rx: 1, className: accentFill, key: 'tenant' }],
  ],
  // A shopping bag with its price tag: catalogue, cart and checkout.
  'ecommerce-retail': [
    ['path', { d: 'M3.5 8h12l-1 12h-10Z', key: 'bag' }],
    ['path', { d: 'M6.5 8V6.5a3 3 0 0 1 6 0V8', key: 'handle' }],
    ['path', { d: 'M14 13.5h5l2.5 2.5-2.5 2.5h-5Z', className: accentFill, key: 'tag' }],
  ],
  // The appointment book of a clinic, with the care it schedules.
  'healthcare-operations': [
    ['rect', { x: 3, y: 5, width: 18, height: 15.5, rx: 2, key: 'calendar' }],
    ['path', { d: 'M8 3v4M16 3v4M3 9.5h18', key: 'rings' }],
    ['path', { d: 'M11 11.5h2v2h2v2h-2v2h-2v-2H9v-2h2Z', className: accentFill, key: 'cross' }],
  ],
  // Client work measured in deliverables and hours.
  'professional-services': [
    ['rect', { x: 4, y: 4, width: 12, height: 16.5, rx: 2, key: 'board' }],
    ['path', { d: 'M8 4V2.8h4V4', key: 'clip' }],
    ['path', { d: 'M7 9.5l1.3 1.3L11 8M7 14.5h5', key: 'items' }],
    ['circle', { cx: 17.5, cy: 17, r: 4, className: accent, key: 'clock' }],
    ['path', { d: 'M17.5 15v2.2l1.4 1', className: accent, key: 'hands' }],
  ],
  // A home with its door open: listings, viewings and tenants.
  'real-estate-property': [
    ['path', { d: 'M2.5 11 12 3.5l9.5 7.5', key: 'roof' }],
    ['path', { d: 'M5 9.5V20.5h14V9.5', key: 'walls' }],
    ['path', { d: 'M15.5 6V3.5h2v4', key: 'chimney' }],
    ['path', { d: 'M9.75 20.5v-4.25a2.25 2.25 0 0 1 4.5 0v4.25Z', className: accentFill, key: 'door' }],
  ],
  // An open book that plays: learning delivered online.
  'education-elearning': [
    ['path', { d: 'M2 6.5C4.5 5 8 5 12 7c4-2 7.5-2 10-.5V19c-2.5-1.5-6-1.5-10 .5-4-2-7.5-2-10-.5Z', key: 'book' }],
    ['path', { d: 'M12 7v12.5', key: 'spine' }],
    ['path', { d: 'M15 10.25v5l4-2.5Z', className: accentFill, key: 'play' }],
  ],
  // Numbers that add up: rising columns and the coin they count.
  'finance-accounting': [
    ['path', { d: 'M3 20.5h18', key: 'base' }],
    ['path', { d: 'M5.5 20.5v-5M9.5 20.5v-8M13.5 20.5v-6', key: 'bars' }],
    ['circle', { cx: 17.5, cy: 7, r: 3.5, className: accentFill, key: 'coin' }],
  ],
  // A pen nib with the spark of an idea.
  'marketing-creative-agencies': [
    ['path', { d: 'M3.5 20.5 6 13.5l6-6 4.5 4.5-6 6Z', key: 'nib' }],
    ['path', { d: 'M3.5 20.5 8.5 15.5', key: 'slit' }],
    ['circle', { cx: 9.5, cy: 14.5, r: 1.1, fill: 'currentColor', stroke: 'none', key: 'hole' }],
    ['path', { d: 'M18 2.5l1.1 2.6 2.6 1.1-2.6 1.1L18 9.9l-1.1-2.6-2.6-1.1 2.6-1.1Z', className: accentFill, key: 'spark' }],
  ],
};
