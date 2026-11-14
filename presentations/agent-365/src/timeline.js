export const DURATION = 120;

export const chapters = [
  {
    id: 'layers', title: 'The layered agent', color: 'azure', start: 0,
    summary: 'An agent. IQ context. Security & governance.',
    kicker: 'THE STORY SO FAR, AROUND ONE AGENT.',
    text: 'In this picture, Microsoft IQ provides context around an agent. Your security and governance tools add identity, data protection and oversight around the agent and the context it uses.',
    caption: 'Start with an agent, its intelligence and its controls.',
    detail: 'The layers recap this deck; not every agent needs every IQ service.',
    outcome: 'Useful intelligence, with the right controls.',
  },
  {
    id: 'scale', title: 'Agents at scale', color: 'violet', start: 20,
    summary: 'From individual agents to a managed ecosystem',
    kicker: 'A CONTROL PLANE FOR THE AGENT FLEET.',
    text: 'As agents multiply across teams and platforms, oversight needs a wider view. Microsoft Agent 365 provides a central control plane, extending existing administration, identity, security and compliance capabilities.',
    caption: 'A wider control plane around a growing ecosystem.',
    detail: 'Microsoft and third-party agents, connected through supported integrations.',
    outcome: 'From one well-controlled agent to a managed fleet.',
  },
  {
    id: 'observe', title: 'Observe', color: 'azure', start: 40,
    summary: 'Discover agents and understand their activity',
    kicker: 'KNOW WHAT EXISTS. SEE WHAT IT IS DOING.',
    text: 'Bring agents into a central registry and use supported telemetry to understand activity, relationships and performance. Visibility helps administrators identify ownership, adoption and emerging risks.',
    caption: 'Make the agent ecosystem visible.',
    detail: 'Inventory and activity signals support a shared operational view.',
    outcome: 'Visibility into agents, activity and ownership.',
  },
  {
    id: 'govern', title: 'Govern', color: 'cyan', start: 60,
    summary: 'Ownership, permissions and lifecycle oversight',
    kicker: 'KEEP ACCOUNTABILITY AS AGENTS GROW.',
    text: 'Use lifecycle actions, ownership and policy controls to manage agents from onboarding to retirement. Define who can use an agent and what it can access, with permissions and tooling kept within approved boundaries.',
    caption: 'Control the lifecycle, not just the launch.',
    detail: 'Accountable ownership, governed access and consistent lifecycle actions.',
    outcome: 'Accountability and control throughout the lifecycle.',
  },
  {
    id: 'secure', title: 'Secure', color: 'teal', start: 80,
    summary: 'Extend identity, threat and data protection',
    kicker: 'BUILD ON THE SECURITY PLATFORM YOU HAVE.',
    text: 'Extend agent identity and access controls with Entra, threat detection with Defender, and data protection and auditing with Purview. Apply the supported controls for each agent, its data and its operating environment.',
    caption: 'Agent 365 extends your existing security capabilities.',
    detail: 'Identity, threats and data protection - with configuration, not guarantees.',
    outcome: 'Protection matched to the agent and its environment.',
  },
  {
    id: 'complete', title: 'The complete picture', color: 'violet', start: 100,
    summary: 'Intelligence for each agent. Control across the fleet.',
    kicker: 'YOUR PEOPLE. YOUR AGENTS. YOUR IQ. YOUR CONTROL.',
    text: 'Bring the story together: agents use relevant IQ context, security and governance provide controls, and Agent 365 gives the organisation a fleet-level view to observe, govern and secure its agent ecosystem.',
    caption: 'Intelligence for each agent. Control across the fleet.',
    detail: 'Microsoft IQ + security and governance + Microsoft Agent 365.',
    outcome: 'The complete picture: intelligence with observability and control.',
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
