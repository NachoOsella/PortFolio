import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { ArrowUpRight, Check, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <button className={`button button-${variant} button-${size} ${className}`} {...props}>
      {children}
    </button>
  );
}
export function LinkButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: React.ComponentProps<typeof Link> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <Link className={`button button-${variant} button-${size} ${className}`} {...props}>
      {children}
    </Link>
  );
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function Kicker({ children }: { children: ReactNode }) {
  return <p className="kicker">{children}</p>;
}
export function SectionHeading({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {kicker && <Kicker>{kicker}</Kicker>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function ArrowLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="arrow-link" to={to}>
      {children}
      <ArrowUpRight size={15} strokeWidth={1.8} />
    </Link>
  );
}
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input ref={ref} className={`field ${className}`} {...props} />
  ),
);
Input.displayName = 'Input';
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }, ref) => (
  <textarea ref={ref} className={`field textarea ${className}`} {...props} />
));
Textarea.displayName = 'Textarea';
export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field-wrap">
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder = 'Search',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-field">
      <Search size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange('')}>
          <X size={15} />
        </button>
      )}
    </div>
  );
}
export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="loading-state" aria-live="polite" aria-label={label}>
      <span className="loading-label">{label}</span>
      <span className="loading-line loading-line-wide" aria-hidden="true" />
      <span className="loading-line" aria-hidden="true" />
      <span className="loading-line loading-line-short" aria-hidden="true" />
    </div>
  );
}
export function SaveState({ saved }: { saved: boolean }) {
  return (
    <span className={`save-state ${saved ? 'is-saved' : ''}`}>
      {saved && <Check size={14} />}
      {saved ? 'Saved' : 'Unsaved changes'}
    </span>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-mark">+</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function StatusDot({
  tone = 'blue',
}: {
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'muted';
}) {
  return <span className={`status-dot status-${tone}`} aria-hidden="true" />;
}
