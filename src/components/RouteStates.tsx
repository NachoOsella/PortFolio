import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { LinkButton } from './ui';

export function NotFound() {
  return (
    <main className="not-found page-shell">
      <FileQuestion size={28} />
      <p className="kicker">404 / not found</p>
      <h1>That page is not in the archive.</h1>
      <p>The link may be out of date, or the file has not been published yet.</p>
      <LinkButton to="/">Return home</LinkButton>
    </main>
  );
}
export function ContentError({
  message = 'This content could not be loaded.',
}: {
  message?: string;
}) {
  return (
    <div className="content-error">
      <p>{message}</p>
      <Link to="/">
        Return to the home page <ArrowLeft size={14} />
      </Link>
    </div>
  );
}
