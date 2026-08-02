export function SignatureMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 44"
      role="img"
      aria-label="Ignacio Osella signature mark"
    >
      <rect x="1" y="1" width="42" height="42" rx="2" fill="none" stroke="currentColor" />
      <path d="M11 31V13h5v18h-5Z" fill="currentColor" />
      <path
        d="M27.5 12.5a9.5 9.5 0 1 1-7.8 15l4-2.8a4.7 4.7 0 1 0 3.8-7.4c-1 0-1.9.3-2.7.8l-2.9-3.9a9.3 9.3 0 0 1 5.6-1.7Z"
        fill="currentColor"
      />
      <path d="m20 10 4 4-4 4v-8Z" fill="var(--signature-accent, #fabd2f)" />
    </svg>
  );
}
