import { seedMessages } from '@/mocks/content';
import { safeStorage } from '@/lib/storage';
import type { ContactMessage } from '@/types';
const KEY = 'ignacio-messages-v1';
export function getMessages(): ContactMessage[] {
  const storage = safeStorage();
  const saved = storage.getItem(KEY);
  if (saved)
    try {
      return JSON.parse(saved) as ContactMessage[];
    } catch {
      storage.removeItem(KEY);
    }
  return seedMessages as ContactMessage[];
}
export function saveMessages(messages: ContactMessage[]) {
  safeStorage().setItem(KEY, JSON.stringify(messages));
}
