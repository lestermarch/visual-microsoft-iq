export const DURATION = 120;

export const chapters = [
  {
    id: 'people', title: 'People & agents', color: 'azure', start: 0,
    summary: 'From interactive assistance to autonomous work',
    kicker: 'YOUR PEOPLE. YOUR AGENTS. YOUR IQ.',
    text: 'People and agents need context to do useful work. From interactive assistance to autonomous workflows, intelligence is more valuable when it understands the environment it operates in.',
    caption: 'The same ambition: useful intelligence, grounded in context.',
    detail: 'People guide the work. Agents assist and act within defined boundaries.',
    outcome: 'Start with the people and agents you want to empower.',
  },
  {
    id: 'collaboration', title: 'Collaboration', color: 'azure', start: 24,
    summary: 'Teams, roles and workflows',
    kicker: 'UNDERSTAND HOW WORK HAPPENS.',
    text: 'Conversations, working relationships and shared activity give work its context. Teams, roles and workflows help explain who is involved, what matters and how work moves forward.',
    caption: 'Collaboration adds the human context of work.',
    detail: 'Teams, roles and workflows - not just isolated messages and files.',
    outcome: 'Context about people, relationships and shared work.',
  },
  {
    id: 'business', title: 'Business data', color: 'cyan', start: 48,
    summary: 'The state and actions of the business',
    kicker: 'UNDERSTAND WHAT IS HAPPENING.',
    text: 'Business records, metrics and events describe the current state of operations. Their meaning and relationships help people and agents interpret what is happening and decide what should happen next.',
    caption: 'Business context connects information to operations.',
    detail: 'State, metrics and actions - understood in the language of the business.',
    outcome: 'Context about business meaning, state and operations.',
  },
  {
    id: 'knowledge', title: 'Curated knowledge', color: 'teal', start: 72,
    summary: 'Documents, relationships and expertise',
    kicker: 'BRING THE RIGHT KNOWLEDGE TO THE WORK.',
    text: 'Documents, guidance and connected knowledge sources supply relevant evidence and expertise. Curating this knowledge helps people and agents find and use what matters for the task.',
    caption: 'Knowledge gives reasoning something relevant to draw on.',
    detail: 'Curated sources, connected relationships and reusable expertise.',
    outcome: 'Context about the knowledge your organisation can use.',
  },
  {
    id: 'iq', title: 'Your IQ', color: 'violet', start: 96,
    summary: 'An intelligence layer above your sources',
    kicker: 'CONNECTED CONTEXT. MORE USEFUL INTELLIGENCE.',
    text: 'The IQ layer brings the picture together: collaboration, business context and knowledge, in service of people and agents. Next, explore the distinct roles of Work IQ, Fabric IQ, Foundry IQ and Web IQ.',
    caption: 'Your people. Your agents. Your IQ.',
    detail: 'One high-level picture. Four IQs to explore next.',
    outcome: 'Next: Work IQ - the context of people and their work.',
  },
];

export function getTimeline(time) {
  if (!Number.isFinite(time)) throw new TypeError('Presentation time must be finite.');
  const elapsed = Math.max(0, Math.min(DURATION, time));
  const chapter = chapters.findLastIndex((item) => elapsed >= item.start);
  const end = chapters[chapter + 1]?.start ?? DURATION;
  return { elapsed, chapter, progress: (elapsed - chapters[chapter].start) / (end - chapters[chapter].start), complete: elapsed === DURATION };
}

export function formatTime(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}
