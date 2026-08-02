import { ContentList } from './shared';

export function AdminProjects() {
  return (
    <ContentList
      collection="projects"
      title="Projects"
      description="Case studies and product experiments in Markdown."
      newLabel="New project"
    />
  );
}