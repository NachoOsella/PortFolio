const visualMeta = {
  'modular-erp': {
    code: 'ERP',
    label: 'Modular business system',
    words: ['Inventory', 'People', 'Orders'],
    color: 'yellow',
  },
  lembas: {
    code: 'LE',
    label: 'Academic workspace',
    words: ['Classes', 'Focus', 'Momentum'],
    color: 'blue',
  },
  'el-brasero': {
    code: 'EB',
    label: 'Ordering experience',
    words: ['Menu', 'Kitchen', 'Pickup'],
    color: 'orange',
  },
  'clutch-studio': {
    code: 'CS',
    label: 'Creative production',
    words: ['Films', 'Bookings', 'Stories'],
    color: 'aqua',
  },
  'dotfiles-manager': {
    code: 'DF',
    label: 'Developer tooling',
    words: ['Track', 'Sync', 'Restore'],
    color: 'gray',
  },
  'starship-simulation': {
    code: 'SS',
    label: 'Fleet simulation',
    words: ['Routes', 'Signals', 'Decisions'],
    color: 'purple',
  },
} as const;

export function ContentVisual({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const meta = visualMeta[slug as keyof typeof visualMeta] ?? {
    code: 'IO',
    label: 'Selected work',
    words: ['Build', 'Learn', 'Refine'],
    color: 'yellow',
  };

  const sequence = [...meta.words, ...meta.words];

  return (
    <div
      className={`content-visual visual-${meta.color} ${compact ? 'visual-compact' : ''}`}
      aria-label={`${meta.label} project artwork`}
    >
      <span className="visual-label">{meta.label}</span>
      <strong className="visual-code" aria-hidden="true">
        {meta.code}
      </strong>
      <div className="visual-track" aria-hidden="true">
        {sequence.map((word, index) => (
          <span key={`${word}-${index}`}>{word}</span>
        ))}
      </div>
      <span className="visual-rule" aria-hidden="true" />
    </div>
  );
}
