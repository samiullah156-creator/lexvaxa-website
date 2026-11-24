/**
 * Lexvaxa's own service pictograms.
 *
 * Each one is a small schematic of what the service does, drawn on a 24-unit grid in the same
 * line weight, with exactly one accent element (class `lx-accent`) that takes the brand colour
 * of its context. They replace stock glyphs (robot head, sparkles, rocket) that every
 * template uses, so the icons read as part of this brand rather than a library default.
 */
type Node = [tag: string, attributes: Record<string, string | number>];
const accent = 'lx-accent';
const accentFill = 'lx-accent-fill';

export const SERVICE_GLYPHS: Record<string, Node[]> = {
  // The pick-and-place arm from the homepage: automation that hands work over step by step.
  'ai-agents-intelligent-automation': [
    ['path', { d: 'M2.5 21h6', key: 'floor' }],
    ['path', { d: 'M5 21v-5l6-9h7v4', key: 'arm' }],
    ['circle', { cx: 5, cy: 16, r: 1.5, fill: 'currentColor', key: 'shoulder' }],
    ['circle', { cx: 11, cy: 7, r: 1.5, fill: 'currentColor', key: 'elbow' }],
    ['path', { d: 'M15 14v-3h6v3', key: 'jaw' }],
    ['rect', { x: 16.25, y: 13.5, width: 3.5, height: 3.5, rx: 0.6, className: accentFill, key: 'block' }],
  ],
  // A small matrix of weights with one value picked out: models are numbers before they are magic.
  'generative-ai-ml-engineering': [
    ['path', { d: 'M8 4H5v16h3M16 4h3v16h-3', key: 'brackets' }],
    ['circle', { cx: 9.75, cy: 9.5, r: 1.3, fill: 'currentColor', stroke: 'none', key: 'a' }],
    ['circle', { cx: 9.75, cy: 14.5, r: 1.3, fill: 'currentColor', stroke: 'none', key: 'c' }],
    ['circle', { cx: 14.25, cy: 14.5, r: 1.3, fill: 'currentColor', stroke: 'none', key: 'd' }],
    ['circle', { cx: 14.25, cy: 9.5, r: 1.7, className: accentFill, key: 'b' }],
  ],
  // A conversation carrying a voice waveform.
  'conversational-voice-ai': [
    ['path', { d: 'M5 4h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-8l-4.5 3.5v-3.5H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', key: 'bubble' }],
    ['path', { d: 'M8 9.25v2M11 7.5v5.5M14 8.5v3.5M17 9.5v1.5', className: accent, key: 'wave' }],
  ],
  // A document with the retrieved passage marked: answers that point back to their source.
  'rag-data-business-intelligence': [
    ['path', { d: 'M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', key: 'page' }],
    ['path', { d: 'M14 3v5h5', key: 'fold' }],
    ['path', { d: 'M8.5 12.5h7', className: accent, key: 'passage' }],
    ['path', { d: 'M8.5 16.5h4', key: 'line' }],
  ],
  // An application window with its navigation and one primary action.
  'custom-software-web-apps': [
    ['rect', { x: 3, y: 4, width: 18, height: 16, rx: 2, key: 'frame' }],
    ['path', { d: 'M3 8.5h18M9 8.5V20', key: 'layout' }],
    ['rect', { x: 12, y: 12, width: 6, height: 3.5, rx: 0.9, className: accentFill, key: 'action' }],
  ],
  // A finished product, boxed and ready to ship.
  'saas-ai-product-development': [
    ['path', { d: 'M12 2.75l8 4.5v9.5l-8 4.5-8-4.5v-9.5z', key: 'box' }],
    ['path', { d: 'M12 12v9.25', key: 'edge' }],
    ['path', { d: 'M4 7.25l8 4.75 8-4.75', className: accent, key: 'lid' }],
  ],
  // Three pipeline stages with the last one reached: a lead followed through to a client.
  'crm-revenue-automation': [
    ['circle', { cx: 5.25, cy: 12, r: 2.75, key: 'first' }],
    ['circle', { cx: 12, cy: 12, r: 2.75, key: 'second' }],
    ['path', { d: 'M8 12h1.25M14.75 12h1.5', key: 'links' }],
    ['circle', { cx: 19, cy: 12, r: 3.25, className: accentFill, key: 'won' }],
  ],
  // A search lens with the answer inside it.
  'ai-search-optimization': [
    ['circle', { cx: 10.5, cy: 10.5, r: 7, key: 'lens' }],
    ['path', { d: 'M15.6 15.6L21 21', key: 'handle' }],
    ['path', { d: 'M7.5 9h6M7.5 12h3.5', className: accent, key: 'answer' }],
  ],
  // A megaphone and the reach it creates.
  'digital-marketing-growth': [
    ['path', { d: 'M3.5 10l10.5-5v14l-10.5-5z', key: 'horn' }],
    ['path', { d: 'M6.5 15.4v3.1a1.5 1.5 0 0 0 3 0v-1.7', key: 'grip' }],
    ['path', { d: 'M17.5 8.5L20 6.8M18 12h3M17.5 15.5l2.5 1.7', className: accent, key: 'reach' }],
  ],
};
