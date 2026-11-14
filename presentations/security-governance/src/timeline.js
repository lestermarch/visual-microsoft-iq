export const DURATION = 120;

export const chapters = [
  {
    id: 'entra', title: 'Microsoft Entra', color: 'blue',
    summary: 'Identity, access and least privilege',
    kicker: 'THE RIGHT IDENTITY. THE RIGHT ACCESS.',
    text: 'Manage identities and access for people, applications and workloads. Use authentication, Conditional Access and least-privilege policies to control access to resources.',
    start: 0,
    caption: 'Identity is the starting point for trust.',
    detail: 'Control who can access which resources, and under what conditions.',
    outcome: 'Identity & access',
  },
  {
    id: 'purview', title: 'Microsoft Purview', color: 'cyan',
    summary: 'Data security, governance and compliance',
    kicker: 'UNDERSTAND YOUR DATA. PROTECT ITS USE.',
    text: 'Discover and classify data, apply sensitivity labels and data loss prevention policies, and support compliance across supported data sources and applications.',
    start: 24,
    caption: 'Give intelligence context, without losing control of data.',
    detail: 'Data classification, protection and compliance across supported surfaces.',
    outcome: 'Data governance',
  },
  {
    id: 'defender', title: 'Microsoft Defender', color: 'blue',
    summary: 'Threat protection across your environment',
    kicker: 'DETECT THREATS. COORDINATE RESPONSE.',
    text: 'Protect endpoints, identities, email, applications and cloud workloads. Defender services detect threats; Defender XDR correlates signals into incidents for investigation and response.',
    start: 48,
    caption: 'Protect the environment your agents depend on.',
    detail: 'Threat signals, correlated incidents and coordinated response.',
    outcome: 'Threat protection',
  },
  {
    id: 'sentinel', title: 'Microsoft Sentinel', color: 'violet',
    summary: 'Security analytics, investigation and response',
    kicker: 'CONNECT SIGNALS. SEE THE BIGGER PICTURE.',
    text: 'Bring Microsoft and third-party security telemetry together. Use SIEM analytics to detect and investigate threats, and automate supported response workflows.',
    start: 72,
    caption: 'Turn security signals into actionable understanding.',
    detail: 'Cross-environment visibility, investigation and response automation.',
    outcome: 'Security operations',
  },
  {
    id: 'intune', title: 'Microsoft Intune', color: 'teal',
    summary: 'Device compliance and application protection',
    kicker: 'MANAGE THE ENDPOINTS PEOPLE USE.',
    text: 'Manage devices and applications, assess device compliance, and apply configuration and app protection policies. Device posture can inform Entra access decisions.',
    start: 96,
    caption: 'The agent, the intelligence and the environment, together.',
    detail: 'Existing security and governance capabilities, applied where supported.',
    outcome: 'Device & app management',
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
