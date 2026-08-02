import { useQuery } from '@tanstack/react-query';
import { contentRepository } from '@/repositories/contentRepository';
import { isPubliclyVisible } from '@/lib/content';
import type { BlogPostFrontmatter, MarkdownDocument, ProjectFrontmatter } from '@/types';

export function usePublicDocuments(collection: 'projects' | 'posts' | 'pages') {
  return useQuery({
    queryKey: ['public-documents', collection],
    queryFn: async () => {
      const summaries = await contentRepository.listFiles({ collection });
      const documents = await Promise.all(
        summaries.map((summary) => contentRepository.getFile(summary.path)),
      );
      return documents.filter((document) => isPubliclyVisible(document.frontmatter));
    },
  });
}
export function usePublicProject(slug?: string) {
  const query = usePublicDocuments('projects');
  return {
    ...query,
    data: query.data?.find((document) => document.frontmatter.slug === slug) as
      MarkdownDocument<ProjectFrontmatter> | undefined,
  };
}
export function usePublicPost(slug?: string) {
  const query = usePublicDocuments('posts');
  return {
    ...query,
    data: query.data?.find((document) => document.frontmatter.slug === slug) as
      MarkdownDocument<BlogPostFrontmatter> | undefined,
  };
}
export function usePublicPage(slug: string) {
  const query = usePublicDocuments('pages');
  return { ...query, data: query.data?.find((document) => document.frontmatter.slug === slug) };
}
