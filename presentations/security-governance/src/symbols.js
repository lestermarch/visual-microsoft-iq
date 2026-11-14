export const symbols = {
  entra: '<path d="m12 2 9 10-9 10L3 12l9-10Z"/><path d="m12 7 4 5-4 5-4-5 4-5Z"/>',
  purview: '<path d="M12 3c5 0 9 9 9 13 0 5-18 5-18 0C3 12 7 3 12 3Z"/><path d="m12 8 5 8H7l5-8Z"/>',
  defender: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
  sentinel: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="M6 12c3-6 9-6 12 0-3 6-9 6-12 0Z"/><circle cx="12" cy="12" r="2"/>',
  intune: '<rect x="3" y="3" width="12" height="18" rx="2"/><path d="M7 17h4"/><path d="m14 8 7 3v5l-7 5-4-5v-5l4-3Z"/><path d="m13 14 2 2 3-4"/>',
  agent: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="m20 2 .7 1.3L22 4l-1.3.7L20 6l-.7-1.3L18 4l1.3-.7Z"/>',
};

export const intelligenceLayers = [
  { id: 'work', title: 'Work IQ', detail: 'Work signals', color: 'azure' },
  { id: 'fabric', title: 'Fabric IQ', detail: 'Business data', color: 'teal' },
  { id: 'foundry', title: 'Foundry IQ', detail: 'Knowledge', color: 'violet' },
  { id: 'web', title: 'Web IQ', detail: 'The wider world', color: 'cyan' },
];

export function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[name]}</svg>`;
}
