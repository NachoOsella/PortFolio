import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contentRepository } from '@/repositories/contentRepository';
import { gitRepository } from '@/repositories/gitRepository';
import type { ContentQuery, CreateContentFileInput, ImportMarkdownFileInput } from '@/types';

export function useContentFiles(query?: ContentQuery) {
  return useQuery({
    queryKey: ['content-files', query],
    queryFn: () => contentRepository.listFiles(query),
  });
}
export function useContentFile(path?: string) {
  return useQuery({
    queryKey: ['content-file', path],
    queryFn: () => contentRepository.getFile(path!),
    enabled: Boolean(path),
  });
}
export function useCreateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContentFileInput) => contentRepository.createFile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content-files'] }),
  });
}
export function useImportContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ImportMarkdownFileInput) => contentRepository.importFile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content-files'] }),
  });
}
export function useGitStatus() {
  return useQuery({ queryKey: ['git-status'], queryFn: () => gitRepository.getStatus() });
}
export function useGitHistory() {
  return useQuery({ queryKey: ['git-history'], queryFn: () => gitRepository.getHistory() });
}
export function useGitAction<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['git-status'] });
      queryClient.invalidateQueries({ queryKey: ['git-history'] });
      queryClient.invalidateQueries({ queryKey: ['content-files'] });
    },
  });
}
