const projectSignals: Record<string, [string, string, string]> = {
  lembas: ['Catalog', 'Stock', 'Orders'],
  planai: ['Chat', 'Plan', 'Tasks'],
  gruvboxitator: ['Pixels', 'Palette', 'Presets'],
  'java-logic-trainer': ['Exercises', 'Tests', 'Progress'],
  portfolio: ['Markdown', 'Studio', 'Publish'],
};

export function ProjectDiagram({ slug, title }: { slug: string; title: string }) {
  const signals = projectSignals[slug] ?? ['Input', 'System', 'Output'];
  const monogram = title
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  return (
    <div className="v2-project-diagram" aria-hidden="true">
      <i className="v2-diagram-axis v2-diagram-axis-x" />
      <i className="v2-diagram-axis v2-diagram-axis-y" />
      <strong>{monogram}</strong>
      {signals.map((signal, index) => (
        <span key={signal} className={`v2-diagram-node v2-diagram-node-${index + 1}`}>
          {signal}
        </span>
      ))}
    </div>
  );
}
