import { safeStorage } from '@/lib/storage';
import type { ContactMessage } from '@/types';

const KEY = 'ignacio-messages-v1';

/**
 * Seed messages exist only as demo data for the mock Studio. In production
 * builds `import.meta.env.DEV` is a literal `false`, so Rollup drops this
 * dynamic import and the seed content never reaches the bundle.
 */
async function loadSeedMessages(): Promise<ContactMessage[]> {
  if (import.meta.env.DEV) {
    const { seedMessages } = await import('@/mocks/content');
    return seedMessages as ContactMessage[];
  }
  return [];
}

export const seedMessages = await loadSeedMessages();

export function getStoredMessages(): ContactMessage[] | null {
  const storage = safeStorage();
  const saved = storage.getItem(KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as ContactMessage[];
    } catch {
      storage.removeItem(KEY);
    }
  }
  return null;
}

export function saveMessages(messages: ContactMessage[]) {
  safeStorage().setItem(KEY, JSON.stringify(messages));
}

export function getMessages(): ContactMessage[] {
  return getStoredMessages() ?? seedMessages;
}