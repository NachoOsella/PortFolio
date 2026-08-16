import { lazy, Suspense } from 'react';
import { SignatureMark } from '@/components/SignatureMark';
import { ContentError } from '@/components/RouteStates';
import { Seo } from '@/components/Seo';
import { LoadingState } from '@/components/ui';
import { usePublicPage } from '@/hooks/usePublicContent';
import { createRevision } from '@/lib/archive';

const MarkdownRenderer = lazy(() =>
  import('@/components/MarkdownRenderer').then((module) => ({ default: module.MarkdownRenderer })),
);
const TableOfContents = lazy(() =>
  import('@/components/MarkdownRenderer').then((module) => ({ default: module.TableOfContents })),
);

function splitMarkdownSections(content: string) {
  const headings = [...content.matchAll(/^##\s+.+$/gm)];
  if (!headings.length) return [content];

  return headings.map((heading, index) => {
    const start = heading.index ?? 0;
    const end = headings[index + 1]?.index ?? content.length;
    return content.slice(start, end).trim();
  });
}

export function AboutPage() {
  const { data: page, isLoading } = usePublicPage('about');
  if (isLoading) {
    return <div className="v2-shell v2-page-top v2-state-wrap"><LoadingState label="Loading about page" /></div>;
  }
  if (!page) {
    return <div className="v2-shell v2-page-top v2-state-wrap"><ContentError /></div>;
  }

  const sections = splitMarkdownSections(page.body);
  const profileSection = sections[0] ?? page.body;
  const detailSections = sections.slice(1);

  return (
    <div className="v2-about v2-page-top">
      <Seo title="About" description={page.frontmatter.description} path="/about" />
      <div className="v2-shell">
        <header className="v2-about-profile-header">
          <div className="v2-about-profile-copy">
            <p className="v2-label">About Ignacio</p>
            <h1>Ignacio<br />Osella.</h1>
            <p className="v2-about-profile-lead">{page.frontmatter.description}</p>
            <dl className="v2-about-profile-meta">
              <div>
                <dt>Based in</dt>
                <dd>Córdoba, Argentina</dd>
              </div>
              <div>
                <dt>Works across</dt>
                <dd>Dependable backend systems, delivered end to end</dd>
              </div>
            </dl>
          </div>
          <section className="v2-about-profile-field" aria-label="About me">
            <span className="v2-about-field-label">01 / About me</span>
            <Suspense fallback={<LoadingState label="Preparing profile" />}>
              <MarkdownRenderer content={profileSection} />
            </Suspense>
            <SignatureMark className="v2-about-profile-mark" />
          </section>
        </header>

        <div className="v2-about-body">
          <aside className="v2-about-body-nav">
            <Suspense fallback={null}><TableOfContents content={page.body} /></Suspense>
          </aside>
          <div className="v2-about-sections">
            {detailSections.map((section, index) => (
              <article className="v2-about-section" key={section}>
                <span className="v2-about-section-number">{String(index + 2).padStart(2, '0')}</span>
                <Suspense fallback={<LoadingState label="Preparing section" />}>
                  <MarkdownRenderer content={section} />
                </Suspense>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ slug }: { slug: string }) {
  const { data: page, isLoading } = usePublicPage(slug);
  if (isLoading) {
    return <div className="v2-shell v2-page-top v2-state-wrap"><LoadingState label={`Loading ${slug} page`} /></div>;
  }
  if (!page) {
    return <div className="v2-shell v2-page-top v2-state-wrap"><ContentError /></div>;
  }

  return (
    <div className="v2-static v2-page-top">
      <Seo title={page.frontmatter.title} description={page.frontmatter.description} path={`/${slug}`} />
      <div className="v2-shell">
        <header className="v2-page-header">
          <p className="v2-label">OS–D / {createRevision(page.frontmatter.updatedAt)}</p>
          <h1>{page.frontmatter.title}</h1>
          <p>{page.frontmatter.description}</p>
        </header>
        <div className="v2-reading-layout">
          <aside className="v2-reading-rail">
            <Suspense fallback={null}><TableOfContents content={page.body} /></Suspense>
          </aside>
          <Suspense fallback={<LoadingState label={`Preparing ${slug} page`} />}><MarkdownRenderer content={page.body} /></Suspense>
        </div>
      </div>
    </div>
  );
}