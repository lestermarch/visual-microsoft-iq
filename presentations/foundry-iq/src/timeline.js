export const DURATION = 120;
export const chapters = [
  {
    title: 'Connect knowledge sources',
    kicker: 'INDEXED OR REMOTE. ONE KNOWLEDGE LAYER.',
    summary: 'SharePoint, OneLake, files, and search indexes',
    text: 'Define named knowledge sources over your enterprise content. Indexed sources prepare searchable content; remote sources query supported systems in place.',
    start: 0,
    color: 'blue',
    icon: 'sources',
    caption: 'Start with knowledge, wherever it lives.',
    detail: 'A knowledge source is a connection, not a knowledge base.',
  },
  {
    title: 'Extract & chunk',
    kicker: 'FROM WHOLE DOCUMENTS TO USEFUL PASSAGES',
    summary: 'Extract content. Preserve context. Split into chunks.',
    text: 'For indexed content, extract text and structure, then split it into retrievable passages. Keep source references and metadata alongside each chunk.',
    start: 20,
    color: 'cyan',
    icon: 'extract',
    caption: 'Turn documents into retrievable passages.',
    detail: 'Keep the context and a route back to the original source.',
  },
  {
    title: 'Embed & index',
    kicker: 'REPRESENT MEANING IN MANY DIMENSIONS',
    summary: 'Embeddings, text, and metadata in a search index',
    text: 'Embed each chunk as a high-dimensional vector and index it with text and metadata. Similar meanings become nearby vectors; this is a simplified 3D view.',
    start: 40,
    color: 'violet',
    icon: 'embed',
    caption: 'Different words. Similar meaning. Nearby vectors.',
    detail: 'Many-dimensional embeddings, illustrated in three dimensions.',
  },
  {
    title: 'Bundle into knowledge bases',
    kicker: 'COMPOSE ONCE. REUSE ACROSS AGENTS.',
    summary: 'Multiple sources. One reusable retrieval endpoint.',
    text: 'Reference indexed and remote knowledge sources in a knowledge base. Share its retrieval configuration and endpoint across agents, without rebuilding each pipeline.',
    start: 60,
    color: 'violet',
    icon: 'bundle',
    caption: 'A knowledge base brings the sources together.',
    detail: 'One shared retrieval configuration. Multiple agents.',
  },
  {
    title: 'Retrieve by meaning',
    kicker: 'FROM A QUESTION TO RELEVANT EVIDENCE',
    summary: 'Query embedding, nearest neighbours, relevant chunks',
    text: 'Embed a query to find semantically similar passages. Foundry IQ can also plan subqueries, search multiple sources, and combine hybrid search with reranking.',
    start: 80,
    color: 'teal',
    icon: 'retrieve',
    caption: '"Away from the office" finds "remote working".',
    detail: 'Similarity finds meaning beyond an exact keyword match.',
  },
  {
    title: 'Ground agents in evidence',
    kicker: 'PERMISSION-AWARE CONTEXT. TRACEABLE SOURCES.',
    summary: 'Authorized passages, citations, and shared context',
    text: 'Apply supported, configured access controls for the caller. Return relevant passages with source citations so agents can ground responses in authorized evidence.',
    start: 100,
    color: 'teal',
    icon: 'evidence',
    caption: 'Give agents evidence, not just more text.',
    detail: 'Relevant passages. Traceable sources. Authorized context.',
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
