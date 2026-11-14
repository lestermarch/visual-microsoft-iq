export const DURATION = 120;

export const chapters = [
  {
    title: 'Intelligence',
    kicker: 'CONTEXT THAT KEEPS GETTING SMARTER',
    text: 'Continuously builds and structures high-quality context across your entire data estate.',
    start: 0,
    icon: 'intelligence',
    color: 'blue',
  },
  {
    title: 'Speed',
    kicker: 'LESS RETRIEVAL. MORE MOMENTUM.',
    text: 'Agent-optimized retrieval enables fewer round trips to the service and lower-latency access to rich context.',
    start: 24,
    icon: 'speed',
    color: 'cyan',
  },
  {
    title: 'Efficiency',
    kicker: 'ONE UNIFIED RUNTIME',
    text: 'Handles retrieval, context assembly, and reasoning in a unified runtime, rather than iterative, token-intensive reassembly.',
    start: 48,
    icon: 'efficiency',
    color: 'violet',
  },
  {
    title: 'Scale',
    kicker: 'BUILT FOR AGENTIC WORKLOADS',
    text: 'Supports the scale of agentic workloads, including high-volume reasoning and tool-calling.',
    start: 72,
    icon: 'scale',
    color: 'blue',
  },
  {
    title: 'Security',
    kicker: 'YOUR DATA. YOUR BOUNDARIES.',
    text: 'Operates directly on enterprise data in place, preserving existing security and governance policies.',
    start: 96,
    icon: 'security',
    color: 'teal',
  },
];

export function getTimeline(time) {
  if (!Number.isFinite(time)) throw new TypeError('Presentation time must be finite.');
  const elapsed = Math.max(0, Math.min(DURATION, time));
  const chapter = Math.min(chapters.length - 1, Math.floor(elapsed / 24));
  return {
    elapsed,
    chapter,
    progress: (elapsed - chapters[chapter].start) / 24,
    complete: elapsed === DURATION,
  };
}

export function formatTime(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}
