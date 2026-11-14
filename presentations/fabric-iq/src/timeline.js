export const DURATION = 120;
export const chapters = [
  {
    title: 'Connect your data',
    kicker: 'START WITH THE WHOLE DATA ESTATE',
    summary: 'Clouds, on-premises, applications, and streams',
    text: 'Bring together the systems your business runs on: databases, business apps, files, and live streams, across clouds and on-premises.',
    start: 0,
    color: 'blue',
    icon: 'sources',
    eyebrow: 'YOUR DATA ESTATE, CONNECTED',
    caption: 'Many systems. One connected foundation.',
    detail: 'Across clouds, on-premises, apps, and streams.',
  },
  {
    title: 'Unify with OneLake',
    kicker: 'A GOVERNED DATA FOUNDATION',
    summary: 'One logical lake. Shared, governed access.',
    text: 'Unify access through OneLake. Shortcuts can reference supported data in place; mirroring and ingestion bring other sources into the foundation.',
    start: 24,
    color: 'cyan',
    icon: 'lake',
    eyebrow: 'ONE FOUNDATION. NOT ANOTHER SILO.',
    caption: 'OneLake makes connected data accessible.',
    detail: 'Shortcuts, mirroring, and ingestion connect the estate.',
  },
  {
    title: 'Define trusted meaning',
    kicker: 'POWER BI SEMANTIC MODELS',
    summary: 'Shared measures, relationships, and definitions',
    text: 'Curate relationships, dimensions, and trusted measures in semantic models. Make concepts like revenue mean the same thing across your analytics.',
    start: 48,
    color: 'violet',
    icon: 'semantic',
    eyebrow: 'FROM DATA STRUCTURES TO SHARED MEANING',
    caption: 'A shared definition of what the numbers mean.',
    detail: 'Semantic models bring trusted business logic.',
  },
  {
    title: 'Model your business',
    kicker: 'ONTOLOGIES IN FABRIC IQ - PREVIEW',
    summary: 'Entities, relationships, rules, and live data',
    text: 'Jump-start an ontology from existing semantic models. Connect business entities, relationships, rules, and live data bindings into a shared business view.',
    start: 72,
    color: 'teal',
    icon: 'ontology',
    eyebrow: 'THE BUSINESS, NOT JUST THE TABLES',
    caption: 'Customers place orders. Shipments fulfil them.',
    detail: 'An ontology describes how those concepts connect.',
  },
  {
    title: 'Reason with context',
    kicker: 'FROM BUSINESS UNDERSTANDING TO ACTION',
    summary: 'Context-aware agents. Governed next steps.',
    text: 'Trace a delayed shipment to the orders and customers it affects. Ground agents in that shared context and connect insights to governed workflows.',
    start: 96,
    color: 'teal',
    icon: 'agent',
    eyebrow: 'CONNECTED CONTEXT. INFORMED DECISIONS.',
    caption: 'Understand the impact. Inform the next action.',
    detail: 'A common business language for people and agents.',
  },
];

export function getTimeline(time) {
  if (!Number.isFinite(time)) throw new TypeError('Presentation time must be finite.');
  const elapsed = Math.max(0, Math.min(DURATION, time));
  const chapter = chapters.findLastIndex((item) => elapsed >= item.start);
  const end = chapters[chapter + 1]?.start ?? DURATION;
  return {
    elapsed,
    chapter,
    progress: (elapsed - chapters[chapter].start) / (end - chapters[chapter].start),
    complete: elapsed === DURATION,
  };
}

export function formatTime(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}
