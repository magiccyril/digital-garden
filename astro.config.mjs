// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
// @ts-ignore — remark-wiki-link is a CommonJS package, types may be missing
import remarkWikiLink from 'remark-wiki-link';

// https://astro.build/config
export default defineConfig({
  site: 'https://18ruedivona.fr',
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [
      [
        remarkWikiLink,
        {
          // Maps [[note-slug]] → /notes/note-slug
          pageResolver: (name) => [name.toLowerCase().replace(/\s+/g, '-')],
          hrefTemplate: (permalink) => `/notes/${permalink}`,
          // Adds a CSS class so you can style unresolved links differently
          wikiLinkClassName: 'wiki-link',
          newClassName: 'wiki-link--new',
        },
      ],
    ],
  },
});
