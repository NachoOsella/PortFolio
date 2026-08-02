import { useEffect } from 'react';

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
    document.title = `${title} | Ignacio Osella`;
    const descriptionNode = document.querySelector('meta[name="description"]');
    if (descriptionNode) descriptionNode.setAttribute('content', description);
    const canonical =
      document.querySelector('link[rel="canonical"]') ?? document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', `${window.location.origin}${path ?? window.location.pathname}`);
    if (!canonical.parentNode) document.head.appendChild(canonical);
    return () => {
      document.title = 'Ignacio Osella | Full-stack developer';
    };
  }, [description, path, title]);
  return null;
}
