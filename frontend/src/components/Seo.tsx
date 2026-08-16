import { useLocation } from 'react-router-dom';
import { metadata, siteUrl } from '@/app/metadata';

/**
 * Renders literal title/meta/link elements. React 19 hoists these elements
 * into <head> on both client and server, so the result is present in the
 * initial HTML (after prerendering) instead of being applied imperatively.
 */
export function Seo({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path?: string;
}) {
  const location = useLocation();
  const url = path ?? location.pathname;
  const fullTitle = `${title} | ${metadata.name}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content={url === '/' ? 'website' : 'article'} />
      <meta property="og:site_name" content={metadata.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${siteUrl}${url}`} />
      <meta property="og:image" content={`${siteUrl}/og-image.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
      <link rel="canonical" href={`${siteUrl}${url}`} />
    </>
  );
}