import { z } from 'zod';

export const publicationStatusSchema = z.enum(['draft', 'published', 'scheduled', 'archived']);
export const inkToneSchema = z.enum(['yellow', 'blue', 'green', 'orange', 'purple', 'aqua']);

const baseFrontmatter = {
  title: z.string().min(1, 'Title is required'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens'),
  description: z.string().min(1, 'Description is required'),
  status: publicationStatusSchema,
  ink: inkToneSchema.optional(),
  updatedAt: z.coerce.string(),
};

export const projectFrontmatterSchema = z
  .object({
    ...baseFrontmatter,
    projectType: z.string().min(1),
    role: z.string().min(1),
    duration: z.string().min(1),
    technologies: z.array(z.string()).min(1),
    featured: z.boolean(),
    repositoryUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    publishedAt: z.coerce.string().optional(),
    displayOrder: z.number().optional(),
  })
  .passthrough();

export const blogPostFrontmatterSchema = z
  .object({
    ...baseFrontmatter,
    category: z.string().min(1),
    tags: z.array(z.string()).min(1),
    publishedAt: z.coerce.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  })
  .passthrough();

export const pageFrontmatterSchema = z
  .object({
    ...baseFrontmatter,
  })
  .passthrough();

export function schemaForCollection(collection: 'projects' | 'posts' | 'pages') {
  if (collection === 'projects') return projectFrontmatterSchema;
  if (collection === 'posts') return blogPostFrontmatterSchema;
  return pageFrontmatterSchema;
}
