import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME } from '@config/site';
import type { APIContext } from 'astro';

const STAGES = {
  seedling: { label: 'Graines 🌱', description: 'Notes en germe : notes fraîches à peine esquissées.' },
  budding:  { label: 'Pousses 🌿', description: 'Notes en développement.' },
  evergreen: { label: 'Arbres 🌳', description: 'Notes matures, solides, durables et interconnectées.' },
} as const;

type Stage = keyof typeof STAGES;

export function getStaticPaths() {
  return Object.keys(STAGES).map((stage) => ({ params: { stage } }));
}

export async function GET(context: APIContext) {
  const stage = context.params.stage as Stage;
  const { label, description } = STAGES[stage];

  const notes = await getCollection(
    'notes',
    ({ data }) => data.publish !== false && data.stage === stage,
  );

  notes.sort((a, b) => b.data.update.getTime() - a.data.update.getTime());

  return rss({
    title: `${SITE_NAME} · ${label}`,
    description,
    site: context.site!,
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.update,
      description: note.data.description,
      link: `/notes/${note.id}`,
    })),
  });
}
