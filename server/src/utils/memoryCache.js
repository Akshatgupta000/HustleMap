// Very small in-memory TTL cache for low-resource deployments.
// This keeps hot API responses briefly to reduce repeated DB load.
const cacheStore = new Map();

export const getCache = (key) => {
  const cached = cacheStore.get(key);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    return null;
  }

  return cached.value;
};

export const setCache = (key, value, ttlMs) => {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

export const deleteCache = (key) => {
  cacheStore.delete(key);
};

export const clearCacheByPrefix = (prefix) => {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
};

