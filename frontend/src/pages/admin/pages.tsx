import { ContentList } from './shared';

export function AdminPages() {
  return (
    <ContentList
      collection="pages"
      title="Pages"
      description="Static pages that keep the public site grounded."
      newLabel="New page"
    />
  );
}