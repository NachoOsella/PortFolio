import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { contentRepository } from '@/repositories/contentRepository';
import { isPubliclyVisible } from '@/lib/content';
import type { ContentCollection, MarkdownDocument, PageDocument, PostDocument, ProjectDocument } from '@/types';

export function usePublicDocuments(
  collection: ContentCollection,
): UseQueryResult<MarkdownDocument[]> {
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

// Typed list hooks so pages avoid per-call casts. The mock repository returns
// documents already narrowed to the collection's frontmatter at runtime.
export function usePublicProjects(): UseQueryResult<ProjectDocument[]> {
  return usePublicDocuments('projects') as UseQueryResult<ProjectDocument[]>;
}
export function usePublicPosts(): UseQueryResult<PostDocument[]> {
  return usePublicDocuments('posts') as UseQueryResult<PostDocument[]>;
}
export function usePublicPages(): UseQueryResult<PageDocument[]> {
  return usePublicDocuments('pages') as UseQueryResult<PageDocument[]>;
}

export function usePublicProject(slug?: string) {
  const query = usePublicProjects();
  return {
    ...query,
    data: query.data?.find((document) => document.frontmatter.slug === slug),
  };
}
export function usePublicPost(slug?: string) {
  const query = usePublicPosts();
  return {
    ...query,
    data: query.data?.find((document) => document.frontmatter.slug === slug),
  };
}
export function usePublicPage(slug: string) {
  const query = usePublicPages();
  return {
    ...query,
    data: query.data?.find((document) => document.frontmatter.slug === slug),
  };
}