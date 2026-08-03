export function createRecordCode(title: string, index = 0, prefix = 'P') {
  const initials = title
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 4)
    .toUpperCase();

  return initials.length >= 2 ? initials : `${prefix}-${String(index + 1).padStart(3, '0')}`;
}

export function createRevision(updatedAt?: string) {
  if (!updatedAt) return 'WORKING COPY';
  return `UPDATED ${updatedAt.slice(0, 10)}`;
}

const recordTones = ['yellow', 'blue', 'green', 'orange', 'purple', 'aqua'] as const;

export function getRecordTone(key: string, ink?: string) {
  if (ink && recordTones.includes(ink as (typeof recordTones)[number])) {
    return ink as (typeof recordTones)[number];
  }

  const hash = [...key].reduce((total, character) => total + character.charCodeAt(0), 0);
  return recordTones[hash % recordTones.length];
}

export function getRouteRecord(pathname: string) {
  if (pathname === '/') return { code: 'OS-INDEX', section: 'Portfolio index' };
  if (pathname.startsWith('/projects/')) return { code: 'OS-P', section: 'Project file' };
  if (pathname === '/projects') return { code: 'OS-P', section: 'Project register' };
  if (pathname.startsWith('/blog/')) return { code: 'OS-N', section: 'Technical note' };
  if (pathname === '/blog') return { code: 'OS-N', section: 'Notes register' };
  if (pathname === '/about') return { code: 'OS-A', section: 'Author record' };
  if (pathname === '/contact') return { code: 'OS-C', section: 'Correspondence' };
  if (pathname === '/login') return { code: 'OS-S', section: 'Private studio' };
  return { code: 'OS-D', section: 'Document' };
}
