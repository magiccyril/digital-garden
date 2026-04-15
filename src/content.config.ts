import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    stage: z.enum(['seedling', 'budding', 'evergreen']),
    tags: z.array(z.string()).default([]),
    // Seules les notes avec publish: true apparaissent en prod
    publish: z.boolean().default(false),
    description: z.string().optional(),
  }),
});

export const collections = { notes };
