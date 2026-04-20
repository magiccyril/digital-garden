import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME } from '@config/site';
import { slugify } from '@utils/strings';
import type { APIContext } from 'astro';

export async function getStaticPaths() {
  const notes = await getCollection('notes', ({ data }) => data.publish !== false);
  const tags = [...new Set(notes.flatMap((n) => n.data.tags))];

  return tags.map((tag) => ({ params: { tag: slugify(tag) }, props: { label: tag } }));
}

export async function GET(context: APIContext & { props: { label: string } }) {
  const { tag } = context.params;
  const { label } = context.props;

  const notes = await getCollection(
    'notes',
    ({ data }) => data.publish !== false && data.tags.some((t) => slugify(t) === tag),
  );

  notes.sort((a, b) => b.data.update.getTime() - a.data.update.getTime());

  return rss({
    title: `${SITE_NAME} · #${label}`,
    description: `Notes du jardin taguées #${label}.`,
    site: context.site!,
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.update,
      description: note.data.description,
      link: `/notes/${note.id}`,
    })),
  });
}
