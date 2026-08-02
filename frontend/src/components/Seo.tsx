import { useEffect } from 'react';
import { metadata } from '@/app/metadata';

export function Seo({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path?: string;
}) {
  useEffect(() => {
    document.title = `${title} | ${metadata.name}`;
    const descriptionNode = document.querySelector('meta[name="description"]');
    if (descriptionNode) descriptionNode.setAttribute('content', description);
    const canonical = document.querySelector('link[rel="canonical"]') ?? document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', `${window.location.origin}${path ?? window.location.pathname}`);
    if (!canonical.parentNode) document.head.appendChild(canonical);
    return () => {
      // Reset every clinic field so pages without <Seo/> (404, admin) do not
      // inherit the previous route's title, description, or canonical URL.
      document.title = `${metadata.name} | ${metadata.role}`;
      if (descriptionNode) descriptionNode.setAttribute('content', metadata.description);
      document.querySelector('link[rel="canonical"]')?.remove();
    };
  }, [description, path, title]);
  return null;
}