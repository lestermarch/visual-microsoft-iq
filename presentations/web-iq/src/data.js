export const icons = {
  world: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
  news: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h4v4H7zm7 0h3m-3 4h3"/>',
  media: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m4 18 5-6 4 4 3-3 4 5m-6-10 4 2-4 2Z"/><circle cx="7" cy="8" r="1"/>',
  license: '<path d="M5 3h10l4 4v7M15 3v5h4M8 11h5m-5 4h3M5 3v18h7"/><circle cx="17" cy="17" r="4"/><path d="m15 17 1.5 1.5L19 16"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  agent: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="m19 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z"/>',
  video: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/>',
  weather: '<path d="M7 17a4 4 0 1 1 1-8 5 5 0 0 1 9 2 3 3 0 1 1 1 6H7Z"/><path d="M4 3v2m-4 2h2m5-6L6 3M3 11l-2 1m6 8v2m5-2v2m5-2v2"/>',
  commerce: '<path d="M6 7h12l2 14H4L6 7Z"/><path d="M9 8V5a3 3 0 0 1 6 0v3m-6 4h6"/>',
};

const svg = (body) => `<svg viewBox="0 0 100 48" fill="none" aria-hidden="true">${body}</svg>`;
export const sources = [
  {
    id: 'web', title: 'Web pages', group: 'open', color: 'azure', icon: 'world',
    example: 'Public knowledge',
    art: svg('<rect x="5" y="3" width="90" height="42" rx="4" class="art-panel"/><path d="M5 12h90M12 8h2m4 0h2m4 0h2" class="art-stroke"/><rect x="12" y="19" width="25" height="18" rx="2" class="art-fill"/><path d="M44 21h41m-41 7h35m-35 7h25" class="art-stroke"/>'),
  },
  {
    id: 'news', title: 'News', group: 'open', color: 'azure', icon: 'news',
    example: 'A changing world',
    art: svg('<rect x="6" y="3" width="88" height="42" rx="3" class="art-panel"/><path d="M13 11h48M13 17h74" class="art-stroke"/><path d="M13 25h34v13H13Z" class="art-fill"/><path d="M54 26h33m-33 6h27m-27 6h33" class="art-stroke"/>'),
  },
  {
    id: 'video', title: 'Video', group: 'open', color: 'purple', icon: 'video',
    example: 'Watch & discover',
    art: svg('<rect x="6" y="3" width="88" height="42" rx="4" class="art-fill"/><path d="m42 13 22 11-22 11Z" class="art-play"/><path d="M13 39h74" class="art-stroke"/>'),
  },
  {
    id: 'places', title: 'Places', group: 'structured', color: 'teal', icon: 'pin',
    example: 'Local business details',
    art: svg('<rect x="6" y="3" width="88" height="42" rx="4" class="art-panel"/><path d="m12 3 23 42M52 3 33 45M6 32l88-17m-88-3 88 27" class="art-stroke"/><path d="M62 15c0 7-9 16-9 16s-9-9-9-16a9 9 0 1 1 18 0Z" class="art-fill"/><circle cx="53" cy="15" r="3" class="art-play"/>'),
  },
  {
    id: 'commerce', title: 'Commerce', group: 'structured', color: 'teal', icon: 'commerce',
    example: 'Products & offers',
    art: svg('<path d="M29 15h42l4 28H25l4-28Z" class="art-fill"/><path d="M40 17V11a10 10 0 0 1 20 0v6" class="art-stroke"/><path d="M40 29h20m-16 6h12" class="art-play-stroke"/>'),
  },
  {
    id: 'images', title: 'Images', group: 'open', color: 'violet', icon: 'media',
    example: 'A visual perspective',
    art: svg('<rect x="6" y="3" width="88" height="42" rx="4" class="art-panel"/><circle cx="74" cy="14" r="6" class="art-fill"/><path d="m8 43 26-28 18 20 11-12 29 20Z" class="art-fill"/><path d="m23 28 11-13 12 14" class="art-stroke"/>'),
  },
  {
    id: 'licensed', title: 'Licensed content', group: 'licensed', color: 'violet', icon: 'license',
    example: 'Bring your own licence',
    art: svg('<rect x="18" y="3" width="54" height="41" rx="3" class="art-panel"/><path d="M26 12h37m-37 7h37m-37 7h25m-25 7h20" class="art-stroke"/><circle cx="72" cy="31" r="13" class="art-fill"/><path d="m65 31 5 5 9-10" class="art-play-stroke"/>'),
  },
  {
    id: 'weather', title: 'Weather', group: 'structured', color: 'teal', icon: 'weather',
    example: 'Conditions & forecasts',
    art: svg('<circle cx="37" cy="17" r="10" class="art-fill"/><path d="M37 1v4M21 7l3 3m-9 7h5M50 5l-3 4" class="art-stroke"/><path d="M35 41a10 10 0 1 1 2-20 13 13 0 0 1 25 3 9 9 0 1 1 5 17H35Z" class="art-panel"/><path d="M73 15h14m-14 8h10" class="art-stroke"/>'),
  },
];
