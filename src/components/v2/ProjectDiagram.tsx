const projectSignals: Record<string, [string, string, string]> = {
  'modular-erp': ['Inventory', 'People', 'Orders'],
  lembas: ['Classes', 'Resources', 'Progress'],
  'el-brasero': ['Menu', 'Kitchen', 'Pickup'],
  'clutch-studio': ['Stories', 'Bookings', 'Delivery'],
  'dotfiles-manager': ['Track', 'Sync', 'Restore'],
  'starship-simulation': ['Routes', 'Signals', 'Decisions'],
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
