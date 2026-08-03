import { Link, useRouteError } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, FileQuestion, RefreshCw } from 'lucide-react';
import { LinkButton } from './ui';

export function NotFound() {
  return (
    <div className="v2-app v2-error-app">
      <main className="v2-shell v2-not-found">
        <FileQuestion size={28} aria-hidden="true" />
        <p className="v2-label">404 / not found</p>
        <h1>That page is not in the archive.</h1>
        <p>The link may be out of date, or the file has not been published yet.</p>
        <LinkButton to="/">Return home</LinkButton>
      </main>
    </div>
  );
}
export function ApplicationError() {
  const error = useRouteError();
  const isStaleAsset = error instanceof Error && error.message.includes('dynamically imported module');

  return (
    <div className="v2-app v2-error-app">
      <main className="v2-shell v2-not-found">
        <AlertTriangle size={28} aria-hidden="true" />
        <p className="v2-label">500 / workspace error</p>
        <h1>{isStaleAsset ? 'A newer version is available.' : 'This page could not be loaded.'}</h1>
        <p>
          {isStaleAsset
            ? 'The browser has an older page bundle. Reload to use the current version.'
            : 'Something interrupted the page while it was loading. Try again.'}
        </p>
        <button className="v2-error-reload" type="button" onClick={() => window.location.reload()}>
          Reload page <RefreshCw size={14} />
        </button>
      </main>
    </div>
  );
}

export function ContentError({
  message = 'This content could not be loaded.',
}: {
  message?: string;
}) {
  return (
    <div className="v2-content-error">
      <p>{message}</p>
      <Link to="/">
        Return to the home page <ArrowLeft size={14} />
      </Link>
    </div>
  );
}
