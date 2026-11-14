const paths = {
  agent: '<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6Z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  scale: '<circle cx="12" cy="12" r="3"/><circle cx="4" cy="4" r="2"/><circle cx="20" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/><path d="m6 6 4 4m4 0 4-4M6 18l4-4m4 0 4 4"/>',
  observe: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  govern: '<path d="M5 4h14v16H5ZM9 8h6M9 12h6M9 16h3"/><path d="m15 15 2 2 4-4"/>',
  secure: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6ZM8 12l3 3 5-6"/>',
  complete: '<path d="M3 7h18v14H3ZM7 7V3h10v4M8 14l3 3 5-6"/>',
};

export function icon(id) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[id]}</svg>`;
}

export const controls = [
  { id: 'observe', title: 'Observe', color: 'azure', chapter: 2 },
  { id: 'govern', title: 'Govern', color: 'cyan', chapter: 3 },
  { id: 'secure', title: 'Secure', color: 'teal', chapter: 4 },
];
