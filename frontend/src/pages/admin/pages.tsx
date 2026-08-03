import { ContentList } from './shared';

export function AdminPages() {
  return (
    <ContentList
      collection="pages"
      title="Other pages"
      description="Static pages beyond the dedicated About me section."
      newLabel="New page"
      excludeSlugs={['about']}
    />
  );
}
