export function SignatureMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Ignacio Osella construction mark"
      focusable="false"
    >
      <path
        d="M14 6H6v8M50 6h8v8M58 50v8h-8M14 58H6v-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="square"
      />
      <path d="M12 17h8v30h-8z" fill="currentColor" />
      <circle cx="41" cy="32" r="13" fill="none" stroke="currentColor" strokeWidth="5.5" />
    </svg>
  );
}
