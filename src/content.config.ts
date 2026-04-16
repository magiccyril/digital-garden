import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z
    .object({
      title: z.string(),
      date: z.coerce.date(),
      update: z.coerce.date().optional(),
      stage: z.enum(['seedling', 'budding', 'evergreen']).default('seedling'),
      tags: z.array(z.string()).default([]),
      // Seules les notes avec publish: true apparaissent en prod
      publish: z.boolean().default(false),
      description: z.string().optional(),
    })
    .transform((data) => ({
      ...data,
      update: data.update ?? data.date,
    })),
});

export const collections = { notes };
