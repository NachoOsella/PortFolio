export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Ignacio Osella monogram"
    >
      <rect width="48" height="48" fill="currentColor" />
      <rect x="11" y="10" width="7" height="28" fill="var(--mark-cut, #f4f4ef)" />
      <path
        d="M28 10h1c6.1 0 11 4.9 11 11v6c0 6.1-4.9 11-11 11h-1c-4.4 0-8-3.6-8-8V18c0-4.4 3.6-8 8-8Zm1.5 7A2.5 2.5 0 0 0 27 19.5v9a2.5 2.5 0 0 0 2.5 2.5h.5a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3h-.5Z"
        fill="var(--mark-cut, #f4f4ef)"
      />
    </svg>
  );
}
