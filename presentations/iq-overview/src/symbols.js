const paths = {
  people: '<circle cx="9" cy="7" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5"/>',
  agent: '<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6Z"/>',
  collaboration: '<path d="M3 4h18v12H9l-5 4v-4H3ZM7 8h10M7 12h7"/>',
  business: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  knowledge: '<path d="M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6M9 16h6"/>',
  iq: '<path d="m12 3 9 5v8l-9 5-9-5V8ZM3 8l9 5 9-5M12 13v8"/>',
  roles: '<circle cx="12" cy="7" r="3"/><path d="M6 20v-3a6 6 0 0 1 12 0v3"/>',
  workflow: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h9v9M15 12l3 3 3-3"/>',
  metrics: '<path d="M3 19h18M5 15l4-6 4 4 6-9M16 4h3v3"/>',
  actions: '<path d="m13 2-8 12h6l-1 8 9-13h-6Z"/>',
  relationships: '<circle cx="12" cy="4" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 6v7M5 17v-4h14v4"/>',
  expertise: '<path d="M12 5C9 2 4 3 3 4v16c3-2 6-2 9 0 3-2 6-2 9 0V4c-3-2-6-2-9 1ZM12 5v15"/>',
};

export function icon(id) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[id]}</svg>`;
}

export const foundations = [
  { id: 'collaboration', title: 'Collaboration', detail: 'Teams, roles & workflows', color: 'azure', symbols: ['collaboration', 'roles', 'workflow'] },
  { id: 'business', title: 'Business data', detail: 'State, metrics & actions', color: 'cyan', symbols: ['business', 'metrics', 'actions'] },
  { id: 'knowledge', title: 'Curated knowledge', detail: 'Documents & expertise', color: 'teal', symbols: ['knowledge', 'relationships', 'expertise'] },
];
