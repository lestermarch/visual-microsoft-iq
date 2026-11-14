import { chapters as overviewChapters } from '../presentations/iq-overview/src/timeline.js';
import { chapters as workChapters } from '../presentations/work-iq/src/timeline.js';
import { chapters as fabricChapters } from '../presentations/fabric-iq/src/timeline.js';
import { chapters as foundryChapters } from '../presentations/foundry-iq/src/timeline.js';
import { chapters as webChapters } from '../presentations/web-iq/src/timeline.js';
import { chapters as securityChapters } from '../presentations/security-governance/src/timeline.js';

export const presentations = [
  { id: 'iq-overview', title: 'Overview', color: 'azure', chapters: overviewChapters },
  { id: 'work-iq', title: 'Work IQ', color: 'azure', chapters: workChapters },
  { id: 'fabric-iq', title: 'Fabric IQ', color: 'green', chapters: fabricChapters },
  { id: 'foundry-iq', title: 'Foundry IQ', color: 'violet', chapters: foundryChapters },
  { id: 'web-iq', title: 'Web IQ', color: 'cyan', chapters: webChapters },
  { id: 'security-governance', title: 'Security', color: 'violet', chapters: securityChapters },
];

export const steps = presentations.flatMap((presentation) =>
  presentation.chapters.map((chapter, chapterIndex) => ({
    presentation,
    chapterIndex,
    title: chapter.title,
  })),
);
