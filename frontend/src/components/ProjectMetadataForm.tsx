import { X } from 'lucide-react';
import { slugify } from '@/lib/content';
import { Badge, Field, Input, Textarea } from './ui';
import type { InkTone, PublicationStatus } from '@/types';

type Metadata = Record<string, unknown>;
type MetadataChange = (key: string, value: unknown) => void;

const statusOptions: PublicationStatus[] = ['draft', 'published', 'scheduled', 'archived'];
const inkOptions: InkTone[] = ['yellow', 'blue', 'green', 'orange', 'purple', 'aqua'];
const projectTypeOptions = [
  'Full-stack thesis project',
  'AI-integrated full-stack application',
  'Frontend tool',
  'Neovim plugin',
  'Content platform',
  'Backend service',
  'Other',
];
const roleOptions = [
  'Backend engineer',
  'Backend engineer — frontend built with AI agents',
  'Backend-leaning full-stack developer',
  'Full-stack developer',
  'Design and engineering',
  'Author',
  'Other',
];
const durationOptions = ['1 week', '3 weeks', '1 month', '3 months, ongoing', 'Ongoing', 'Other'];
const technologyOptions = [
  'Java 17',
  'Java 21',
  'Spring Boot 3.3',
  'Spring Boot 3.4',
  'Spring Boot 3.5',
  'Spring Security',
  'Spring AI',
  'JPA/Hibernate',
  'Flyway',
  'Angular 21',
  'React 19',
  'TypeScript',
  'JavaScript',
  'Lua',
  'Neovim',
  'Vite',
  'Tailwind CSS 4',
  'shadcn/ui',
  'Canvas API',
  'PostgreSQL 16',
  'MySQL',
  'Maven',
  'JUnit 5',
  'Docker',
  'Caddy',
];

function textValue(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? '');
}

function listValue(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];
}

function withCurrentOption(options: string[], value: unknown) {
  const current = textValue(value);
  return current && !options.includes(current) ? [current, ...options] : options;
}

export function ProjectMetadataForm({
  data,
  valid,
  onChange,
}: {
  data: Metadata;
  valid: boolean;
  onChange: MetadataChange;
}) {
  const technologies = listValue(data.technologies);
  const availableTechnologies = [...new Set([...technologies, ...technologyOptions])];
  const availableProjectTypes = withCurrentOption(projectTypeOptions, data.projectType);
  const availableRoles = withCurrentOption(roleOptions, data.role);
  const availableDurations = withCurrentOption(durationOptions, data.duration);

  const addTechnology = (technology: string) => {
    if (!technology || technologies.includes(technology)) return;
    onChange('technologies', [...technologies, technology]);
  };
  const removeTechnology = (technology: string) => {
    onChange(
      'technologies',
      technologies.filter((item) => item !== technology),
    );
  };

  return (
    <section className="project-metadata-panel" aria-labelledby="project-metadata-heading">
      <header className="project-metadata-head">
        <div>
          <p className="metadata-kicker">Structured fields / projects</p>
          <h3 id="project-metadata-heading">Project metadata</h3>
          <p>Complete the fields here without editing YAML by hand.</p>
        </div>
        <Badge tone={valid ? 'success' : 'danger'}>
          {valid ? 'Valid metadata' : 'Needs attention'}
        </Badge>
      </header>

      <div className="project-metadata-grid">
        <div className="metadata-section-label">Identity</div>
        <Field label="Title">
          <Input
            value={textValue(data.title)}
            onChange={(event) => onChange('title', event.target.value)}
          />
        </Field>
        <Field label="Slug" hint="Lowercase words separated by hyphens.">
          <Input
            value={textValue(data.slug)}
            onChange={(event) => onChange('slug', slugify(event.target.value))}
          />
        </Field>
        <Field label="Description" hint="Used in project indexes and search previews.">
          <Textarea
            value={textValue(data.description)}
            onChange={(event) => onChange('description', event.target.value)}
          />
        </Field>

        <div className="metadata-section-label">Presentation</div>
        <Field label="Status">
          <select
            className="field"
            value={textValue(data.status || 'draft')}
            onChange={(event) => onChange('status', event.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </Field>
        <Field label="Presentation ink" hint="Color used by public project artwork.">
          <select
            className="field"
            value={textValue(data.ink)}
            onChange={(event) => onChange('ink', event.target.value || undefined)}
          >
            <option value="">Automatic fallback</option>
            {inkOptions.map((ink) => (
              <option key={ink} value={ink}>
                {ink}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Project type">
          <select
            className="field"
            value={textValue(data.projectType)}
            onChange={(event) => onChange('projectType', event.target.value)}
          >
            <option value="">Select a type</option>
            {availableProjectTypes.map((projectType) => (
              <option key={projectType}>{projectType}</option>
            ))}
          </select>
        </Field>
        <Field label="Role">
          <select
            className="field"
            value={textValue(data.role)}
            onChange={(event) => onChange('role', event.target.value)}
          >
            <option value="">Select a role</option>
            {availableRoles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </Field>
        <Field label="Duration">
          <select
            className="field"
            value={textValue(data.duration)}
            onChange={(event) => onChange('duration', event.target.value)}
          >
            <option value="">Select a duration</option>
            {availableDurations.map((duration) => (
              <option key={duration}>{duration}</option>
            ))}
          </select>
        </Field>
        <label className="metadata-checkbox">
          <input
            type="checkbox"
            checked={Boolean(data.featured)}
            onChange={(event) => onChange('featured', event.target.checked)}
          />
          <span>
            <strong>Featured project</strong>
            <small>Include this project in selected work.</small>
          </span>
        </label>

        <div className="metadata-section-label">Delivery</div>
        <div className="metadata-field-wide">
          <Field
            label="Technologies"
            hint="Choose from the available options. Remove a technology with the x control."
          >
            <select
              className="field"
              value=""
              onChange={(event) => addTechnology(event.target.value)}
            >
              <option value="">Add a technology</option>
              {availableTechnologies
                .filter((technology) => !technologies.includes(technology))
                .map((technology) => (
                  <option key={technology}>{technology}</option>
                ))}
            </select>
          </Field>
          <div className="metadata-values" aria-label="Selected technologies">
            {technologies.length === 0 ? (
              <span className="metadata-values-empty">No technologies selected.</span>
            ) : (
              technologies.map((technology) => (
                <span className="metadata-value" key={technology}>
                  {technology}
                  <button
                    type="button"
                    aria-label={`Remove ${technology}`}
                    onClick={() => removeTechnology(technology)}
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
        <Field label="Repository URL" hint="Optional public source repository.">
          <Input
            type="url"
            value={textValue(data.repositoryUrl)}
            onChange={(event) => onChange('repositoryUrl', event.target.value || undefined)}
            placeholder="https://github.com/..."
          />
        </Field>
        <Field label="Live URL" hint="Optional deployed project URL.">
          <Input
            type="url"
            value={textValue(data.liveUrl)}
            onChange={(event) => onChange('liveUrl', event.target.value || undefined)}
            placeholder="https://..."
          />
        </Field>
        <Field label="Published date">
          <Input
            type="date"
            value={textValue(data.publishedAt)}
            onChange={(event) => onChange('publishedAt', event.target.value || undefined)}
          />
        </Field>
        <Field label="Updated date">
          <Input
            type="date"
            value={textValue(data.updatedAt)}
            onChange={(event) => onChange('updatedAt', event.target.value)}
          />
        </Field>
        <Field label="Display order" hint="Lower numbers appear first.">
          <Input
            type="number"
            min="1"
            step="1"
            value={textValue(data.displayOrder)}
            onChange={(event) =>
              onChange('displayOrder', event.target.value ? Number(event.target.value) : undefined)
            }
          />
        </Field>
      </div>
    </section>
  );
}
