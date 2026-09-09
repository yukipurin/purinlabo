import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// お知らせと開発記録。src/content/log/ に .md を置くと記事が生える。
// kind でお知らせと開発記録を分ける（一覧で並べ分けるため）。
const log = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/log' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    kind: z.enum(['news', 'devlog']).default('devlog'),
    summary: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { log };
