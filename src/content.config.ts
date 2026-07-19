import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const CATEGORY_IDS = ['geography', 'computer-science', 'geocomputing'] as const;

const referenceSchema = z.object({
  title: z.string(),
  url: z.string().url()
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    category: z.enum(CATEGORY_IDS),
    subcategory: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    series: z.string().optional(),
    featured: z.boolean().default(false),
    readingTime: z.number().int().positive().optional(),
    references: z.array(referenceSchema).optional()
  })
});

export const collections = { posts };
