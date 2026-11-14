export const DURATION = 120;
export const chapters = [
  {
    title: 'More than web pages',
    kicker: 'THE WEB, AND THE WORLD AROUND IT',
    summary: 'Open web. Licensed content. Structured data.',
    text: 'Give agents a broader view of the world. Web IQ connects open web information, supported licensed content and structured data through web grounding APIs.',
    start: 0, color: 'blue', icon: 'world', focus: ['all'],
    caption: 'A world of information. One connected picture.',
    detail: 'Three complementary kinds of external context.',
  },
  {
    title: 'Open web & news',
    kicker: 'FRESH INFORMATION BEYOND TRAINING DATA',
    summary: 'Public pages, reporting and recent events',
    text: 'Bring in public web pages and news to help agents respond to a changing world. Search for relevant evidence and preserve a route back to its source.',
    start: 20, color: 'blue', icon: 'news', focus: ['web', 'news'],
    caption: 'Keep pace with a world that keeps changing.',
    detail: 'Public pages and news, with source references.',
  },
  {
    title: 'Images & video',
    kicker: 'A MULTIMODAL VIEW OF THE WEB',
    summary: 'Visual discovery, not just text documents',
    text: 'Find image and video results alongside text. Give agents a richer set of references for discovery and research, subject to API capabilities and content-use rights.',
    start: 40, color: 'cyan', icon: 'media', focus: ['images', 'video'],
    caption: 'The web is visual, too.',
    detail: 'Discover image and video results, not just pages.',
  },
  {
    title: 'Licensed content',
    kicker: 'BRING YOUR OWN LICENCE',
    summary: 'Premium sources you are licensed to use',
    text: 'Connect supported customer-licensed content. Your licensing arrangement determines what can be accessed and used; Web IQ does not grant blanket access to paywalled content.',
    start: 60, color: 'violet', icon: 'license', focus: ['licensed'],
    caption: 'Premium knowledge. With the rights to use it.',
    detail: 'Supported sources, under your licensing arrangement.',
  },
  {
    title: 'Structured, real-world data',
    kicker: 'PLACES. WEATHER. COMMERCE.',
    summary: 'Useful facts about the world beyond documents',
    text: 'Connect agents to real-world information: places and business details, weather conditions, and product or shopping data. Coverage and availability depend on the offering.',
    start: 80, color: 'teal', icon: 'pin', focus: ['places', 'weather', 'commerce'],
    caption: 'Not another page. The facts an agent needs.',
    detail: 'Places, weather and commerce as structured context.',
  },
  {
    title: 'Grounded agent answers',
    kicker: 'QUALITY. SPEED. TOKEN EFFICIENCY.',
    summary: 'Relevant evidence, focused context, source references',
    text: 'Bring the right evidence into an agent workflow. Focused passages reduce unnecessary context; source references let your application build answers people can check.',
    start: 100, color: 'teal', icon: 'agent', focus: ['all'],
    caption: 'From a world of information to useful agent context.',
    detail: 'Illustrative visit planning: place details + weather + news.',
  },
];

export function getTimeline(time) {
  if (!Number.isFinite(time)) throw new TypeError('Presentation time must be finite.');
  const elapsed = Math.max(0, Math.min(DURATION, time));
  const chapter = chapters.findLastIndex((item) => elapsed >= item.start);
  const end = chapters[chapter + 1]?.start ?? DURATION;
  return {
    elapsed, chapter,
    progress: (elapsed - chapters[chapter].start) / (end - chapters[chapter].start),
    complete: elapsed === DURATION,
  };
}

export function formatTime(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

export function isSourceActive(sourceId, chapter) {
  const focus = chapters[chapter].focus;
  return focus.includes('all') || focus.includes(sourceId);
}
