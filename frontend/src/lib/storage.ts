const memory = new Map<string, string>();

const fallbackStorage: Storage = {
  get length() {
    return memory.size;
  },
  clear: () => memory.clear(),
  getItem: (key) => memory.get(key) ?? null,
  key: (index) => Array.from(memory.keys())[index] ?? null,
  removeItem: (key) => {
    memory.delete(key);
  },
  setItem: (key, value) => {
    memory.set(key, String(value));
  },
};

export function safeStorage(kind: 'local' | 'session' = 'local'): Storage {
  try {
    const storage = kind === 'local' ? globalThis.localStorage : globalThis.sessionStorage;
    if (storage) return storage;
  } catch {
    // Some sandboxed previews deny storage access. Use an in-memory adapter instead.
  }
  return fallbackStorage;
}
