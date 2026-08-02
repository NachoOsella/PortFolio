import { ContentList } from './shared';

export function AdminPosts() {
  return (
    <ContentList
      collection="posts"
      title="Blog posts"
      description="Technical notes, drafts, and editorial history."
      newLabel="New post"
    />
  );
}