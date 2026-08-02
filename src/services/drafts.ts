import { safeStorage } from '@/lib/storage';

const PREFIX = 'ignacio-draft-v1:';
export function saveDraft(path: string, raw: string) {
  safeStorage().setItem(`${PREFIX}${path}`, raw);
}
export function getDraft(path: string) {
  return safeStorage().getItem(`${PREFIX}${path}`);
}
export function removeDraft(path: string) {
  safeStorage().removeItem(`${PREFIX}${path}`);
}
