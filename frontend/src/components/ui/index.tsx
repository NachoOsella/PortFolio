import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type ComponentProps,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { Check, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge as ShadcnBadge } from './badge';
import { Button as ShadcnButton } from './button';
import { Empty as ShadcnEmpty } from './empty';
import { Input as ShadcnInput } from './input';
import { Skeleton as ShadcnSkeleton } from './skeleton';
import { Textarea as ShadcnTextarea } from './textarea';
import { Label } from './label';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type WrappedButtonProps = Omit<ComponentProps<typeof ShadcnButton>, 'variant' | 'size' | 'className'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const buttonVariants = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost',
  danger: 'destructive',
} as const;

const buttonSizes = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
} as const;

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: WrappedButtonProps) {
  return (
    <ShadcnButton
      variant={buttonVariants[variant]}
      size={buttonSizes[size]}
      className={cn(`button button-${variant} button-${size}`, className)}
      {...props}
    />
  );
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <ShadcnButton
      variant={buttonVariants[variant]}
      size={buttonSizes[size]}
      className={cn(`button button-${variant} button-${size}`, className)}
      render={<Link {...props} />}
    >
      {children}
    </ShadcnButton>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}) {
  const variants = {
    neutral: 'outline',
    accent: 'default',
    success: 'secondary',
    warning: 'outline',
    danger: 'destructive',
  } as const;

  return (
    <ShadcnBadge variant={variants[tone]} className={`badge badge-${tone}`}>
      {children}
    </ShadcnBadge>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <ShadcnInput ref={ref} className={cn('field', className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <ShadcnTextarea ref={ref} className={cn('field textarea', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export function Field({
  label,
  error,
  hint,
  children,
  controlId,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  controlId?: string;
}) {
  const generatedId = useId();
  const resolvedControlId = controlId ?? generatedId;
  const descriptionId = hint || error ? `${generatedId}-description` : undefined;
  const controlElement = isValidElement(children)
    ? children as ReactElement<Record<string, unknown>>
    : null;
  const control = controlElement && !controlId
    ? cloneElement(controlElement, {
        id: controlElement.props.id ?? resolvedControlId,
        'aria-describedby': controlElement.props['aria-describedby'] ?? descriptionId,
        'aria-invalid': controlElement.props['aria-invalid'] ?? Boolean(error),
      })
    : children;

  return (
    <div className="field-wrap">
      <Label className="field-label" htmlFor={resolvedControlId}>{label}</Label>
      {control}
      {hint && !error && <span id={descriptionId} className="field-hint">{hint}</span>}
      {error && (
        <span id={descriptionId} className="field-error" aria-live="polite">
          {error}
        </span>
      )}
    </div>
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
    <div className="search-field" role="search">
      <Search size={17} aria-hidden="true" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="search-clear"
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          <X size={15} aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="loading-state" aria-live="polite" aria-label={label}>
      <span className="loading-label">{label}</span>
      <ShadcnSkeleton className="loading-line loading-line-wide" aria-hidden="true" />
      <ShadcnSkeleton className="loading-line" aria-hidden="true" />
      <ShadcnSkeleton className="loading-line loading-line-short" aria-hidden="true" />
    </div>
  );
}

export function SaveState({ saved }: { saved: boolean }) {
  return (
    <ShadcnBadge variant="ghost" className={cn('save-state', saved && 'is-saved')}>
      {saved && <Check size={14} aria-hidden="true" />}
      {saved ? 'Saved' : 'Unsaved changes'}
    </ShadcnBadge>
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
    <ShadcnEmpty className="empty-state">
      <div className="empty-mark" aria-hidden="true">+</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </ShadcnEmpty>
  );
}

export function StatusDot({
  tone = 'blue',
}: {
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'muted';
}) {
  return <span className={`status-dot status-${tone}`} aria-hidden="true" />;
}
